import { createHash, randomUUID } from "node:crypto";
import { attemptSchema, evidenceSchema, publishedMissionSchema, type Attempt, type CreateEvidence, type Evidence, type PublishedMission, type StartAttempt } from "../contracts/learning";
import type { Principal, SessionStore, StoredSession } from "./auth";
import type { Database, SqlExecutor } from "./database";
import { ApiError } from "./errors";
import { canAccessLearner, type LearnerBoundary } from "./permissions";

interface BoundaryRow extends Record<string, unknown> { tenant_id: string; learner_id: string; age_band: string; consent_active: boolean }
interface SessionRow extends Record<string, unknown> { kind: string; tenant_id: string; account_id: string | null; learner_id: string | null; expires_at: Date | string; revoked_at: Date | string | null }
interface AttemptRow extends Record<string, unknown> { id: string; learner_id: string; mission_version_id: string; status: "active" | "complete"; created_at: Date | string }
interface EvidenceRow extends Record<string, unknown> { id: string; learner_id: string; attempt_id: string; step: string; payload: unknown; created_at: Date | string; retention_until: Date | string }
const iso = (value: Date | string) => new Date(value).toISOString();
const mapAttempt = (row: AttemptRow): Attempt => attemptSchema.parse({ id: row.id, learnerId: row.learner_id, missionVersionId: row.mission_version_id, status: row.status, createdAt: iso(row.created_at) });
const mapEvidence = (row: EvidenceRow): Evidence => evidenceSchema.parse({ id: row.id, learnerId: row.learner_id, attemptId: row.attempt_id, step: row.step, payload: row.payload, createdAt: iso(row.created_at), retentionUntil: iso(row.retention_until) });

export class LearningRepository implements SessionStore {
  constructor(private readonly database: Database, private readonly verifiedConsentProvider: string) {}

  async findByHash(tokenHash: string): Promise<StoredSession | null> {
    const { rows } = await this.database.query<SessionRow>("SELECT kind, tenant_id, account_id, learner_id, expires_at, revoked_at FROM sessions WHERE token_hash = $1", [tokenHash]);
    const row = rows[0];
    if (!row) return null;
    return {
      principal: row.kind === "adult" ? { kind: "adult", tenantId: row.tenant_id, accountId: row.account_id } : { kind: "learner", tenantId: row.tenant_id, learnerId: row.learner_id },
      expiresAt: new Date(row.expires_at), revokedAt: row.revoked_at ? new Date(row.revoked_at) : null,
    };
  }

  private async authorize(executor: SqlExecutor, principal: Principal, learnerId: string, action: "read" | "contribute"): Promise<BoundaryRow> {
    // Tenant filtering happens before authorization; foreign tenant IDs are indistinguishable from missing IDs.
    const { rows } = await executor.query<BoundaryRow>(
      "SELECT l.id AS learner_id, l.tenant_id, l.age_band FROM learners l WHERE l.id = $1 AND l.tenant_id = $2 FOR SHARE OF l", [learnerId, principal.tenantId]);
    const row = rows[0];
    if (!row) throw new ApiError(404, "NOT_FOUND", "Learning record unavailable.");
    // Hold the qualifying consent and grant locks through the data/audit transaction,
    // so a concurrent consent or guardian-access revocation serializes with this request.
    const consent = await executor.query<{ id: string }>(`
      SELECT c.id FROM consent_records c
      JOIN guardian_grants g ON g.guardian_id = c.guardian_id AND g.learner_id = c.learner_id AND g.tenant_id = c.tenant_id
      WHERE c.learner_id = $1 AND c.tenant_id = $2 AND c.purpose = 'core_learning'
        AND c.verification_provider = $3 AND c.verified_at <= CURRENT_TIMESTAMP
        AND c.expires_at > CURRENT_TIMESTAMP AND c.revoked_at IS NULL AND g.revoked_at IS NULL AND g.can_read
      FOR SHARE OF c,g`, [learnerId, principal.tenantId, this.verifiedConsentProvider]);
    const grants = await executor.query<{ account_id: string; can_read: boolean; can_contribute: boolean }>(
      "SELECT guardian_id AS account_id, can_read, can_contribute FROM guardian_grants WHERE learner_id = $1 AND tenant_id = $2 AND revoked_at IS NULL FOR SHARE", [learnerId, principal.tenantId]);
    const boundary: LearnerBoundary = { tenantId: row.tenant_id, learnerId: row.learner_id, consentActive: consent.rows.length > 0 && this.verifiedConsentProvider.length > 0, adultGrants: grants.rows.map((grant) => ({ accountId: grant.account_id, canRead: grant.can_read, canContribute: grant.can_contribute })) };
    if (!canAccessLearner(principal, boundary, action)) throw new ApiError(403, "FORBIDDEN", "Learning access requires a current guardian grant and verified consent.");
    return row;
  }

  private async audit(executor: SqlExecutor, principal: Principal, action: string, subjectId: string, requestId: string): Promise<void> {
    await executor.query("INSERT INTO audit_events (id, tenant_id, actor_kind, actor_id, action, subject_id, request_id) VALUES ($1,$2,$3,$4,$5,$6,$7)",
      [randomUUID(), principal.tenantId, principal.kind, principal.kind === "adult" ? principal.accountId : principal.learnerId, action, subjectId, requestId]);
  }

