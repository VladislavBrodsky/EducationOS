"use client";

import { createContext, useContext, useEffect, useState, useSyncExternalStore, type ReactNode } from "react";
import type { AgeBand, PublishedMission } from "@/contracts/learning";
import { getDemoMission } from "@/content/missions";
import { fetchPublishedMission } from "@/lib/api/curriculum";
import { blankDemoSession, DEMO_STORAGE_KEY, exportDemoEvidence, parseDemoSession, type DemoDraft, type DemoSession } from "@/lib/demo-state";

type DemoSnapshot = { session: DemoSession; ready: boolean; notice: string };
type DemoContextValue = DemoSnapshot & {
  draft: DemoDraft;
  mission: PublishedMission;
  curriculumStatus: "loading" | "live" | "offline";
  retryCurriculum: () => void;
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
  const [retryKey, setRetryKey] = useState(0);
  const [curriculum, setCurriculum] = useState<{ ageBand: AgeBand; status: "loading" | "live" | "offline"; mission?: PublishedMission }>({ ageBand: "10-12", status: "loading" });
  useEffect(() => {
    if (!snapshot.ready) return;
    const controller = new AbortController();
    const ageBand = snapshot.session.ageBand;
    fetchPublishedMission(ageBand, controller.signal).then(
      (mission) => { if (!controller.signal.aborted) setCurriculum({ ageBand, status: "live", mission }); },
      () => { if (!controller.signal.aborted) setCurriculum({ ageBand, status: "offline" }); },
    );
    return () => controller.abort();
  }, [snapshot.ready, snapshot.session.ageBand, retryKey]);
  const curriculumStatus = curriculum.ageBand === snapshot.session.ageBand ? curriculum.status : "loading";
  const mission = curriculum.ageBand === snapshot.session.ageBand && curriculum.mission ? curriculum.mission : getDemoMission(snapshot.session.ageBand);
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
  return <DemoContext.Provider value={{ ...snapshot, draft: snapshot.session.drafts[snapshot.session.ageBand], mission, curriculumStatus, retryCurriculum: () => { setCurriculum({ ageBand: snapshot.session.ageBand, status: "loading" }); setRetryKey((current) => current + 1); }, setAgeBand: (ageBand) => publish({ ...getSnapshot().session, ageBand }), updateDraft, clearDemo, downloadEvidence }}>{children}</DemoContext.Provider>;
}
export function useDemo(): DemoContextValue {
  const context = useContext(DemoContext);
  if (!context) throw new Error("DemoProvider is required.");
  return context;
}
