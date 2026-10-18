import { readFileSync } from "node:fs";
import { PGlite } from "@electric-sql/pglite";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { stepKinds } from "../src/contracts/learning";
import { PostgresLearningRepository, type SqlPool } from "../src/server/postgres";

const up = readFileSync(new URL("../db/migrations/001_foundation.up.sql", import.meta.url), "utf8");
const down = readFileSync(new URL("../db/migrations/001_foundation.down.sql", import.meta.url), "utf8");
const role = readFileSync(new URL("../db/application-role.sql", import.meta.url), "utf8");
const ids = {
  tenant: "10000000-0000-4000-8000-000000000001", tenant2: "10000000-0000-4000-8000-000000000002",
  guardian: "20000000-0000-4000-8000-000000000001", reader: "20000000-0000-4000-8000-000000000002", outsider: "20000000-0000-4000-8000-000000000003",
  learner: "30000000-0000-4000-8000-000000000001", sibling: "30000000-0000-4000-8000-000000000002", foreignLearner: "30000000-0000-4000-8000-000000000003",
  mission: "40000000-0000-4000-8000-000000000001", v1: "40000000-0000-4000-8000-000000000002", v2: "40000000-0000-4000-8000-000000000003", draft: "40000000-0000-4000-8000-000000000004",
  attempt: "50000000-0000-4000-8000-000000000001", siblingAttempt: "50000000-0000-4000-8000-000000000002", foreignAttempt: "50000000-0000-4000-8000-000000000003",
};
const content = { summary: "Build a strong, light paper bridge.", materials: ["Paper", "Two books", "Large lightweight blocks"], adultGuidance: "Adult supervision; low table.", steps: stepKinds.map((kind) => ({ kind, title: kind, prompt: "Use a synthetic example." })) };

