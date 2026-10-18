"use client";

import { createContext, useContext, useSyncExternalStore, type ReactNode } from "react";
import type { AgeBand } from "@/contracts/learning";
import { blankDemoSession, DEMO_STORAGE_KEY, exportDemoEvidence, parseDemoSession, type DemoDraft, type DemoSession } from "@/lib/demo-state";

type DemoSnapshot = { session: DemoSession; ready: boolean; notice: string };
type DemoContextValue = DemoSnapshot & {
  draft: DemoDraft;
  setAgeBand: (ageBand: AgeBand) => void;
  updateDraft: (update: Partial<DemoDraft>) => void;
  clearDemo: () => void;
  downloadEvidence: () => void;
};
const DemoContext = createContext<DemoContextValue | null>(null);
const serverSnapshot: DemoSnapshot = { session: blankDemoSession(), ready: false, notice: "" };
let browserSnapshot: DemoSnapshot | undefined;
const listeners = new Set<() => void>();
function getSnapshot(): DemoSnapshot {
  if (!browserSnapshot) {
    try {
      const result = parseDemoSession(sessionStorage.getItem(DEMO_STORAGE_KEY));
      browserSnapshot = { session: result.session, ready: true, notice: result.recovered ? "The saved demo could not be read. A fresh demo is ready." : "" };
    } catch { browserSnapshot = { session: blankDemoSession(), ready: true, notice: "Browser storage is unavailable. Your demo works until you leave this page." }; }
  }
  return browserSnapshot;
}
function subscribe(listener: () => void) { listeners.add(listener); return () => { listeners.delete(listener); }; }
function publish(session: DemoSession, notice = getSnapshot().notice, persist = true) {
  if (persist) {
    try { sessionStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(session)); }
    catch { notice = "Browser storage is unavailable. Export your notes before leaving this page."; }
  }
  browserSnapshot = { session, ready: true, notice };
  for (const listener of listeners) listener();
}
/** This external store reads browser-only storage after hydration, never during server rendering. */
export function DemoProvider({ children }: { children: ReactNode }) {
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, () => serverSnapshot);
  function updateDraft(update: Partial<DemoDraft>) {
    const current = getSnapshot().session;
    publish({ ...current, drafts: { ...current.drafts, [current.ageBand]: { ...current.drafts[current.ageBand], ...update } } });
  }
  function clearDemo() {
    try { sessionStorage.removeItem(DEMO_STORAGE_KEY); } catch { /* In-memory state is still cleared. */ }
    publish(blankDemoSession(), "All demo notes in this tab have been cleared.", false);
  }
  function downloadEvidence() {
    const current = getSnapshot().session;
    const blob = new Blob([JSON.stringify(exportDemoEvidence(current), null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "educationos-demo-evidence.json";
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    publish(current, "Demo evidence exported. The file contains the notes you entered in the selected age band.", false);
  }
  return <DemoContext.Provider value={{ ...snapshot, draft: snapshot.session.drafts[snapshot.session.ageBand], setAgeBand: (ageBand) => publish({ ...getSnapshot().session, ageBand }), updateDraft, clearDemo, downloadEvidence }}>{children}</DemoContext.Provider>;
}
export function useDemo(): DemoContextValue {
  const context = useContext(DemoContext);
  if (!context) throw new Error("DemoProvider is required.");
  return context;
}
