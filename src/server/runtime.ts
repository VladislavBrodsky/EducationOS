import { OpaqueCookieAuthenticator, type Principal } from "./auth";
import { PostgresDatabase } from "./database";
import { ApiError } from "./errors";
import { LearningRepository } from "./repository";

let database: PostgresDatabase | undefined;
let repository: LearningRepository | undefined;
const anonymousBuckets = new Map<string, { count: number; expires: number }>();
export function siteOrigin(): string {
  const configured = process.env.APP_ORIGIN ?? process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  try { const url = new URL(configured); if (url.origin !== configured || !["http:", "https:"].includes(url.protocol)) throw new Error(); return url.origin; }
  catch { throw new ApiError(503, "UNAVAILABLE", "The application origin is not configured."); }
}
export function databaseConfigured(): boolean { return Boolean(process.env.DATABASE_URL); }
export function getDatabase(): PostgresDatabase {
  if (!process.env.DATABASE_URL) throw new ApiError(503, "UNAVAILABLE", "Persistent learning is unavailable. The browser demo remains available.");
  try { database ??= new PostgresDatabase(process.env.DATABASE_URL); return database; }
  catch { throw new ApiError(503, "UNAVAILABLE", "Persistent learning is unavailable. The browser demo remains available."); }
}
export function authenticatedLearningConfigured(): boolean {
  return databaseConfigured() && process.env.AUTH_MODE === "opaque-session" && Boolean(process.env.CONSENT_VERIFICATION_PROVIDER?.trim());
}
export function getLearningRepository(): LearningRepository {
  if (!authenticatedLearningConfigured()) throw new ApiError(503, "UNAVAILABLE", "Account access is not enabled. Use the child-safe browser demo.");
  repository ??= new LearningRepository(getDatabase(), process.env.CONSENT_VERIFICATION_PROVIDER!.trim());
  return repository;
}
export async function requirePrincipal(request: Request): Promise<{ principal: Principal; repository: LearningRepository }> {
  const repository = getLearningRepository();
  const principal = await new OpaqueCookieAuthenticator(repository).authenticate(request);
  if (!principal) throw new ApiError(401, "UNAUTHENTICATED", "A valid secure session is required.");
  if (!await repository.consumeRateLimit(`authenticated:${principal.tenantId}:${principal.kind}:${principal.kind === "adult" ? principal.accountId : principal.learnerId}`, 60, 60)) {
    throw new ApiError(429, "RATE_LIMITED", "Please wait before trying again.", 60);
  }
  return { principal, repository };
}
/** Shared anonymous demo budget is process-local; the deployment edge must enforce its public traffic budget. */
export function limitAnonymousDemo(operation: string): void {
  const now = Date.now();
  const existing = anonymousBuckets.get(operation);
  const bucket = existing && existing.expires > now ? existing : { count: 0, expires: now + 60_000 };
  bucket.count++;
  anonymousBuckets.set(operation, bucket);
  if (bucket.count > 600) throw new ApiError(429, "RATE_LIMITED", "Please wait before trying again.", 60);
}
