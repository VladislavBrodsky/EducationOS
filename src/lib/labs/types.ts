export const LAB_IDS = ["loop-loom", "same-half", "hidden-cubes"] as const;
export type LabId = typeof LAB_IDS[number];
export type LabRecord = {
  version: 1;
  settings: Record<string, string>;
  answers: Record<string, string>;
  reflection: string;
  completed: boolean;
  completedAt?: string;
};
export type LabPatch = Partial<Pick<LabRecord, "settings" | "answers" | "reflection">>;
export type LabCheck = { passed: boolean; feedback: string };
export type LabProps = {
  record: LabRecord;
  ready: boolean;
  onChange: (patch: LabPatch) => void;
  onRecord: () => LabCheck;
};
export function blankLabRecord(): LabRecord {
  return { version: 1, settings: {}, answers: {}, reflection: "", completed: false };
}
