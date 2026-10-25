import { type AgeBand, ageBandSchema } from "@/contracts/learning";
import { checkPortalActivity, getPortalLesson, getPortalSubject, type PortalSubjectId } from "@/lib/portal-learning";
import { getPortalLab } from "@/lib/labs/catalog";
import { checkLab } from "@/lib/labs/checks";
import { blankLabRecord, type LabId, type LabPatch, type LabRecord } from "@/lib/labs/types";
import { CUBE_PRESETS } from "@/lib/labs/hidden-cubes";
import { readHalfSelection, writeHalfSelection } from "@/lib/labs/same-half";

export const PORTAL_STORAGE_KEY = "educationos.portal.v1";
// Covers all bounded lesson fields even when JSON escapes each character as \u0000.
export const PORTAL_STATE_LIMIT = 1_500_000;
export type PortalLessonState = {
  draftCode: string;
  answer: string;
  writing: string;
  observations: Record<string, string>;
  reflection: string;
  completed: boolean;
  completedAt?: string;
};
export type PortalState = {
  version: 1;
  selectedSubjectId: PortalSubjectId;
  ageBand?: AgeBand;
  lessons: Record<string, PortalLessonState>;
  labs: Partial<Record<LabId, LabRecord>>;
};

export function createLessonState(lessonId?: string): PortalLessonState {
  const lesson = lessonId ? getPortalLesson(lessonId) : undefined;
  return { draftCode: lesson?.activity.kind === "code" ? lesson.activity.starterCode : "", answer: "", writing: "", observations: {}, reflection: "", completed: false };
}
export function createPortalState(): PortalState { return { version: 1, selectedSubjectId: "programming", lessons: {}, labs: {} }; }

function isObject(value: unknown): value is Record<string, unknown> { return typeof value === "object" && value !== null && !Array.isArray(value); }
function hasOnlyKeys(value: Record<string, unknown>, keys: string[]): boolean { return Object.keys(value).every((key) => keys.includes(key)); }
function boundedText(value: unknown, max: number): value is string { return typeof value === "string" && value.length <= max; }
function validTimestamp(value: unknown): value is string {
  return typeof value === "string" && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(value) && Number.isFinite(Date.parse(value));
}
function passes(lessonId: string, draft: PortalLessonState): boolean {
  const lesson = getPortalLesson(lessonId);
  return Boolean(lesson && checkPortalActivity(lesson, { code: draft.draftCode, answer: draft.answer, writing: draft.writing, observations: draft.observations }).passed);
}

const labKeys: Record<LabId, { settings: string[]; answers: string[] }> = {
  "loop-loom": { settings: ["repeats"], answers: ["prediction", "predictionSubmitted", "observation", "transfer", "transferFirst"] },
  "same-half": { settings: ["selection"], answers: ["prediction", "revealed", "observation", "unequal", "transfer", "transferReason"] },
  "hidden-cubes": { settings: ["preset"], answers: ["prediction", "revealed", "perLayer", "layers", "volume", "unit", "reason", "transfer", "transferLayer", "transferLayers"] },
};

function readLabState(id: LabId, value: unknown): LabRecord | null {
  if (!isObject(value) || !hasOnlyKeys(value, ["version", "settings", "answers", "reflection", "completed", "completedAt"]) || value.version !== 1 || typeof value.completed !== "boolean" || !boundedText(value.reflection, 1200) || !isObject(value.settings) || !isObject(value.answers)) return null;
  if (value.completedAt !== undefined && !validTimestamp(value.completedAt)) return null;
  if (!Object.entries(value.settings).every(([key, text]) => labKeys[id].settings.includes(key) && boundedText(text, 100))) return null;
  if (!Object.entries(value.answers).every(([key, text]) => labKeys[id].answers.includes(key) && boundedText(text, 400))) return null;
  if (id === "loop-loom" && value.settings.repeats !== undefined && !/^[0-6]$/.test(String(value.settings.repeats))) return null;
  if (id === "hidden-cubes" && value.settings.preset !== undefined && !CUBE_PRESETS.includes(value.settings.preset as typeof CUBE_PRESETS[number])) return null;
  if (id === "same-half" && value.settings.selection !== undefined && writeHalfSelection(readHalfSelection(String(value.settings.selection))) !== value.settings.selection) return null;
  const draft: LabRecord = { version: 1, settings: { ...value.settings } as Record<string, string>, answers: { ...value.answers } as Record<string, string>, reflection: value.reflection, completed: value.completed };
  draft.completed = draft.completed && checkLab(id, draft).passed;
  if (draft.completed && value.completedAt) draft.completedAt = value.completedAt as string;
  return draft;
}

function readLessonState(lessonId: string, value: unknown): PortalLessonState | null {
  const lesson = getPortalLesson(lessonId);
  if (!lesson || !isObject(value) || !hasOnlyKeys(value, ["draftCode", "answer", "writing", "observations", "reflection", "completed", "completedAt"])) return null;
  if (!boundedText(value.draftCode, 8000) || !boundedText(value.answer, 100) || !boundedText(value.writing, 6000) || !boundedText(value.reflection, 1200) || typeof value.completed !== "boolean" || !isObject(value.observations)) return null;
  if (value.completedAt !== undefined && !validTimestamp(value.completedAt)) return null;
  if (lesson.activity.kind === "choice" && value.answer !== "" && !lesson.activity.options.some((option) => option.id === value.answer)) return null;
  const allowedFields = lesson.activity.kind === "experiment" ? lesson.activity.fields.map((field) => field.id) : [];
  if (!Object.keys(value.observations).every((key) => allowedFields.includes(key) && boundedText(value.observations && (value.observations as Record<string, unknown>)[key], 2000))) return null;
  const draft: PortalLessonState = { draftCode: value.draftCode, answer: value.answer, writing: value.writing, observations: { ...value.observations } as Record<string, string>, reflection: value.reflection, completed: value.completed };
  // A completion flag on its own is not accepted as evidence of a checked activity.
  draft.completed = draft.completed && passes(lessonId, draft);
  if (draft.completed && value.completedAt) draft.completedAt = value.completedAt as string;
  return draft;
}

