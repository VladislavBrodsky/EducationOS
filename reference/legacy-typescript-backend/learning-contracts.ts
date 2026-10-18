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
export const startAttemptSchema = z.object({
  learnerId: idSchema,
  missionVersionId: idSchema,
}).strict();
export const attemptSchema = z.object({
  id: idSchema,
  learnerId: idSchema,
  missionVersionId: idSchema,
  status: z.enum(["active", "complete"]),
  createdAt: z.string().datetime(),
}).strict();
const textEvidenceSchema = z.object({
  kind: z.enum(["idea", "observation", "reflection"]),
  text: z.string().trim().min(1).max(1200),
}).strict();
const measurementEvidenceSchema = z.object({
  kind: z.literal("measurement"),
  label: z.string().trim().min(1).max(80),
  value: z.number().finite().min(0).max(10000),
  unit: z.enum(["coins", "grams", "centimeters", "seconds"]),
}).strict();
export const evidencePayloadSchema = z.discriminatedUnion("kind", [textEvidenceSchema, measurementEvidenceSchema]);
export const createEvidenceSchema = z.object({
  attemptId: idSchema,
  step: stepKindSchema,
  payload: evidencePayloadSchema,
}).strict();
export const evidenceSchema = createEvidenceSchema.extend({
  id: idSchema,
  learnerId: idSchema,
  createdAt: z.string().datetime(),
  retentionUntil: z.string().datetime(),
}).strict();
export const errorSchema = z.object({
  error: z.object({
    code: z.enum(["UNAVAILABLE", "UNAUTHENTICATED", "FORBIDDEN", "NOT_FOUND", "INVALID_INPUT", "TOO_LARGE", "UNSUPPORTED_MEDIA_TYPE", "RATE_LIMITED", "INTERNAL_ERROR"]),
    message: z.string(),
  }).strict(),
}).strict();

export type AgeBand = z.infer<typeof ageBandSchema>;
export type PublishedMission = z.infer<typeof publishedMissionSchema>;
export type StartAttempt = z.infer<typeof startAttemptSchema>;
export type Attempt = z.infer<typeof attemptSchema>;
export type CreateEvidence = z.infer<typeof createEvidenceSchema>;
export type Evidence = z.infer<typeof evidenceSchema>;
