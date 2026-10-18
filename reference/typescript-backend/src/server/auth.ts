import { createHash, randomBytes } from "node:crypto";
import { z } from "zod";
import { idSchema } from "../contracts/learning";

const principalSchema = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("adult"), tenantId: idSchema, accountId: idSchema }).strict(),
  z.object({ kind: z.literal("learner"), tenantId: idSchema, learnerId: idSchema }).strict(),
]);
export type Principal = z.infer<typeof principalSchema>;
export interface StoredSession { principal: unknown; expiresAt: Date; revokedAt: Date | null }
export interface SessionStore { findByHash(tokenHash: string): Promise<StoredSession | null> }
export interface Authenticator { authenticate(request: Request): Promise<Principal | null> }

export const SESSION_COOKIE = "__Host-educationos-session";
export function hashSessionToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}
/** Issuance belongs behind an identity provider and adult/child account provisioning. */
export function newSessionToken(): string { return randomBytes(32).toString("base64url"); }
export function sessionCookie(token: string, maxAgeSeconds: number): string {
  if (!/^[A-Za-z0-9_-]{43}$/.test(token) || !Number.isInteger(maxAgeSeconds) || maxAgeSeconds < 1 || maxAgeSeconds > 3600) {
    throw new Error("Invalid session cookie parameters");
  }
  return `${SESSION_COOKIE}=${token}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${maxAgeSeconds}`;
}
export class OpaqueCookieAuthenticator implements Authenticator {
  constructor(private readonly store: SessionStore, private readonly now: () => number = Date.now) {}
  async authenticate(request: Request): Promise<Principal | null> {
    const candidates = (request.headers.get("cookie") ?? "").split(";")
      .map((part) => part.trim()).filter((part) => part.startsWith(`${SESSION_COOKIE}=`));
    if (candidates.length !== 1) return null;
    const token = candidates[0].slice(SESSION_COOKIE.length + 1);
    if (!/^[A-Za-z0-9_-]{43}$/.test(token)) return null;
    const session = await this.store.findByHash(hashSessionToken(token));
    if (!session || session.revokedAt !== null || !Number.isFinite(session.expiresAt.getTime()) || session.expiresAt.getTime() <= this.now()) return null;
    const parsed = principalSchema.safeParse(session.principal);
    return parsed.success ? parsed.data : null;
  }
}
