import { describe, expect, it } from "vitest";
import { getPortalResumeItems } from "../src/lib/portal-resume";
import { createLessonState, createPortalState, updateLabState, updateLessonState } from "../src/lib/portal-state";
import { blankLabRecord } from "../src/lib/labs/types";

describe("Today unfinished work", () => {
  it("does not advertise blank records, starter code or default lab settings as work", () => {
    const state = createPortalState();
    state.lessons["programming-first-message"] = createLessonState("programming-first-message");
    state.lessons["language-short-story"] = { ...createLessonState(), writing: "   ", reflection: "\n" };
    state.labs["loop-loom"] = { ...blankLabRecord(), settings: { repeats: "3" } };
    state.labs["same-half"] = { ...blankLabRecord(), settings: { selection: "0,1,2,3,4,5" } };
    state.labs["hidden-cubes"] = { ...blankLabRecord(), settings: { preset: "3x2x2" } };
    expect(getPortalResumeItems(state)).toEqual([]);
  });

  it("offers edited code, choices, writing and honest zero observations", () => {
    let state = createPortalState();
    state = updateLessonState(state, "programming-first-message", { draftCode: 'print("My draft")' });
    state = updateLessonState(state, "mathematics-patterns", { answer: "14" });
    state = updateLessonState(state, "language-short-story", { writing: "A key turned in the lock." });
    state = updateLessonState(state, "science-paper-bridge", { observations: { flat: "0" } });
    expect(getPortalResumeItems(state).map(item => item.id)).toEqual([
      "programming-first-message", "science-paper-bridge", "mathematics-patterns", "language-short-story",
    ]);
  });

  it("keeps unfinished lab drafts available without changing the selected subject", () => {
    let state = { ...createPortalState(), selectedSubjectId: "science" as const };
    state = updateLabState(state, "loop-loom", { answers: { prediction: "0" } }) as typeof state;
    state = updateLabState(state, "same-half", { answers: { prediction: "unsure" } }) as typeof state;
    state = updateLabState(state, "hidden-cubes", { reflection: "I will compare layers." }) as typeof state;
    expect(getPortalResumeItems(state)).toMatchObject([
      { id: "loop-loom", kind: "lab", path: "/labs/loop-loom" },
      { id: "same-half", kind: "lab", path: "/labs/same-half" },
      { id: "hidden-cubes", kind: "lab", path: "/labs/hidden-cubes" },
    ]);
    expect(state.selectedSubjectId).toBe("science");
  });

  it("retains changed investigation settings, including cleared cells, as unfinished work", () => {
    let state = createPortalState();
    state = updateLabState(state, "loop-loom", { settings: { repeats: "0" } });
    state = updateLabState(state, "same-half", { settings: { selection: "" } });
    state = updateLabState(state, "hidden-cubes", { settings: { preset: "3x3x3" } });
    expect(getPortalResumeItems(state).map(item => item.id)).toEqual(["loop-loom", "same-half", "hidden-cubes"]);
  });

  it("excludes recorded activities and labs even when they contain saved work", () => {
    let state = createPortalState();
    state = updateLessonState(state, "mathematics-patterns", { answer: "15" });
    state = updateLessonState(state, "mathematics-patterns", { completed: true });
    state.labs["loop-loom"] = { ...blankLabRecord(), answers: { prediction: "5" }, completed: true };
    expect(getPortalResumeItems(state)).toEqual([]);
  });

  it("offers a saved reflection without requiring an activity answer", () => {
    const state = updateLessonState(createPortalState(), "programming-first-message", { reflection: "What happens if I swap the lines?" });
    expect(getPortalResumeItems(state)).toMatchObject([{ id: "programming-first-message", path: "/learn/programming-first-message" }]);
  });
});
