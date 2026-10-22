import { randomUUID } from "node:crypto";
import { attemptSchema, evidenceSchema, publishedMissionSchema, type AgeBand, type CreateEvidence, type StartAttempt } from "../contracts/learning";
import type { Principal, SessionStore, StoredSession } from "./auth";
import type { LearnerRecord, LearningRepository } from "./repository";

/** Compatible with a pg Pool/PoolClient; the driver is intentionally deployment supplied. */
export interface SqlConnection {
  query<T extends Record<string, unknown> = Record<string, unknown>>(sql: string, values?: unknown[]): Promise<{ rows: T[] }>;
  release(): void;
}
export interface SqlPool { connect(): Promise<SqlConnection> }
type Row = Record<string, unknown>;
const iso = (value: unknown) => value instanceof Date ? value.toISOString() : new Date(String(value)).toISOString();
function attempt(row: Row) {
  return attemptSchema.parse({ id: row.id, learnerId: row.learner_id, missionVersionId: row.mission_version_id, status: row.status, createdAt: iso(row.created_at) });
}
function evidence(row: Row) {
  return evidenceSchema.parse({ id: row.id, learnerId: row.learner_id, attemptId: row.attempt_id, step: row.step, payload: row.payload, createdAt: iso(row.created_at), retentionUntil: iso(row.retention_until) });
}
function mission(row: Row) {
  return publishedMissionSchema.parse({ id: row.id, missionId: row.mission_id, version: row.version, title: row.title, ageBand: row.age_band, world: row.world, publishedAt: iso(row.published_at), content: row.content });
}
export class PostgresLearningRepository implements LearningRepository {
  constructor(private readonly pool: SqlPool) {}
  private async scoped<T>(principal: Principal, action: (client: SqlConnection) => Promise<T>): Promise<T> {
    const client = await this.pool.connect();
    try {
      await client.query("BEGIN");
      await client.query("SELECT set_config('educationos.tenant_id',$1,true), set_config('educationos.actor_kind',$2,true), set_config('educationos.account_id',$3,true), set_config('educationos.learner_id',$4,true)",
        [principal.tenantId, principal.kind, principal.kind === "adult" ? principal.accountId : "", principal.kind === "learner" ? principal.learnerId : ""]);
      const result = await action(client);
      await client.query("COMMIT");
      return result;
    } catch (error) { await client.query("ROLLBACK"); throw error; }
    finally { client.release(); }
  }
  learner(principal: Principal, learnerId: string): Promise<LearnerRecord | null> {
    return this.scoped(principal, async (client) => {
      const { rows } = await client.query("SELECT id,tenant_id,age_band,educationos.has_learning_access(tenant_id,id) AS consent_active FROM educationos.learners WHERE tenant_id=$1 AND id=$2", [principal.tenantId, learnerId]);
      const row = rows[0];
      if (!row) return null;
      const grants = await client.query("SELECT account_id,can_read,can_contribute FROM educationos.learner_grants WHERE tenant_id=$1 AND learner_id=$2 AND revoked_at IS NULL", [principal.tenantId, learnerId]);
      return { tenantId: String(row.tenant_id), learnerId: String(row.id), ageBand: row.age_band as AgeBand, consentActive: row.consent_active === true,
        adultGrants: grants.rows.map((grant) => ({ accountId: String(grant.account_id), canRead: grant.can_read === true, canContribute: grant.can_contribute === true })) };
    });
  }
  missions(principal: Principal, ageBand: AgeBand) {
    return this.scoped(principal, async (client) => (await client.query("SELECT * FROM educationos.mission_versions WHERE status='published' AND age_band=$1 ORDER BY mission_id,version DESC", [ageBand])).rows.map(mission));
  }
  mission(principal: Principal, versionId: string) {
    return this.scoped(principal, async (client) => {
      const row = (await client.query("SELECT * FROM educationos.mission_versions WHERE id=$1 AND status='published'", [versionId])).rows[0];
      return row ? mission(row) : null;
    });
  }
  start(principal: Principal, input: StartAttempt) {
    return this.scoped(principal, async (client) => attempt((await client.query("INSERT INTO educationos.attempts(id,tenant_id,learner_id,mission_version_id) VALUES ($1,$2,$3,$4) RETURNING *", [randomUUID(), principal.tenantId, input.learnerId, input.missionVersionId])).rows[0]));
  }
  attempt(principal: Principal, attemptId: string) {
    return this.scoped(principal, async (client) => {
      const row = (await client.query("SELECT * FROM educationos.attempts WHERE tenant_id=$1 AND id=$2", [principal.tenantId, attemptId])).rows[0];
      return row ? attempt(row) : null;
    });
  }
  evidence(principal: Principal, learnerId: string) {
    return this.scoped(principal, async (client) => (await client.query("SELECT * FROM educationos.evidence WHERE tenant_id=$1 AND learner_id=$2 AND retention_until > statement_timestamp() ORDER BY created_at,id LIMIT 200", [principal.tenantId, learnerId])).rows.map(evidence));
  }
  appendEvidence(principal: Principal, learnerId: string, input: CreateEvidence) {
    return this.scoped(principal, async (client) => evidence((await client.query("INSERT INTO educationos.evidence(id,tenant_id,learner_id,attempt_id,step,payload) VALUES ($1,$2,$3,$4,$5,$6::jsonb) RETURNING *", [randomUUID(), principal.tenantId, learnerId, input.attemptId, input.step, JSON.stringify(input.payload)])).rows[0]));
  }
  complete(principal: Principal, attemptId: string) {
    return this.scoped(principal, async (client) => {
      const current = (await client.query("SELECT * FROM educationos.attempts WHERE tenant_id=$1 AND id=$2 FOR UPDATE", [principal.tenantId, attemptId])).rows[0];
      if (!current) return null;
      if (current.status === "complete") return attempt(current);
      const count = (await client.query("SELECT count(DISTINCT step)::int AS total FROM educationos.evidence WHERE tenant_id=$1 AND learner_id=$2 AND attempt_id=$3 AND retention_until > statement_timestamp()", [principal.tenantId, current.learner_id, attemptId])).rows[0];
      if (count.total !== 7) return null;
      return attempt((await client.query("UPDATE educationos.attempts SET status='complete',completed_at=now() WHERE tenant_id=$1 AND id=$2 RETURNING *", [principal.tenantId, attemptId])).rows[0]);
    });
  }
}

/** Use a separate identity-service connection with a narrowly scoped session policy. */
export class PostgresSessionStore implements SessionStore {
  constructor(private readonly identityPool: SqlPool) {}
  async findByHash(tokenHash: string): Promise<StoredSession | null> {
    const client = await this.identityPool.connect();
    try {
      const row = (await client.query("SELECT tenant_id,actor_kind,account_id,learner_id,expires_at,revoked_at FROM educationos.sessions WHERE token_hash=$1 AND revoked_at IS NULL AND expires_at > statement_timestamp()", [tokenHash])).rows[0];
      if (!row) return null;
      const principal = row.actor_kind === "adult" ? { kind: "adult", tenantId: row.tenant_id, accountId: row.account_id } : { kind: "learner", tenantId: row.tenant_id, learnerId: row.learner_id };
      return { principal, expiresAt: new Date(String(row.expires_at)), revokedAt: row.revoked_at ? new Date(String(row.revoked_at)) : null };
    } finally { client.release(); }
  }
}
