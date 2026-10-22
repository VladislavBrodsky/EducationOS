import { z } from "zod";
import { createEvidenceSchema, idSchema, startAttemptSchema } from "../contracts/learning";
import type { Authenticator, Principal } from "./auth";
import { canAccessLearner } from "./permissions";
import type { LearningRepository } from "./repository";

export class ApiError extends Error {
  constructor(public readonly status: number, public readonly code: string, message: string) { super(message); }
}
export interface ApiDependencies {
  auth: Authenticator;
  repository: LearningRepository;
  /** Exact externally configured origin; never infer trust from Host/X-Forwarded-Host. */
  origin: string;
}
const MAX_BODY_BYTES = 8192;
const headers = { "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff", "Content-Type": "application/json; charset=utf-8" };
function json(body: unknown, status = 200): Response { return new Response(JSON.stringify(body), { status, headers }); }
function invalid(): never { throw new ApiError(400, "INVALID_INPUT", "The request did not match the API contract."); }
function parseId(value: unknown): string { const parsed = idSchema.safeParse(value); return parsed.success ? parsed.data : invalid(); }
async function readJson<T>(request: Request, schema: z.ZodType<T>): Promise<T> {
  if (!/^application\/json(?:\s*;|$)/i.test(request.headers.get("content-type") ?? "")) {
    throw new ApiError(415, "UNSUPPORTED_MEDIA_TYPE", "Use application/json.");
  }
  const length = request.headers.get("content-length");
  if (length && (!/^\d+$/.test(length) || Number(length) > MAX_BODY_BYTES)) throw new ApiError(413, "TOO_LARGE", "Request exceeds the size limit.");
  const reader = request.body?.getReader();
  if (!reader) return invalid();
  const chunks: Uint8Array[] = [];
  let bytes = 0;
  try {
    for (;;) {
      const result = await reader.read();
      if (result.done) break;
      bytes += result.value.byteLength;
      if (bytes > MAX_BODY_BYTES) {
        await reader.cancel();
        throw new ApiError(413, "TOO_LARGE", "Request exceeds the size limit.");
      }
      chunks.push(result.value);
    }
  } finally { reader.releaseLock(); }
  const body = new Uint8Array(bytes);
  let offset = 0;
  for (const chunk of chunks) { body.set(chunk, offset); offset += chunk.byteLength; }
  let value: unknown;
  try { value = JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(body)); } catch { return invalid(); }
  const parsed = schema.safeParse(value);
  return parsed.success ? parsed.data : invalid();
}
function assertMutationOrigin(request: Request, expectedOrigin: string): void {
  const site = request.headers.get("sec-fetch-site");
  if (request.headers.get("origin") !== expectedOrigin || (site && site !== "same-origin" && site !== "none")) {
    throw new ApiError(403, "FORBIDDEN", "This request origin is not allowed.");
  }
}
export function createLearningApi(dependencies: ApiDependencies | null) {
  async function run(request: Request, mutation: boolean, action: (principal: Principal, repository: LearningRepository) => Promise<Response>): Promise<Response> {
    try {
      if (!dependencies) throw new ApiError(503, "UNAVAILABLE", "Protected learning storage is disabled pending identity, consent, and database integration. Use synthetic demo data only.");
      const principal = await dependencies.auth.authenticate(request);
      if (!principal) throw new ApiError(401, "UNAUTHENTICATED", "A valid session is required.");
      if (mutation) assertMutationOrigin(request, dependencies.origin);
      return await action(principal, dependencies.repository);
    } catch (error) {
      if (error instanceof ApiError) return json({ error: { code: error.code, message: error.message } }, error.status);
      // Do not return submitted evidence, SQL details, session tokens, or internal exceptions.
      return json({ error: { code: "INTERNAL_ERROR", message: "The request could not be completed." } }, 500);
    }
  }
  async function authorizedLearner(repository: LearningRepository, principal: Principal, learnerId: string, action: "read" | "contribute") {
    const learner = await repository.learner(principal, learnerId);
    if (!learner || learner.learnerId !== learnerId || !canAccessLearner(principal, learner, action)) throw new ApiError(404, "NOT_FOUND", "Learning record not found.");
    return learner;
  }
  return {
    listMissions: (request: Request) => run(request, false, async (principal, repository) => {
      const learnerId = parseId(new URL(request.url).searchParams.get("learnerId"));
      const learner = await authorizedLearner(repository, principal, learnerId, "read");
      return json({ missions: await repository.missions(principal, learner.ageBand) });
    }),
    getMission: (request: Request, versionId: string) => run(request, false, async (principal, repository) => {
      const learnerId = parseId(new URL(request.url).searchParams.get("learnerId"));
      const learner = await authorizedLearner(repository, principal, learnerId, "read");
      const mission = await repository.mission(principal, parseId(versionId));
      if (!mission || mission.ageBand !== learner.ageBand) throw new ApiError(404, "NOT_FOUND", "Mission not found.");
      return json({ mission });
    }),
    startAttempt: (request: Request) => run(request, true, async (principal, repository) => {
      const input = await readJson(request, startAttemptSchema);
      const learner = await authorizedLearner(repository, principal, input.learnerId, "contribute");
      const mission = await repository.mission(principal, input.missionVersionId);
      if (!mission || mission.ageBand !== learner.ageBand) throw new ApiError(404, "NOT_FOUND", "Mission not found.");
      return json({ attempt: await repository.start(principal, input) }, 201);
    }),
    listEvidence: (request: Request, learnerId: string) => run(request, false, async (principal, repository) => {
      parseId(learnerId);
      await authorizedLearner(repository, principal, learnerId, "read");
      return json({ evidence: await repository.evidence(principal, learnerId) });
    }),
    createEvidence: (request: Request, learnerId: string) => run(request, true, async (principal, repository) => {
      parseId(learnerId);
      await authorizedLearner(repository, principal, learnerId, "contribute");
      const input = await readJson(request, createEvidenceSchema);
      const attempt = await repository.attempt(principal, input.attemptId);
      if (!attempt || attempt.learnerId !== learnerId || attempt.status !== "active") throw new ApiError(404, "NOT_FOUND", "Active attempt not found.");
      return json({ evidence: await repository.appendEvidence(principal, learnerId, input) }, 201);
    }),
    completeAttempt: (request: Request, attemptId: string) => run(request, true, async (principal, repository) => {
      parseId(attemptId);
      const attempt = await repository.attempt(principal, attemptId);
      if (!attempt) throw new ApiError(404, "NOT_FOUND", "Attempt not found.");
      await authorizedLearner(repository, principal, attempt.learnerId, "contribute");
      const completed = await repository.complete(principal, attemptId);
      if (!completed) throw new ApiError(400, "INVALID_INPUT", "Evidence for all seven steps is required before completion.");
      return json({ attempt: completed });
    }),
  };
}
