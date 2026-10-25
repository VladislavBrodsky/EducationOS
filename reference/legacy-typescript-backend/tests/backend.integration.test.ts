import { readFile } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import { PGlite } from "@electric-sql/pglite";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { DEMO_MISSIONS } from "../src/content/missions";
import { hashSessionToken, newSessionToken, OpaqueCookieAuthenticator, SESSION_COOKIE, type Principal } from "../src/server/auth";
import type { Database, SqlExecutor } from "../src/server/database";
import { LearningRepository } from "../src/server/repository";

const tenant = "00000000-0000-4000-8000-000000000001";
const otherTenant = "00000000-0000-4000-8000-000000000002";
const adult = "00000000-0000-4000-8000-000000000011";
const otherAdult = "00000000-0000-4000-8000-000000000012";
const learner = "00000000-0000-4000-8000-000000000021";
const otherLearner = "00000000-0000-4000-8000-000000000022";
const child: Principal = { kind: "learner", tenantId: tenant, learnerId: learner };
const guardian: Principal = { kind: "adult", tenantId: tenant, accountId: adult };
const provider = "synthetic-test-provider";
const mission = DEMO_MISSIONS.find((candidate) => candidate.ageBand === "10-12")!;
let engine: PGlite;
let repository: LearningRepository;
let database: Database;
let token: string;
const query = async (sql: string, values: unknown[] = []) => engine.query(sql, values);