/** Read only our bounded schema; browser storage is never treated as trusted input. */
export function parsePortalState(raw: string | null): { state: PortalState; recovered: boolean } {
  const fallback = () => ({ state: createPortalState(), recovered: raw !== null });
  if (raw === null) return fallback();
  if (raw.length > PORTAL_STATE_LIMIT) return fallback();
  try {
    const value: unknown = JSON.parse(raw);
    if (!isObject(value) || !hasOnlyKeys(value, ["version", "selectedSubjectId", "ageBand", "lessons", "labs"]) || value.version !== 1 || typeof value.selectedSubjectId !== "string" || !getPortalSubject(value.selectedSubjectId) || !isObject(value.lessons) || (value.labs !== undefined && !isObject(value.labs))) return fallback();
    if (value.ageBand !== undefined && !ageBandSchema.safeParse(value.ageBand).success) return fallback();
    const lessons: Record<string, PortalLessonState> = {};
    let recovered = false;
    for (const [id, stored] of Object.entries(value.lessons)) {
      const lesson = readLessonState(id, stored);
      if (!lesson) return fallback();
      if (isObject(stored) && stored.completed === true && !lesson.completed) recovered = true;
      lessons[id] = lesson;
    }
    const labs: Partial<Record<LabId, LabRecord>> = {};
    for (const [id, stored] of Object.entries(value.labs ?? {})) {
      const lab = getPortalLab(id);
      if (!lab) return fallback();
      const draft = readLabState(lab.id, stored);
      if (!draft) return fallback();
      if (isObject(stored) && stored.completed === true && !draft.completed) recovered = true;
      labs[lab.id] = draft;
    }
    const state: PortalState = { version: 1, selectedSubjectId: value.selectedSubjectId as PortalSubjectId, lessons, labs };
    if (value.ageBand !== undefined) state.ageBand = value.ageBand as AgeBand;
    return { state, recovered };
  } catch { return fallback(); }
}

/** Lab work is checked independently of the original lesson paths. */
export function updateLabState(state: PortalState, id: LabId, patch: LabPatch): PortalState {
  if (!getPortalLab(id)) return state;
  const previous = state.labs[id] ?? blankLabRecord();
  const next: LabRecord = { ...previous, ...patch, settings: { ...(patch.settings ?? previous.settings) }, answers: { ...(patch.answers ?? previous.answers) } };
  if (JSON.stringify(next.settings) !== JSON.stringify(previous.settings) || JSON.stringify(next.answers) !== JSON.stringify(previous.answers)) { next.completed = false; delete next.completedAt; }
  const checked = readLabState(id, next);
  return checked ? { ...state, labs: { ...state.labs, [id]: checked } } : state;
}

export function recordLabState(state: PortalState, id: LabId, now = new Date()): PortalState {
  if (!getPortalLab(id)) return state;
  const draft = state.labs[id] ?? blankLabRecord();
  if (!checkLab(id, draft).passed) return state;
  return { ...state, labs: { ...state.labs, [id]: { ...draft, completed: true, completedAt: now.toISOString() } } };
}

/** Edits invalidate a previous check; post-activity reflection can be added afterwards. */
export function updateLessonState(state: PortalState, lessonId: string, patch: Partial<PortalLessonState>): PortalState {
  const lesson = getPortalLesson(lessonId);
  if (!lesson) return state;
  const previous = state.lessons[lessonId] ?? createLessonState(lessonId);
  const next: PortalLessonState = { ...previous, ...patch, observations: patch.observations ? { ...patch.observations } : { ...previous.observations } };
  const changed = next.draftCode !== previous.draftCode || next.answer !== previous.answer || next.writing !== previous.writing || JSON.stringify(next.observations) !== JSON.stringify(previous.observations);
  if (changed) { next.completed = false; delete next.completedAt; }
  else if (patch.completed === true) { next.completed = passes(lessonId, next); }
  if (!next.completed) delete next.completedAt;
  const checked = readLessonState(lessonId, next);
  if (!checked) return state;
  return { ...state, lessons: { ...state.lessons, [lessonId]: checked } };
}

export function serializePortalState(state: PortalState): string {
  const serialized = JSON.stringify(state);
  if (serialized.length > PORTAL_STATE_LIMIT) throw new Error("Learning work exceeds the browser storage limit.");
  const checked = parsePortalState(serialized);
  if (checked.recovered) throw new Error("Learning work could not be saved because its state is invalid.");
  return JSON.stringify(checked.state);
}

/** A portable copy of local work, with no account or identity fields. */
export function exportPortalWork(state: PortalState, now = new Date()) {
  const validated = parsePortalState(serializePortalState(state)).state;
  return { format: "educationos-local-learning", version: 1, exportedAt: now.toISOString(), storage: "This browser tab session", selectedSubjectId: validated.selectedSubjectId, ageBand: validated.ageBand, lessons: Object.entries(validated.lessons).map(([lessonId, draft]) => ({ lessonId, subjectId: getPortalLesson(lessonId)?.subjectId, title: getPortalLesson(lessonId)?.title, ...draft })), labs: Object.entries(validated.labs).map(([labId, draft]) => ({ labId, title: getPortalLab(labId)?.title, ...draft })), interpretation: "Self-recorded learning work. Completion follows the visible activity checks; it is not a verified assessment or a mastery score." };
}