  async startAttempt(principal: Principal, input: StartAttempt, requestId: string): Promise<Attempt> {
    return this.database.transaction(async (tx) => {
      const learner = await this.authorize(tx, principal, input.learnerId, "contribute");
      const { rows } = await tx.query<{ age_band: string }>("SELECT age_band FROM mission_versions WHERE id = $1 AND published_at <= CURRENT_TIMESTAMP", [input.missionVersionId]);
      if (!rows[0] || rows[0].age_band !== learner.age_band) throw new ApiError(404, "NOT_FOUND", "An age-appropriate published mission is required.");
      const inserted = await tx.query<AttemptRow>("INSERT INTO attempts (id, tenant_id, learner_id, mission_version_id) VALUES ($1,$2,$3,$4) RETURNING *", [randomUUID(), principal.tenantId, input.learnerId, input.missionVersionId]);
      await this.audit(tx, principal, "attempt.created", inserted.rows[0].id, requestId);
      return mapAttempt(inserted.rows[0]);
    });
  }

  async createEvidence(principal: Principal, input: CreateEvidence, requestId: string): Promise<Evidence> {
    return this.database.transaction(async (tx) => {
      const attempt = await tx.query<AttemptRow>("SELECT * FROM attempts WHERE id = $1 AND tenant_id = $2 FOR UPDATE", [input.attemptId, principal.tenantId]);
      if (!attempt.rows[0]) throw new ApiError(404, "NOT_FOUND", "Learning record unavailable.");
      await this.authorize(tx, principal, attempt.rows[0].learner_id, "contribute");
      if (attempt.rows[0].status !== "active") throw new ApiError(403, "FORBIDDEN", "This learning attempt is closed.");
      // A bounded draft retention policy; deployment must run the documented deletion worker.
      const inserted = await tx.query<EvidenceRow>(`INSERT INTO evidence (id,tenant_id,learner_id,attempt_id,step,payload,retention_until)
        VALUES ($1,$2,$3,$4,$5,$6::jsonb,CURRENT_TIMESTAMP + INTERVAL '90 days') RETURNING *`,
      [randomUUID(), principal.tenantId, attempt.rows[0].learner_id, input.attemptId, input.step, JSON.stringify(input.payload)]);
      await this.audit(tx, principal, "evidence.created", inserted.rows[0].id, requestId);
      return mapEvidence(inserted.rows[0]);
    });
  }

  async portfolio(principal: Principal, learnerId: string, requestId: string): Promise<{ attempts: Attempt[]; evidence: Evidence[] }> {
    return this.database.transaction(async (tx) => {
      await this.authorize(tx, principal, learnerId, "read");
      const attempts = await tx.query<AttemptRow>("SELECT * FROM attempts WHERE learner_id = $1 AND tenant_id = $2 ORDER BY created_at DESC, id LIMIT 100", [learnerId, principal.tenantId]);
      const evidence = await tx.query<EvidenceRow>("SELECT * FROM evidence WHERE learner_id = $1 AND tenant_id = $2 AND retention_until > CURRENT_TIMESTAMP ORDER BY created_at DESC, id LIMIT 200", [learnerId, principal.tenantId]);
      await this.audit(tx, principal, "portfolio.read", learnerId, requestId);
      return { attempts: attempts.rows.map(mapAttempt), evidence: evidence.rows.map(mapEvidence) };
    });
  }

  async publishedMissions(): Promise<PublishedMission[]> {
    const result = await this.database.query<{ id: string; mission_id: string; version: number; title: string; age_band: string; world: string; content: unknown; published_at: Date | string }>("SELECT * FROM mission_versions WHERE published_at <= CURRENT_TIMESTAMP ORDER BY age_band, version DESC");
    return result.rows.map((row) => publishedMissionSchema.parse({ id: row.id, missionId: row.mission_id, version: row.version, title: row.title, ageBand: row.age_band, world: row.world, content: row.content, publishedAt: iso(row.published_at) }));
  }

  async consumeRateLimit(key: string, limit: number, windowSeconds: number): Promise<boolean> {
    const keyHash = createHash("sha256").update(key).digest("hex");
    const result = await this.database.query<{ count: number }>(`INSERT INTO rate_limit_buckets (key, count, expires_at)
      VALUES ($1,1,CURRENT_TIMESTAMP + $2 * INTERVAL '1 second')
      ON CONFLICT (key) DO UPDATE SET count = CASE WHEN rate_limit_buckets.expires_at <= CURRENT_TIMESTAMP THEN 1 ELSE rate_limit_buckets.count + 1 END,
        expires_at = CASE WHEN rate_limit_buckets.expires_at <= CURRENT_TIMESTAMP THEN CURRENT_TIMESTAMP + $2 * INTERVAL '1 second' ELSE rate_limit_buckets.expires_at END
      RETURNING count`, [keyHash, windowSeconds]);
    return result.rows[0].count <= limit;
  }
}
