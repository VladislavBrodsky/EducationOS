import { PORTAL_LABS } from "@/lib/labs/catalog";
import { cubePreset } from "@/lib/labs/hidden-cubes";
import { loopLoomRepeats } from "@/lib/labs/loop-loom";
import { DEFAULT_HALF_SELECTION, readHalfSelection, writeHalfSelection } from "@/lib/labs/same-half";
import type { LabId, LabRecord } from "@/lib/labs/types";
import { PORTAL_LESSONS, type PortalLesson, type PortalSubjectId } from "@/lib/portal-learning";
import type { PortalLessonState, PortalState } from "@/lib/portal-state";

export type PortalResumeItem = {
  id: string;
  kind: "activity" | "lab";
  title: string;
  subjectId: PortalSubjectId;
  path: string;
};

/** Starter code and untouched records do not represent a learner's draft. */
export function hasUnfinishedLessonWork(lesson: PortalLesson, draft?: PortalLessonState): boolean {
  if (!draft || draft.completed) return false;
  if (draft.reflection.trim()) return true;
  switch (lesson.activity.kind) {
    case "code": return Boolean(draft.draftCode.trim()) && draft.draftCode.trim() !== lesson.activity.starterCode.trim();
    case "choice": return Boolean(draft.answer.trim());
    case "writing": return Boolean(draft.writing.trim());
    case "experiment": return Object.values(draft.observations).some(value => Boolean(value.trim()));
  }
}

function hasUnfinishedLabWork(id: LabId, record?: LabRecord): boolean {
  if (!record || record.completed) return false;
  if (record.reflection.trim() || Object.values(record.answers).some(value => Boolean(value.trim()))) return true;
  switch (id) {
    case "loop-loom": return loopLoomRepeats(record.settings.repeats) !== loopLoomRepeats();
    case "same-half": return writeHalfSelection(readHalfSelection(record.settings.selection)) !== writeHalfSelection(DEFAULT_HALF_SELECTION);
    case "hidden-cubes": return cubePreset(record.settings.preset) !== cubePreset();
  }
}

/** Stable catalogue order avoids implying that a draft has a recorded recency. */
export function getPortalResumeItems(state: PortalState): PortalResumeItem[] {
  return [
    ...PORTAL_LESSONS.filter(lesson => hasUnfinishedLessonWork(lesson, state.lessons[lesson.id])).map(lesson => ({ id: lesson.id, kind: "activity" as const, title: lesson.title, subjectId: lesson.subjectId, path: `/learn/${lesson.id}` })),
    ...PORTAL_LABS.filter(lab => hasUnfinishedLabWork(lab.id, state.labs[lab.id])).map(lab => ({ id: lab.id, kind: "lab" as const, title: lab.title, subjectId: lab.subjectId, path: `/labs/${lab.id}` })),
  ];
}
