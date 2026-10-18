import { z } from "zod";
import { ageBandSchema, type AgeBand } from "@/contracts/learning";

export const DEMO_STORAGE_KEY = "educationos.synthetic-demo.v1";
const note = z.string().max(1200);
export const demoDraftSchema = z.object({
  step: z.number().int().min(0).max(6),
  notice: note,
  contradiction: note,
  ideas: z.tuple([z.string().max(300), z.string().max(300), z.string().max(300)]),
  hypothesis: note,
  baseline: z.string().max(8),
  redesigned: z.string().max(8),
  experiment: note,
  reflect: note,
  transfer: note,
}).strict();
export type DemoDraft = z.infer<typeof demoDraftSchema>;
export const demoSessionSchema = z.object({
  version: z.literal(1),
  ageBand: ageBandSchema,
  drafts: z.object({ "5-6": demoDraftSchema, "7-9": demoDraftSchema, "10-12": demoDraftSchema, "13-15": demoDraftSchema, "16-17": demoDraftSchema }).strict(),
}).strict();
export type DemoSession = z.infer<typeof demoSessionSchema>;

export function blankDraft(): DemoDraft {
  return { step: 0, notice: "", contradiction: "", ideas: ["", "", ""], hypothesis: "", baseline: "", redesigned: "", experiment: "", reflect: "", transfer: "" };
}
export function blankDemoSession(): DemoSession {
  return { version: 1, ageBand: "10-12", drafts: { "5-6": blankDraft(), "7-9": blankDraft(), "10-12": blankDraft(), "13-15": blankDraft(), "16-17": blankDraft() } };
}
export function parseDemoSession(raw: string | null): { session: DemoSession; recovered: boolean } {
  if (raw === null) return { session: blankDemoSession(), recovered: false };
  if (raw.length > 60000) return { session: blankDemoSession(), recovered: true };
  try {
    const parsed = demoSessionSchema.safeParse(JSON.parse(raw));
    return parsed.success ? { session: parsed.data, recovered: false } : { session: blankDemoSession(), recovered: true };
  } catch { return { session: blankDemoSession(), recovered: true }; }
}
export function parseMeasurement(value: string): number | null {
  if (!/^\d{1,2}(?:\.\d)?$/.test(value.trim())) return null;
  const number = Number(value);
  return Number.isFinite(number) && number >= 0 && number <= 60 ? number : null;
}
const enough = (text: string) => text.trim().length >= 12;
export function stepEvidence(draft: DemoDraft): readonly boolean[] {
  const ideas = new Set(draft.ideas.map((idea) => idea.trim().toLowerCase()).filter((idea) => idea.length >= 5));
  return [enough(draft.notice), enough(draft.contradiction), ideas.size >= 2, enough(draft.hypothesis), parseMeasurement(draft.baseline) !== null && parseMeasurement(draft.redesigned) !== null && enough(draft.experiment), enough(draft.reflect), enough(draft.transfer)];
}
export function evidenceCount(draft: DemoDraft): number { return stepEvidence(draft).filter(Boolean).length; }
export function measurementComparison(draft: DemoDraft): { baseline: number; redesigned: number; difference: number; capped: boolean } | null {
  const baseline = parseMeasurement(draft.baseline);
  const redesigned = parseMeasurement(draft.redesigned);
  if (baseline === null || redesigned === null) return null;
  return { baseline, redesigned, difference: Math.round((redesigned - baseline) * 10) / 10, capped: baseline === 60 || redesigned === 60 };
}
export function exportDemoEvidence(session: DemoSession, now = new Date()) {
  const ageBand: AgeBand = session.ageBand;
  const draft = session.drafts[ageBand];
  return { format: "educationos-demo-evidence", version: 1, syntheticDemoOnly: true, exportedAt: now.toISOString(), ageBand, mission: "paper-bridge", missionVersion: 1, evidenceSteps: evidenceCount(draft), totalSteps: 7, observations: { notice: draft.notice, contradiction: draft.contradiction, ideas: draft.ideas.filter((idea) => idea.trim()), hypothesis: draft.hypothesis, measurements: measurementComparison(draft), experiment: draft.experiment, reflection: draft.reflect, transfer: draft.transfer }, interpretation: "Self-recorded demo evidence; not a verified assessment or mastery score. Single trials do not establish causation or reproducibility." };
}
