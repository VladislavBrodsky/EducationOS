import { z } from "zod";

export const CONTRACT_VERSION = "2026-10-18.v1";
export const idSchema = z.string().uuid();
export const ageBandSchema = z.enum(["5-6", "7-9", "10-12", "13-15", "16-17"]);
export const worldSchema = z.enum(["curiosity-grove", "builder-harbor", "orbit-lab", "future-city", "frontier-studio"]);
export const stepKinds = ["notice", "contradiction", "imagine", "hypothesis", "experiment", "reflect", "transfer"] as const;
export const stepKindSchema = z.enum(stepKinds);
export const missionStepSchema = z.object({
  kind: stepKindSchema,
  title: z.string().trim().min(1).max(80),
  prompt: z.string().trim().min(1).max(1600),
}).strict();
export const missionContentSchema = z.object({
  summary: z.string().trim().min(1).max(600),
  materials: z.array(z.string().trim().min(1).max(100)).min(1).max(12),
  adultGuidance: z.string().trim().min(1).max(1200),
  steps: z.array(missionStepSchema).length(7).refine(
    (steps) => steps.every((step, index) => step.kind === stepKinds[index]),
    "Seven TRIZ steps must appear once in the documented order",
  ),
}).strict();
export const publishedMissionSchema = z.object({
  id: idSchema,
  missionId: idSchema,
  version: z.number().int().positive(),
  title: z.string().trim().min(1).max(120),
  ageBand: ageBandSchema,
  world: worldSchema,
  publishedAt: z.string().datetime(),
  content: missionContentSchema,
}).strict();
// Browser validation is limited to curriculum rendering. Python owns persisted
// attempt/evidence contracts, authorization, and safety policy.
export type AgeBand = z.infer<typeof ageBandSchema>;
export type PublishedMission = z.infer<typeof publishedMissionSchema>;
