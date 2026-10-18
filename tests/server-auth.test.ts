import { describe, expect, it, vi } from "vitest";
import { hashSessionToken, newSessionToken, OpaqueCookieAuthenticator, SESSION_COOKIE, sessionCookie, type StoredSession } from "../src/server/auth";
import { canAccessLearner } from "../src/server/permissions";

const tenantId = "10000000-0000-4000-8000-000000000001";
const learnerId = "10000000-0000-4000-8000-000000000002";
const accountId = "10000000-0000-4000-8000-000000000003";
const token = "A".repeat(43);
const now = Date.parse("2026-10-18T12:00:00Z");
const session: StoredSession = { principal: { kind: "learner", tenantId, learnerId }, expiresAt: new Date(now + 1000), revokedAt: null };
const request = (cookie?: string) => new Request("https://education.example/api/v1/missions", { headers: { ...(cookie ? { cookie } : {}), "x-user-role": "adult", "x-user-id": accountId, "x-tenant-id": tenantId, authorization: "Bearer forged" } });

describe("server-verified opaque sessions", () => {
  it("ignores all identity headers and requires exactly one correctly shaped cookie", async () => {
    const findByHash = vi.fn().mockResolvedValue(session);
    const auth = new OpaqueCookieAuthenticator({ findByHash }, () => now);
    expect(await auth.authenticate(request())).toBeNull();
    expect(await auth.authenticate(request(`${SESSION_COOKIE}=forged`))).toBeNull();
    expect(await auth.authenticate(request(`${SESSION_COOKIE}=${token}; ${SESSION_COOKIE}=${token}`))).toBeNull();
    expect(findByHash).not.toHaveBeenCalled();
    expect(await auth.authenticate(request(`${SESSION_COOKIE}=${token}`))).toEqual(session.principal);
    expect(findByHash).toHaveBeenCalledWith(hashSessionToken(token));
    expect(hashSessionToken(token)).not.toContain(token);
  });
  it("rejects unknown, expired, revoked and malformed server sessions", async () => {
    for (const stored of [null, { ...session, expiresAt: new Date(now) }, { ...session, revokedAt: new Date(now - 1) }, { ...session, principal: { kind: "adult", tenantId, accountId, role: "admin" } }, { ...session, expiresAt: new Date("invalid") }]) {
      const auth = new OpaqueCookieAuthenticator({ findByHash: async () => stored }, () => now);
      expect(await auth.authenticate(request(`${SESSION_COOKIE}=${token}`))).toBeNull();
    }
  });
  it("uses cryptographic tokens and host-scoped hardened cookies", () => {
    const minted = newSessionToken();
    expect(minted).toMatch(/^[A-Za-z0-9_-]{43}$/);
    expect(newSessionToken()).not.toBe(minted);
    expect(sessionCookie(minted, 1800)).toContain("Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=1800");
    expect(() => sessionCookie(minted, 86400)).toThrow();
    expect(() => sessionCookie("injected; Domain=evil", 600)).toThrow();
  });
});

describe("adult and learner permission boundaries", () => {
  const boundary = { tenantId, learnerId, consentActive: true, adultGrants: [{ accountId, canRead: true, canContribute: false }] };
  it("allows own learner only with active consent", () => {
    expect(canAccessLearner({ kind: "learner", tenantId, learnerId }, boundary, "contribute")).toBe(true);
    expect(canAccessLearner({ kind: "learner", tenantId, learnerId: accountId }, boundary, "read")).toBe(false);
    expect(canAccessLearner({ kind: "learner", tenantId: accountId, learnerId }, boundary, "read")).toBe(false);
    expect(canAccessLearner({ kind: "learner", tenantId, learnerId }, { ...boundary, consentActive: false }, "read")).toBe(false);
  });
  it("requires explicit adult relationship permissions, even in the same tenant", () => {
    expect(canAccessLearner({ kind: "adult", tenantId, accountId }, boundary, "read")).toBe(true);
    expect(canAccessLearner({ kind: "adult", tenantId, accountId }, boundary, "contribute")).toBe(false);
    expect(canAccessLearner({ kind: "adult", tenantId, accountId: learnerId }, boundary, "read")).toBe(false);
    expect(canAccessLearner({ kind: "adult", tenantId: learnerId, accountId }, boundary, "read")).toBe(false);
  });
});
