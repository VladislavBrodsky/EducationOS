import { describe, expect, it } from "vitest";
import { createEvidenceSchema, missionContentSchema, publishedMissionSchema, startAttemptSchema, stepKinds } from "../src/contracts/learning";

describe("versioned learning contracts", () => {
  const content = { summary: "Build a strong, light paper bridge.", materials: ["Paper", "Two books", "Large lightweight blocks"], adultGuidance: "Use a low surface with adult supervision.", steps: stepKinds.map((kind) => ({ kind, title: kind, prompt: "Try a synthetic example." })) };
  it("requires all seven distinct, ordered TRIZ steps", () => {
    expect(missionContentSchema.safeParse(content).success).toBe(true);
    expect(missionContentSchema.safeParse({ ...content, steps: content.steps.slice(0, 6) }).success).toBe(false);
    expect(missionContentSchema.safeParse({ ...content, steps: content.steps.map((step) => ({ ...step, kind: "notice" })) }).success).toBe(false);
  });
  it("rejects role/tenant injection, attachments, and extra evidence properties", () => {
    expect(startAttemptSchema.safeParse({ learnerId: "10000000-0000-4000-8000-000000000001", missionVersionId: "10000000-0000-4000-8000-000000000002", role: "admin" }).success).toBe(false);
    const evidence = { attemptId: "10000000-0000-4000-8000-000000000001", step: "experiment", payload: { kind: "measurement", label: "Bridge A", value: 6, unit: "blocks" } };
    expect(createEvidenceSchema.safeParse(evidence).success).toBe(true);
    expect(createEvidenceSchema.safeParse({ ...evidence, payload: { ...evidence.payload, attachmentUrl: "https://example.invalid/child-photo" } }).success).toBe(false);
    expect(createEvidenceSchema.safeParse({ ...evidence, payload: { ...evidence.payload, value: Infinity } }).success).toBe(false);
    expect(createEvidenceSchema.safeParse({ ...evidence, payload: { kind: "reflection", text: "a".repeat(1201) } }).success).toBe(false);
    expect(createEvidenceSchema.safeParse({ ...evidence, payload: { kind: "reflection", text: "   " } }).success).toBe(false);
  });
  it("rejects a world assigned to another age band", () => {
    const mission = { id: "10000000-0000-4000-8000-000000000001", missionId: "10000000-0000-4000-8000-000000000002", version: 1, title: "Strong and light", ageBand: "10-12", world: "orbit-lab", publishedAt: "2026-10-18T12:00:00Z", content };
    expect(publishedMissionSchema.safeParse(mission).success).toBe(true);
    expect(publishedMissionSchema.safeParse({ ...mission, world: "future-city" }).success).toBe(false);
  });
});
