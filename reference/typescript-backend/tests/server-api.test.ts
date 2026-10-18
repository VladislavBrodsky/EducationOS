import { beforeEach, describe, expect, it, vi } from "vitest";
import { stepKinds, type PublishedMission } from "../src/contracts/learning";
import { createLearningApi } from "../src/server/api";
import { OpaqueCookieAuthenticator } from "../src/server/auth";
import type { LearnerRecord, LearningRepository } from "../src/server/repository";

const tenantId = "10000000-0000-4000-8000-000000000001";
const learnerId = "10000000-0000-4000-8000-000000000002";
const otherId = "10000000-0000-4000-8000-000000000003";
const versionId = "10000000-0000-4000-8000-000000000004";
const attemptId = "10000000-0000-4000-8000-000000000005";
const origin = "https://education.example";
const learner: LearnerRecord = { tenantId, learnerId, ageBand: "10-12", consentActive: true, adultGrants: [] };
const mission: PublishedMission = { id: versionId, missionId: otherId, version: 1, title: "Strong and light", ageBand: "10-12", world: "orbit-lab", publishedAt: "2026-10-18T12:00:00Z", content: { summary: "Test bridge", materials: ["Paper"], adultGuidance: "Adult supervision", steps: stepKinds.map((kind) => ({ kind, title: kind, prompt: "Try." })) } };
const attempt = { id: attemptId, learnerId, missionVersionId: versionId, status: "active" as const, createdAt: "2026-10-18T12:00:00Z" };
function fixture() {
  const repository: LearningRepository = { learner: vi.fn().mockResolvedValue(learner), missions: vi.fn().mockResolvedValue([mission]), mission: vi.fn().mockResolvedValue(mission), start: vi.fn().mockResolvedValue(attempt), attempt: vi.fn().mockResolvedValue(attempt), evidence: vi.fn().mockResolvedValue([]), appendEvidence: vi.fn().mockResolvedValue({ id: otherId }), complete: vi.fn().mockResolvedValue(null) };
  const auth = { authenticate: vi.fn().mockResolvedValue({ kind: "learner", tenantId, learnerId }) };
  return { repository, auth, api: createLearningApi({ repository, auth, origin }) };
}
function mutation(body: unknown, extraHeaders: Record<string, string> = {}) {
  return new Request(`${origin}/api/v1/attempts`, { method: "POST", headers: { "content-type": "application/json", origin, "sec-fetch-site": "same-origin", ...extraHeaders }, body: JSON.stringify(body) });
}

describe("protected API", () => {
  let setup: ReturnType<typeof fixture>;
  beforeEach(() => { setup = fixture(); });
  it("fails closed without configured adapters in every environment", async () => {
    const response = await createLearningApi(null).startAttempt(mutation({ role: "admin", learnerId }));
    expect(response.status).toBe(503);
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(await response.json()).toMatchObject({ error: { code: "UNAVAILABLE" } });
  });
  it("cannot bypass auth with role/subject/tenant or bearer headers", async () => {
    const auth = new OpaqueCookieAuthenticator({ findByHash: async () => null });
    const api = createLearningApi({ ...setup, auth, origin });
    const response = await api.startAttempt(mutation({ learnerId, missionVersionId: versionId }, { "x-user-role": "admin", "x-user-id": learnerId, "x-tenant-id": tenantId, authorization: "Bearer arbitrary" }));
    expect(response.status).toBe(401);
    expect(setup.repository.learner).not.toHaveBeenCalled();
  });
  it("starts attempts pinned to an authorized age-matching published version", async () => {
    const response = await setup.api.startAttempt(mutation({ learnerId, missionVersionId: versionId }));
    expect(response.status).toBe(201);
    expect(await response.json()).toEqual({ attempt });
    expect(setup.repository.start).toHaveBeenCalledWith({ kind: "learner", tenantId, learnerId }, { learnerId, missionVersionId: versionId });
    vi.mocked(setup.repository.mission).mockResolvedValue({ ...mission, ageBand: "5-6" });
    expect((await setup.api.startAttempt(mutation({ learnerId, missionVersionId: versionId }))).status).toBe(404);
  });
  it("hides other learners, tenants, unlinked adults and revoked consent", async () => {
    for (const target of [{ ...learner, learnerId: otherId }, { ...learner, tenantId: otherId }, { ...learner, consentActive: false }]) {
      vi.mocked(setup.repository.learner).mockResolvedValue(target);
      expect((await setup.api.listEvidence(new Request(`${origin}/api/v1/learners/${otherId}/evidence`), otherId)).status).toBe(404);
    }
    expect(setup.repository.evidence).not.toHaveBeenCalled();
  });
  it("rejects origin spoofing and cross-site fetches before storage writes", async () => {
    for (const request of [mutation({ learnerId, missionVersionId: versionId }, { origin: "https://evil.example", "x-forwarded-host": "education.example" }), mutation({ learnerId, missionVersionId: versionId }, { "sec-fetch-site": "cross-site" }), new Request(`${origin}/api/v1/attempts`, { method: "POST", body: "{}", headers: { "content-type": "application/json" } })]) {
      expect((await setup.api.startAttempt(request)).status).toBe(403);
    }
    expect(setup.repository.start).not.toHaveBeenCalled();
  });
  it("enforces body limits without trusting Content-Length and rejects malformed JSON/media/unknown keys", async () => {
    expect((await setup.api.startAttempt(mutation({ learnerId, missionVersionId: versionId, role: "adult" }))).status).toBe(400);
    expect((await setup.api.startAttempt(mutation({ text: "x".repeat(9000) }, { "content-length": "5" }))).status).toBe(413);
    expect((await setup.api.startAttempt(new Request(`${origin}/api/v1/attempts`, { method: "POST", headers: { origin, "content-type": "application/json" }, body: "{invalid" }))).status).toBe(400);
    expect((await setup.api.startAttempt(mutation({}, { "content-type": "text/plain" }))).status).toBe(415);
    expect(setup.repository.start).not.toHaveBeenCalled();
  });
  it("rejects evidence attached to another learner's or completed attempt", async () => {
    const body = { attemptId, step: "reflect", payload: { kind: "reflection", text: "A synthetic reflection." } };
    vi.mocked(setup.repository.attempt).mockResolvedValue({ ...attempt, learnerId: otherId });
    expect((await setup.api.createEvidence(mutation(body), learnerId)).status).toBe(404);
    vi.mocked(setup.repository.attempt).mockResolvedValue({ ...attempt, status: "complete" });
    expect((await setup.api.createEvidence(mutation(body), learnerId)).status).toBe(404);
    expect(setup.repository.appendEvidence).not.toHaveBeenCalled();
  });
  it("does not return database/internal/evidence details on errors", async () => {
    vi.mocked(setup.repository.start).mockRejectedValue(new Error("secret database password and child text"));
    const response = await setup.api.startAttempt(mutation({ learnerId, missionVersionId: versionId }));
    expect(response.status).toBe(500);
    expect(await response.text()).not.toMatch(/secret|password|child text/);
  });
  it("requires persisted evidence before completion", async () => {
    expect((await setup.api.completeAttempt(mutation({ status: "complete" }), attemptId)).status).toBe(400);
    vi.mocked(setup.repository.complete).mockResolvedValue({ ...attempt, status: "complete" });
    expect((await setup.api.completeAttempt(mutation({}), attemptId)).status).toBe(200);
  });
});
