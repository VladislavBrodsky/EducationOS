import { describe, expect, it } from "vitest";
import { publishedMissionSchema } from "../../src/contracts/learning";
import { AGE_PROGRAMS, DEMO_MISSIONS, getDemoMission } from "../../src/content/missions";
import { blankDemoSession, blankDraft, evidenceCount, exportDemoEvidence, measurementComparison, parseDemoSession, parseMeasurement, stepEvidence } from "../../src/lib/demo-state";

const complete = () => ({ ...blankDraft(), notice: "The paper bends under the block.", contradiction: "We want more strength with the same material.", ideas: ["Fold into a fan shape.", "Curve the paper into an arch.", ""] as [string, string, string], hypothesis: "If I fold the paper, I predict it will stand longer.", baseline: "1.5", redesigned: "14", experiment: "The folded bridge stayed in place longer.", reflect: "One trial suggests a change; I should repeat it.", transfer: "I would test folded paper in a lightweight roof." });
describe("published age-adapted mission content", () => {
  it("publishes exactly one schema-valid seven-step mission for every age band", () => {
    expect(DEMO_MISSIONS).toHaveLength(5);
    for (const program of AGE_PROGRAMS) expect(publishedMissionSchema.parse(getDemoMission(program.ageBand)).ageBand).toBe(program.ageBand);
    expect(new Set(DEMO_MISSIONS.map((mission) => mission.id)).size).toBe(5);
    expect(new Set(DEMO_MISSIONS.map((mission) => mission.content.steps[3].prompt)).size).toBe(5);
  });
});
describe("demo evidence validation", () => {
  it("starts with no evidence or invented progress", () => { expect(evidenceCount(blankDraft())).toBe(0); expect(measurementComparison(blankDraft())).toBeNull(); });
  it("requires distinct substantial ideas and both measurements with observations", () => {
    const draft = complete();
    expect(evidenceCount(draft)).toBe(7);
    expect(stepEvidence({ ...draft, ideas: ["Same idea", " same idea ", ""] })[2]).toBe(false);
    expect(stepEvidence({ ...draft, experiment: "" })[4]).toBe(false);
    expect(stepEvidence({ ...draft, redesigned: "" })[4]).toBe(false);
  });
  it("accepts immediate collapse and the cutoff but rejects invalid measurements", () => {
    expect(parseMeasurement("0")).toBe(0); expect(parseMeasurement("60")).toBe(60); expect(parseMeasurement("2.3")).toBe(2.3);
    for (const value of ["", " ", "-1", "61", "60.1", "NaN", "Infinity", "1e1", "2.45", "0x10"]) expect(parseMeasurement(value)).toBeNull();
  });
  it("reports absolute observations without a causal or percent improvement claim", () => {
    expect(measurementComparison({ ...complete(), baseline: "0", redesigned: "60" })).toEqual({ baseline: 0, redesigned: 60, difference: 60, capped: true });
    expect(measurementComparison({ ...complete(), baseline: "15", redesigned: "3" })?.difference).toBe(-12);
  });
});
describe("local demo session lifecycle", () => {
  it("round-trips valid bounded state and keeps age-band drafts separate", () => {
    const session = blankDemoSession(); session.drafts["10-12"] = complete();
    expect(parseDemoSession(JSON.stringify(session))).toEqual({ session, recovered: false });
    expect(evidenceCount(session.drafts["5-6"])).toBe(0);
  });
  it("recovers safely from corrupt, stale, unbounded, and unknown-key state", () => {
    const session = blankDemoSession();
    for (const raw of ["{broken", JSON.stringify({ ...session, version: 99 }), JSON.stringify({ ...session, email: "not-accepted" }), "x".repeat(60001), JSON.stringify({ ...session, drafts: { ...session.drafts, "10-12": { ...blankDraft(), step: 99 } } })]) {
      const result = parseDemoSession(raw); expect(result.recovered).toBe(true); expect(result.session).toEqual(blankDemoSession());
    }
    expect(parseDemoSession(null).recovered).toBe(false);
  });
  it("exports only the chosen age-band notes with honest interpretation and a stable format", () => {
    const session = blankDemoSession(); session.drafts["10-12"] = complete(); session.drafts["5-6"].notice = "A separate synthetic observation.";
    const exported = exportDemoEvidence(session, new Date("2026-10-18T10:00:00Z"));
    expect(exported.syntheticDemoOnly).toBe(true); expect(exported.evidenceSteps).toBe(7); expect(exported.exportedAt).toBe("2026-10-18T10:00:00.000Z");
    expect(JSON.stringify(exported)).not.toContain("A separate synthetic observation.");
    expect(exported.interpretation).toContain("not a verified assessment");
  });
});
