"use client";

import { createContext, useContext, useSyncExternalStore, type ReactNode } from "react";
import { checkPortalActivity, getPortalLesson, type ActivitySubmission, type PortalSubjectId } from "@/lib/portal-learning";
import { createLessonState, createPortalState, parsePortalState, PORTAL_STORAGE_KEY, serializePortalState, updateLessonState, type PortalLessonState, type PortalState } from "@/lib/portal-state";
import { recordLabState, updateLabState } from "@/lib/portal-state";
import { checkLab } from "@/lib/labs/checks";
import { blankLabRecord, type LabCheck, type LabId, type LabPatch, type LabRecord } from "@/lib/labs/types";

type Snapshot = { state: PortalState; ready: boolean; notice: string };
type PortalContextValue = Snapshot & {
  selectSubject: (id: PortalSubjectId) => void;
  lessonState: (id: string) => PortalLessonState;
  updateLesson: (id: string, patch: Partial<PortalLessonState>) => void;
  checkActivity: (id: string, submission: ActivitySubmission) => ReturnType<typeof checkPortalActivity>;
  labState: (id: LabId) => LabRecord;
  updateLab: (id: LabId, patch: LabPatch) => void;
  recordLab: (id: LabId) => LabCheck;
  exportWork: () => void;
  clearWork: () => void;
};
const PortalContext = createContext<PortalContextValue | null>(null);
const serverSnapshot: Snapshot = { state: createPortalState(), ready: false, notice: "" };
let browserSnapshot: Snapshot | undefined;
const listeners = new Set<() => void>();

function getSnapshot(): Snapshot {
  if (!browserSnapshot) {
    try {
      const { state, recovered } = parsePortalState(sessionStorage.getItem(PORTAL_STORAGE_KEY));
      browserSnapshot = { state, ready: true, notice: recovered ? "Some saved work could not be read. The available activities are ready to explore." : "" };
    } catch {
      browserSnapshot = { state: createPortalState(), ready: true, notice: "Browser storage is unavailable. Export your work before leaving this page." };
    }
  }
  return browserSnapshot;
}
function subscribe(listener: () => void) { listeners.add(listener); return () => { listeners.delete(listener); }; }
function publish(state: PortalState, notice = getSnapshot().notice, persist = true) {
  if (persist) {
    try { sessionStorage.setItem(PORTAL_STORAGE_KEY, serializePortalState(state)); }
    catch { notice = "Your latest work could not be saved in this tab. Export your work before leaving this page."; }
  }
  browserSnapshot = { state, ready: true, notice };
  listeners.forEach(listener => listener());
}

export function PortalProvider({ children }: { children: ReactNode }) {
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, () => serverSnapshot);
  function updateLesson(id: string, patch: Partial<PortalLessonState>) {
    publish(updateLessonState(getSnapshot().state, id, patch));
  }
  function checkActivity(id: string, submission: ActivitySubmission) {
    const lesson = getPortalLesson(id);
    if (!lesson) return { passed: false, feedback: "This activity is unavailable." };
    const result = checkPortalActivity(lesson, submission);
    if (result.passed) updateLesson(id, { completed: true, completedAt: new Date().toISOString() });
    return result;
  }
  function updateLab(id: LabId, patch: LabPatch) { publish(updateLabState(getSnapshot().state, id, patch)); }
  function recordLab(id: LabId) {
    const state = getSnapshot().state;
    const result = checkLab(id, state.labs[id] ?? blankLabRecord());
    if (result.passed) publish(recordLabState(state, id));
    return result;
  }
  function exportWork() {
    const state = getSnapshot().state;
    const blob = new Blob([JSON.stringify({ product: "EducationOS learning portal", syntheticPreview: true, storage: "browser-tab-only", exportedAt: new Date().toISOString(), ...state }, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "educationos-learning-work.json";
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    publish(state, "Your work has been exported. Keep the file somewhere private.", false);
  }
  function clearWork() {
    try { sessionStorage.removeItem(PORTAL_STORAGE_KEY); } catch { /* In-memory work is cleared even when storage is blocked. */ }
    publish(createPortalState(), "All portal work in this tab has been cleared.", false);
  }
  return <PortalContext.Provider value={{ ...snapshot, selectSubject: id => publish({ ...getSnapshot().state, selectedSubjectId: id }), lessonState: id => snapshot.state.lessons[id] ?? createLessonState(id), updateLesson, checkActivity, labState: id => snapshot.state.labs[id] ?? blankLabRecord(), updateLab, recordLab, exportWork, clearWork }}>{children}</PortalContext.Provider>;
}

export function usePortal() {
  const context = useContext(PortalContext);
  if (!context) throw new Error("PortalProvider is required.");
  return context;
}
