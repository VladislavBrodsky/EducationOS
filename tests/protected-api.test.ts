import { describe, expect, it } from "vitest";
import { unavailable } from "../src/lib/protected-api";
import { GET as missions } from "../src/app/api/v1/missions/route";
import { GET as mission } from "../src/app/api/v1/missions/[missionId]/route";
import { POST as start } from "../src/app/api/v1/attempts/route";
import { POST as complete } from "../src/app/api/v1/attempts/[attemptId]/complete/route";
import { GET as evidence, POST as appendEvidence } from "../src/app/api/v1/learners/[learnerId]/evidence/route";

describe("presentation-only protected API boundary", () => {
  it.each([missions, mission, start, complete, evidence, appendEvidence])("uses only the shared unconditional 503 shim", async (handler) => {
    expect(handler).toBe(unavailable);
    const response = handler();
    expect(response.status).toBe(503);
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(response.headers.get("x-content-type-options")).toBe("nosniff");
    expect(await response.json()).toEqual({ error: { code: "UNAVAILABLE", message: "The Python learning service is not connected. Use synthetic demo data only." } });
  });
});
