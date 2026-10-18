import { afterEach, describe, expect, it, vi } from "vitest";
import { startAttemptSchema } from "../src/contracts/learning";
import { apiJson, assertSameOrigin, parseJsonBody, withApi } from "../src/server/http";
import { GET as demoMissions } from "../src/app/api/v1/demo/missions/route";
import { GET as readiness } from "../src/app/api/health/ready/route";
import { POST as register } from "../src/app/api/v1/auth/register/route";
import { GET as session } from "../src/app/api/v1/auth/session/route";

const valid = { learnerId: "00000000-0000-4000-8000-000000000001", missionVersionId: "00000000-0000-4000-8000-000000000002" };
const jsonRequest = (body: unknown, headers: Record<string, string> = {}) => new Request("https://educationos.space/api/v1/attempts", { method: "POST", headers: { "Content-Type": "application/json", ...headers }, body: JSON.stringify(body) });
afterEach(() => { vi.unstubAllEnvs(); vi.restoreAllMocks(); });

describe("API request boundaries", () => {
  it("parses bounded contract JSON and rejects unknown fields and forged content lengths", async () => {
    expect(await parseJsonBody(jsonRequest(valid), startAttemptSchema)).toEqual(valid);
    await expect(parseJsonBody(jsonRequest({ ...valid, email: "not-collected@example.invalid" }), startAttemptSchema)).rejects.toMatchObject({ status: 400 });
    await expect(parseJsonBody(jsonRequest(valid, { "content-length": "9000" }), startAttemptSchema)).rejects.toMatchObject({ status: 413 });
    await expect(parseJsonBody(jsonRequest({ text: "x".repeat(9000) }, { "content-length": "1" }), startAttemptSchema)).rejects.toMatchObject({ status: 413 });
    await expect(parseJsonBody(new Request("https://educationos.space/api", { method: "POST", body: "{}" }), startAttemptSchema)).rejects.toMatchObject({ status: 415 });
  });
  it("requires exact origin for session-authenticated writes", () => {
    expect(() => assertSameOrigin(jsonRequest(valid, { origin: "https://educationos.space", "sec-fetch-site": "same-origin" }), "https://educationos.space")).not.toThrow();
    expect(() => assertSameOrigin(jsonRequest(valid), "https://educationos.space")).toThrow();
    expect(() => assertSameOrigin(jsonRequest(valid, { origin: "https://educationos.space.evil.invalid" }), "https://educationos.space")).toThrow();
    expect(() => assertSameOrigin(jsonRequest(valid, { origin: "https://educationos.space", "sec-fetch-site": "cross-site" }), "https://educationos.space")).toThrow();
  });
  it("does not expose internal errors, incoming IDs, request text, or cookies in logs", async () => {
    const logger = vi.spyOn(console, "info").mockImplementation(() => {});
    const handler = withApi("synthetic.failure", async () => { throw new Error("database password and private evidence"); });
    const result = await handler(jsonRequest({ text: "private child writing" }, { cookie: "secret-cookie", "x-request-id": "attacker-id" }));
    const body = await result.json();
    expect(body).toEqual({ error: { code: "INTERNAL_ERROR", message: "The request could not be completed." } });
    expect(result.headers.get("x-request-id")).toMatch(/^[a-f0-9-]{36}$/);
    expect(JSON.stringify(logger.mock.calls)).not.toMatch(/secret-cookie|private child|password|attacker-id/);
    expect(result.headers.get("cache-control")).toBe("no-store");
    expect(apiJson({}, "id").headers.get("x-content-type-options")).toBe("nosniff");
  });
});

describe("public demo and unavailable account routes", () => {
  it("serves five contract versions and can select a supported age band", async () => {
    const response = await demoMissions(new Request("https://educationos.space/api/v1/demo/missions"));
    expect(response.status).toBe(200);
    expect((await response.json()).missions).toHaveLength(5);
    const filtered = await demoMissions(new Request("https://educationos.space/api/v1/demo/missions?ageBand=5-6"));
    expect((await filtered.json()).missions).toHaveLength(1);
    const invalid = await demoMissions(new Request("https://educationos.space/api/v1/demo/missions?ageBand=5-6&ageBand=16-17"));
    expect(invalid.status).toBe(400);
  });
  it("runs a demo without a database while accurately reporting registration unavailable", async () => {
    vi.stubEnv("DATABASE_URL", "");
    vi.stubEnv("AUTH_MODE", "disabled");
    const response = await readiness(new Request("https://educationos.space/api/health/ready"));
    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({ mode: "demo", database: "unconfigured", authenticatedLearning: false, childRegistration: "unavailable", consentIssuance: "unavailable" });
    expect((await session(new Request("https://educationos.space/api/v1/auth/session"))).status).toBe(503);
    expect((await register(jsonRequest({}))).status).toBe(503);
  });
});