describe("PostgreSQL migration and consent-gated repository", () => {
  beforeAll(async () => {
    engine = new PGlite();
    await engine.exec(await readFile(new URL("../prisma/migrations/202610180001_foundation/migration.sql", import.meta.url), "utf8"));
    database = {
      query: async <Row extends Record<string, unknown>>(sql: string, values: unknown[] = []) => ({ rows: (await engine.query<Row>(sql, values)).rows }),
      transaction: async <T>(work: (transaction: SqlExecutor) => Promise<T>) => engine.transaction(async (tx) => work({ query: async <Row extends Record<string, unknown>>(sql: string, values: unknown[] = []) => ({ rows: (await tx.query<Row>(sql, values)).rows }) })),
    };
  });
  beforeEach(async () => {
    await engine.exec("TRUNCATE tenants, missions, rate_limit_buckets CASCADE");
    await query("INSERT INTO tenants (id,slug) VALUES ($1,'synthetic-one'),($2,'synthetic-two')", [tenant, otherTenant]);
    await query("INSERT INTO adult_accounts (id,tenant_id,provider_subject) VALUES ($1,$2,'synthetic-adult-one'),($3,$4,'synthetic-adult-two')", [adult, tenant, otherAdult, otherTenant]);
    await query("INSERT INTO learners (id,tenant_id,alias,age_band) VALUES ($1,$2,'Synthetic Learner','10-12'),($3,$4,'Synthetic Learner Two','10-12')", [learner, tenant, otherLearner, otherTenant]);
    await query("INSERT INTO guardian_grants (id,tenant_id,guardian_id,learner_id,can_read,can_contribute) VALUES ($1,$2,$3,$4,true,true)", [randomUUID(), tenant, adult, learner]);
    await query(`INSERT INTO consent_records (id,tenant_id,guardian_id,learner_id,purpose,policy_version,verification_provider,proof_reference,verified_at,expires_at)
      VALUES ($1,$2,$3,$4,'core_learning','synthetic-v1',$5,'opaque-synthetic-proof',CURRENT_TIMESTAMP - INTERVAL '1 day',CURRENT_TIMESTAMP + INTERVAL '30 days')`, [randomUUID(), tenant, adult, learner, provider]);
    for (const candidate of DEMO_MISSIONS) {
      await query("INSERT INTO missions (id,slug) VALUES ($1,$2) ON CONFLICT DO NOTHING", [candidate.missionId, `synthetic-${candidate.ageBand}`]);
      await query("INSERT INTO mission_versions (id,mission_id,version,title,age_band,world,content,published_at) VALUES ($1,$2,$3,$4,$5,$6,$7::jsonb,$8)", [candidate.id, candidate.missionId, candidate.version, candidate.title, candidate.ageBand, candidate.world, JSON.stringify(candidate.content), candidate.publishedAt]);
    }
    token = newSessionToken();
    await query("INSERT INTO sessions (id,tenant_id,token_hash,kind,learner_id,expires_at) VALUES ($1,$2,$3,'learner',$4,CURRENT_TIMESTAMP + INTERVAL '30 minutes')", [randomUUID(), tenant, hashSessionToken(token), learner]);
    repository = new LearningRepository(database, provider);
  });
  afterAll(async () => { await engine.close(); });

  it("authenticates an opaque cookie against PostgreSQL, creates evidence and reads an audited portfolio", async () => {
    const principal = await new OpaqueCookieAuthenticator(repository).authenticate(new Request("https://educationos.space/api", { headers: { cookie: `${SESSION_COOKIE}=${token}` } }));
    expect(principal).toEqual(child);
    const attempt = await repository.startAttempt(principal!, { learnerId: learner, missionVersionId: mission.id }, randomUUID());
    const evidence = await repository.createEvidence(principal!, { attemptId: attempt.id, step: "experiment", payload: { kind: "measurement", label: "Synthetic bridge test", value: 12, unit: "seconds" } }, randomUUID());
    const portfolio = await repository.portfolio(guardian, learner, randomUUID());
    expect(portfolio.attempts).toEqual([attempt]);
    expect(portfolio.evidence).toEqual([evidence]);
    expect(new Date(evidence.retentionUntil).getTime() - new Date(evidence.createdAt).getTime()).toBe(90 * 86400000);
    const audit = await query("SELECT action FROM audit_events ORDER BY created_at,action");
    expect(audit.rows).toHaveLength(3);
    expect(JSON.stringify(await query("SELECT * FROM audit_events"))).not.toContain("Synthetic bridge test");
  });

  it("rejects expired, revoked, malformed and duplicate-cookie sessions", async () => {
    const auth = new OpaqueCookieAuthenticator(repository);
    const request = (cookie: string) => new Request("https://educationos.space/api", { headers: { cookie } });
    expect(await auth.authenticate(request(`${SESSION_COOKIE}=${token}; ${SESSION_COOKIE}=${token}`))).toBeNull();
    expect(await auth.authenticate(request(`${SESSION_COOKIE}=invalid`))).toBeNull();
    await query("UPDATE sessions SET expires_at = CURRENT_TIMESTAMP - INTERVAL '1 second'");
    expect(await auth.authenticate(request(`${SESSION_COOKIE}=${token}`))).toBeNull();
    await query("UPDATE sessions SET expires_at = CURRENT_TIMESTAMP + INTERVAL '1 hour', revoked_at = CURRENT_TIMESTAMP");
    expect(await auth.authenticate(request(`${SESSION_COOKIE}=${token}`))).toBeNull();
  });

  it("fails closed across tenants and for unrelated learners", async () => {
    await expect(repository.portfolio(child, otherLearner, randomUUID())).rejects.toMatchObject({ status: 404 });
    await expect(repository.portfolio({ kind: "learner", tenantId: tenant, learnerId: randomUUID() }, learner, randomUUID())).rejects.toMatchObject({ status: 403 });
    await expect(repository.startAttempt({ kind: "adult", tenantId: tenant, accountId: otherAdult }, { learnerId: learner, missionVersionId: mission.id }, randomUUID())).rejects.toMatchObject({ status: 403 });
  });

  it("keeps read permission distinct from evidence contribution", async () => {
    await query("UPDATE guardian_grants SET can_contribute = false");
    expect(await repository.portfolio(guardian, learner, randomUUID())).toEqual({ attempts: [], evidence: [] });
    await expect(repository.startAttempt(guardian, { learnerId: learner, missionVersionId: mission.id }, randomUUID())).rejects.toMatchObject({ status: 403 });
  });

  it.each(["revoked", "expired", "future", "wrong-provider", "revoked-grant"])("blocks learning with %s consent", async (condition) => {
    if (condition === "revoked") await query("UPDATE consent_records SET revoked_at = CURRENT_TIMESTAMP");
    if (condition === "expired") await query("UPDATE consent_records SET expires_at = CURRENT_TIMESTAMP - INTERVAL '1 hour'");
    if (condition === "future") await query("UPDATE consent_records SET verified_at = CURRENT_TIMESTAMP + INTERVAL '1 hour'");
    if (condition === "wrong-provider") repository = new LearningRepository(database, "another-provider");
    if (condition === "revoked-grant") await query("UPDATE guardian_grants SET revoked_at = CURRENT_TIMESTAMP");
    await expect(repository.startAttempt(child, { learnerId: learner, missionVersionId: mission.id }, randomUUID())).rejects.toMatchObject({ status: 403 });
    expect((await query("SELECT * FROM attempts")).rows).toHaveLength(0);
  });

  it("requires a published mission for the learner age band", async () => {
    const younger = DEMO_MISSIONS.find((candidate) => candidate.ageBand === "5-6")!;
    await expect(repository.startAttempt(child, { learnerId: learner, missionVersionId: younger.id }, randomUUID())).rejects.toMatchObject({ status: 404 });
    expect((await repository.publishedMissions()).length).toBe(5);
  });

  it("makes published versions immutable and rejects cross-tenant database relationships", async () => {
    await expect(query("UPDATE mission_versions SET title = 'Changed' WHERE id = $1", [mission.id])).rejects.toThrow("immutable");
    await expect(query("INSERT INTO guardian_grants (id,tenant_id,guardian_id,learner_id) VALUES ($1,$2,$3,$4)", [randomUUID(), tenant, adult, otherLearner])).rejects.toThrow();
    await expect(query("INSERT INTO sessions (id,tenant_id,token_hash,kind,account_id,learner_id,expires_at) VALUES ($1,$2,$3,'learner',$4,$5,CURRENT_TIMESTAMP)", [randomUUID(), tenant, "a".repeat(64), adult, learner])).rejects.toThrow();
  });

  it("rolls back a learning write when its audit write fails", async () => {
    await expect(repository.startAttempt(child, { learnerId: learner, missionVersionId: mission.id }, "invalid-request-uuid")).rejects.toThrow();
    expect((await query("SELECT * FROM attempts")).rows).toHaveLength(0);
  });

  it("shares an atomic durable rate limit across repository instances and resets expired buckets", async () => {
    const second = new LearningRepository(database, provider);
    expect(await repository.consumeRateLimit("synthetic-actor", 2, 60)).toBe(true);
    expect(await second.consumeRateLimit("synthetic-actor", 2, 60)).toBe(true);
    expect(await repository.consumeRateLimit("synthetic-actor", 2, 60)).toBe(false);
    await query("UPDATE rate_limit_buckets SET expires_at = CURRENT_TIMESTAMP - INTERVAL '1 second'");
    expect(await second.consumeRateLimit("synthetic-actor", 2, 60)).toBe(true);
    expect(JSON.stringify((await query("SELECT * FROM rate_limit_buckets")).rows)).not.toContain("synthetic-actor");
  });

  it("hides expired evidence and refuses writes to completed attempts", async () => {
    const attempt = await repository.startAttempt(child, { learnerId: learner, missionVersionId: mission.id }, randomUUID());
    await repository.createEvidence(child, { attemptId: attempt.id, step: "imagine", payload: { kind: "idea", text: "Synthetic idea" } }, randomUUID());
    await query("UPDATE evidence SET created_at = CURRENT_TIMESTAMP - INTERVAL '100 days', retention_until = CURRENT_TIMESTAMP - INTERVAL '1 day'");
    expect((await repository.portfolio(child, learner, randomUUID())).evidence).toEqual([]);
    await query("UPDATE attempts SET status = 'complete'");
    await expect(repository.createEvidence(child, { attemptId: attempt.id, step: "reflect", payload: { kind: "reflection", text: "Synthetic reflection" } }, randomUUID())).rejects.toMatchObject({ status: 403 });
  });
});