describe("PostgreSQL migration, storage contracts and non-owner RLS", () => {
  let db: PGlite;
  beforeAll(async () => {
    db = new PGlite();
    await db.exec(up);
    await db.exec(role);
    for (const tenant of [ids.tenant, ids.tenant2]) await db.query("INSERT INTO educationos.tenants(id) VALUES ($1)", [tenant]);
    for (const [id, tenant] of [[ids.guardian, ids.tenant], [ids.reader, ids.tenant], [ids.outsider, ids.tenant2]]) await db.query("INSERT INTO educationos.adult_accounts(id,tenant_id,identity_subject) VALUES ($1,$2,$3)", [id, tenant, `synthetic:${id}`]);
    for (const [id, tenant] of [[ids.learner, ids.tenant], [ids.sibling, ids.tenant], [ids.foreignLearner, ids.tenant2]]) await db.query("INSERT INTO educationos.learners(id,tenant_id,age_band) VALUES ($1,$2,'10-12')", [id, tenant]);
    await db.query("INSERT INTO educationos.learner_grants(tenant_id,learner_id,account_id,relationship,can_contribute) VALUES ($1,$2,$3,'guardian',true),($1,$2,$4,'educator',false)", [ids.tenant, ids.learner, ids.guardian, ids.reader]);
    await db.query("INSERT INTO educationos.learner_grants(tenant_id,learner_id,account_id,relationship,can_contribute) VALUES ($1,$2,$3,'guardian',true)", [ids.tenant2, ids.foreignLearner, ids.outsider]);
    for (const [learner, tenant, guardian, suffix] of [[ids.learner, ids.tenant, ids.guardian, "1"], [ids.sibling, ids.tenant, ids.guardian, "2"], [ids.foreignLearner, ids.tenant2, ids.outsider, "3"]]) {
      await db.query("INSERT INTO educationos.consent_records(id,tenant_id,learner_id,guardian_account_id,notice_version,purpose,granted_at,expires_at) VALUES ($1,$2,$3,$4,'synthetic-v1','learning-evidence',now()-interval '1 hour',now()+interval '1 day')", [`60000000-0000-4000-8000-00000000000${suffix}`, tenant, learner, guardian]);
    }
    await db.query("INSERT INTO educationos.missions(id,slug) VALUES ($1,'paper-bridge')", [ids.mission]);
    for (const [id, version, status] of [[ids.v1, 1, "published"], [ids.v2, 2, "published"], [ids.draft, 3, "draft"]] as const) await db.query("INSERT INTO educationos.mission_versions(id,mission_id,version,status,title,age_band,world,content,published_at) VALUES ($1,$2,$3,$4,'Strong and light','10-12','orbit-lab',$5::jsonb,CASE WHEN $4='published' THEN now() ELSE NULL END)", [id, ids.mission, version, status, JSON.stringify(content)]);
    for (const [id, tenant, learner] of [[ids.attempt, ids.tenant, ids.learner], [ids.siblingAttempt, ids.tenant, ids.sibling], [ids.foreignAttempt, ids.tenant2, ids.foreignLearner]]) await db.query("INSERT INTO educationos.attempts(id,tenant_id,learner_id,mission_version_id) VALUES ($1,$2,$3,$4)", [id, tenant, learner, ids.v1]);
  });
  afterAll(async () => { await db?.close(); });
  async function scoped<T>(actor: "learner" | "adult", tenantId: string, actorId: string, action: () => Promise<T>): Promise<T> {
    await db.exec("SET ROLE educationos_app; BEGIN");
    try {
      await db.query("SELECT set_config('educationos.tenant_id',$1,true),set_config('educationos.actor_kind',$2,true),set_config('educationos.learner_id',$3,true),set_config('educationos.account_id',$4,true)", [tenantId, actor, actor === "learner" ? actorId : "", actor === "adult" ? actorId : ""]);
      return await action();
    } finally { await db.exec("ROLLBACK; RESET ROLE"); }
  }
  it("applies real DDL, defaults to deny with no actor context and does not expose sessions", async () => {
    await db.exec("SET ROLE educationos_app");
    try {
      expect((await db.query("SELECT * FROM educationos.attempts")).rows).toEqual([]);
      await expect(db.query("SELECT * FROM educationos.sessions")).rejects.toThrow(/permission denied/);
    } finally { await db.exec("RESET ROLE"); }
  });
  it("permits only own learner rows and blocks sibling and tenant reads/writes", async () => {
    await scoped("learner", ids.tenant, ids.learner, async () => {
      expect((await db.query<{ id: string }>("SELECT id FROM educationos.attempts")).rows.map((row) => row.id)).toEqual([ids.attempt]);
      expect((await db.query("SELECT * FROM educationos.learners WHERE id=$1", [ids.sibling])).rows).toEqual([]);
      expect((await db.query("SELECT * FROM educationos.attempts WHERE tenant_id=$1", [ids.tenant2])).rows).toEqual([]);
      await expect(db.query("INSERT INTO educationos.evidence(id,tenant_id,learner_id,attempt_id,step,payload) VALUES ('70000000-0000-4000-8000-000000000001',$1,$2,$3,'notice','{\"kind\":\"observation\",\"text\":\"Synthetic\"}')", [ids.tenant, ids.sibling, ids.siblingAttempt])).rejects.toThrow();
    });
    await scoped("learner", ids.tenant, ids.learner, async () => {
      await expect(db.query("INSERT INTO educationos.attempts(id,tenant_id,learner_id,mission_version_id) VALUES ('70000000-0000-4000-8000-000000000002',$1,$2,$3)", [ids.tenant2, ids.foreignLearner, ids.v1])).rejects.toThrow();
    });
  });
  it("honors linked adult read access while rejecting contribution and unlinked adults", async () => {
    await scoped("adult", ids.tenant, ids.reader, async () => {
      expect((await db.query("SELECT id FROM educationos.attempts")).rows).toEqual([{ id: ids.attempt }]);
      await expect(db.query("INSERT INTO educationos.attempts(id,tenant_id,learner_id,mission_version_id) VALUES ('70000000-0000-4000-8000-000000000003',$1,$2,$3)", [ids.tenant, ids.learner, ids.v1])).rejects.toThrow(/row-level security/);
    });
    await scoped("adult", ids.tenant, ids.outsider, async () => { expect((await db.query("SELECT id FROM educationos.attempts")).rows).toEqual([]); });
    await scoped("adult", ids.tenant, ids.guardian, async () => { expect((await db.query("SELECT id FROM educationos.attempts")).rows).toEqual([{ id: ids.attempt }]); });
  });
  it("hides attempts when consent is revoked", async () => {
    await db.query("UPDATE educationos.consent_records SET revoked_at=now() WHERE learner_id=$1", [ids.learner]);
    try { await scoped("learner", ids.tenant, ids.learner, async () => { expect((await db.query("SELECT * FROM educationos.attempts")).rows).toEqual([]); }); }
    finally { await db.query("UPDATE educationos.consent_records SET revoked_at=NULL WHERE learner_id=$1", [ids.learner]); }
  });
  it("denies expired or future consent and expires evidence before a privileged purge", async () => {
    await db.query("UPDATE educationos.consent_records SET expires_at=now()-interval '1 minute',granted_at=now()-interval '1 day' WHERE learner_id=$1", [ids.sibling]);
    try { await scoped("learner", ids.tenant, ids.sibling, async () => { expect((await db.query("SELECT id FROM educationos.attempts")).rows).toEqual([]); }); }
    finally { await db.query("UPDATE educationos.consent_records SET granted_at=now()-interval '1 hour',expires_at=now()+interval '1 day' WHERE learner_id=$1", [ids.sibling]); }
    await db.query("UPDATE educationos.consent_records SET granted_at=now()+interval '1 hour',expires_at=now()+interval '1 day' WHERE learner_id=$1", [ids.sibling]);
    try { await scoped("learner", ids.tenant, ids.sibling, async () => { expect((await db.query("SELECT id FROM educationos.attempts")).rows).toEqual([]); }); }
    finally { await db.query("UPDATE educationos.consent_records SET granted_at=now()-interval '1 hour' WHERE learner_id=$1", [ids.sibling]); }
    await db.query("INSERT INTO educationos.evidence(id,tenant_id,learner_id,attempt_id,step,payload,created_at,retention_until) VALUES ('70000000-0000-4000-8000-000000000008',$1,$2,$3,'notice','{\"kind\":\"observation\",\"text\":\"Expired synthetic example\"}',now()-interval '31 days',now()-interval '1 day')", [ids.tenant, ids.sibling, ids.siblingAttempt]);
    await scoped("learner", ids.tenant, ids.sibling, async () => { expect((await db.query("SELECT id FROM educationos.evidence")).rows).toEqual([]); });
    expect((await db.query("SELECT id FROM educationos.evidence WHERE id='70000000-0000-4000-8000-000000000008'")).rows).toHaveLength(1);
    await db.exec(readFileSync(new URL("../db/retention.sql", import.meta.url), "utf8"));
    expect((await db.query("SELECT id FROM educationos.evidence WHERE id='70000000-0000-4000-8000-000000000008'")).rows).toEqual([]);
  });
  it("enforces publication immutability and prevents attempts switching versions", async () => {
    await expect(db.query("UPDATE educationos.mission_versions SET title='Changed' WHERE id=$1", [ids.v1])).rejects.toThrow(/immutable/);
    await expect(db.query("DELETE FROM educationos.mission_versions WHERE id=$1", [ids.v2])).rejects.toThrow(/immutable/);
    await expect(db.query("UPDATE educationos.attempts SET mission_version_id=$1 WHERE id=$2", [ids.v2, ids.attempt])).rejects.toThrow(/pinned/);
    await expect(db.query("INSERT INTO educationos.attempts(id,tenant_id,learner_id,mission_version_id) VALUES ('70000000-0000-4000-8000-000000000004',$1,$2,$3)", [ids.tenant, ids.learner, ids.draft])).rejects.toThrow(/Published mission/);
    await scoped("learner", ids.tenant, ids.learner, async () => { expect((await db.query("SELECT id FROM educationos.mission_versions ORDER BY version")).rows).toEqual([{ id: ids.v1 }, { id: ids.v2 }]); });
  });
  it("enforces evidence shape, append-only updates, attempt ownership, and seven-step completion", async () => {
    await expect(db.query("UPDATE educationos.attempts SET status='complete',completed_at=now() WHERE id=$1", [ids.attempt])).rejects.toThrow(/seven steps/);
    await expect(db.query("INSERT INTO educationos.evidence(id,tenant_id,learner_id,attempt_id,step,payload) VALUES ('70000000-0000-4000-8000-000000000005',$1,$2,$3,'notice','{\"kind\":\"observation\",\"text\":\"Synthetic\",\"role\":\"admin\"}')", [ids.tenant, ids.learner, ids.attempt])).rejects.toThrow(/Invalid text/);
    await expect(db.query("INSERT INTO educationos.evidence(id,tenant_id,learner_id,attempt_id,step,payload) VALUES ('70000000-0000-4000-8000-000000000006',$1,$2,$3,'notice','{\"kind\":\"observation\",\"text\":\"Synthetic\"}')", [ids.tenant, ids.learner, ids.siblingAttempt])).rejects.toThrow(/active scoped attempt/);
    for (const [index, step] of stepKinds.entries()) await db.query("INSERT INTO educationos.evidence(id,tenant_id,learner_id,attempt_id,step,payload) VALUES ($1,$2,$3,$4,$5,'{\"kind\":\"observation\",\"text\":\"Synthetic example\"}')", [`80000000-0000-4000-8000-00000000000${index}`, ids.tenant, ids.learner, ids.attempt, step]);
    await expect(db.query("UPDATE educationos.evidence SET payload='{}' WHERE attempt_id=$1", [ids.attempt])).rejects.toThrow(/append only/);
    await db.query("UPDATE educationos.attempts SET status='complete',completed_at=now() WHERE id=$1", [ids.attempt]);
    await expect(db.query("INSERT INTO educationos.evidence(id,tenant_id,learner_id,attempt_id,step,payload) VALUES ('70000000-0000-4000-8000-000000000007',$1,$2,$3,'reflect','{\"kind\":\"reflection\",\"text\":\"Synthetic\"}')", [ids.tenant, ids.learner, ids.attempt])).rejects.toThrow(/active scoped attempt/);
  });
  it("executes the parameterized repository with RLS and clears transaction context", async () => {
    await db.exec("SET ROLE educationos_app");
    try {
      const pool = { connect: async () => ({ query: (sql: string, values?: unknown[]) => db.query(sql, values), release: () => {} }) } as SqlPool;
      const repository = new PostgresLearningRepository(pool);
      const principal = { kind: "learner" as const, tenantId: ids.tenant, learnerId: ids.learner };
      expect((await repository.learner(principal, ids.learner))?.consentActive).toBe(true);
      expect(await repository.learner(principal, ids.sibling)).toBeNull();
      expect((await repository.missions(principal, "10-12"))).toHaveLength(2);
      expect((await repository.attempt(principal, ids.attempt))?.missionVersionId).toBe(ids.v1);
      expect((await repository.evidence(principal, ids.learner))).toHaveLength(7);
      expect((await db.query("SELECT * FROM educationos.attempts")).rows).toEqual([]);
    } finally { await db.exec("RESET ROLE"); }
  });
  it("runs the real repository vertical slice, enforcing read-only and cross-tenant boundaries", async () => {
    await db.exec("SET ROLE educationos_app");
    try {
      const pool = { connect: async () => ({ query: (sql: string, values?: unknown[]) => db.query(sql, values), release: () => {} }) } as SqlPool;
      const repository = new PostgresLearningRepository(pool);
      const principal = { kind: "learner" as const, tenantId: ids.tenant, learnerId: ids.learner };
      const learner = await repository.learner(principal, ids.learner);
      expect(learner).toMatchObject({ learnerId: ids.learner, ageBand: "10-12", consentActive: true });
      const missions = await repository.missions(principal, learner!.ageBand);
      const selected = missions.find((mission) => mission.id === ids.v2)!;
      expect(selected.content.steps.map((step) => step.kind)).toEqual(stepKinds);
      const started = await repository.start(principal, { learnerId: ids.learner, missionVersionId: selected.id });
      expect(started).toMatchObject({ learnerId: ids.learner, missionVersionId: ids.v2, status: "active" });
      expect(started.createdAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
      expect(await repository.complete(principal, started.id)).toBeNull();
      for (const step of stepKinds) {
        const input = { attemptId: started.id, step, payload: step === "experiment" ? { kind: "measurement" as const, label: "Folded bridge", value: 4, unit: "blocks" as const } : { kind: "observation" as const, text: `Synthetic ${step} evidence.` } };
        const saved = await repository.appendEvidence(principal, ids.learner, input);
        expect(saved).toMatchObject({ attemptId: started.id, learnerId: ids.learner, step, payload: input.payload });
        expect(Date.parse(saved.retentionUntil) - Date.parse(saved.createdAt)).toBe(30 * 24 * 60 * 60 * 1000);
      }
      const completed = await repository.complete(principal, started.id);
      expect(completed).toMatchObject({ id: started.id, missionVersionId: ids.v2, status: "complete" });
      expect(await repository.complete(principal, started.id)).toEqual(completed);
      expect((await repository.evidence(principal, ids.learner)).filter((entry) => entry.attemptId === started.id)).toHaveLength(7);
      const reader = { kind: "adult" as const, tenantId: ids.tenant, accountId: ids.reader };
      expect((await repository.learner(reader, ids.learner))?.adultGrants).toEqual([{ accountId: ids.reader, canRead: true, canContribute: false }]);
      expect((await repository.attempt(reader, started.id))?.status).toBe("complete");
      await expect(repository.start(reader, { learnerId: ids.learner, missionVersionId: ids.v2 })).rejects.toThrow(/row-level security/);
      await expect(repository.start(principal, { learnerId: ids.foreignLearner, missionVersionId: ids.v2 })).rejects.toThrow();
      expect(await repository.learner(principal, ids.foreignLearner)).toBeNull();
      expect((await db.query("SELECT * FROM educationos.attempts")).rows).toEqual([]);
    } finally { await db.exec("RESET ROLE"); }
  });
});

it("rolls the migration down and reapplies it in a disposable database", async () => {
  const db = new PGlite();
  try {
    await db.exec(up);
    await db.exec(down);
    expect((await db.query("SELECT to_regnamespace('educationos') AS schema")).rows).toEqual([{ schema: null }]);
    await db.exec(up);
    expect((await db.query("SELECT count(*)::int AS total FROM educationos.mission_versions")).rows).toEqual([{ total: 0 }]);
  } finally { await db.close(); }
});
