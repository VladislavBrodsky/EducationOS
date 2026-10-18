import { describe, expect, it } from "vitest";
import { blankLabRecord } from "../src/lib/labs/types";
import { createPortalState, exportPortalWork, parsePortalState, recordLabState, serializePortalState, updateLabState, updateLessonState } from "../src/lib/portal-state";

const loomAnswers = { prediction: "5", predictionSubmitted: "yes", observation: "6", transfer: "12", transferFirst: "Clap, Tap, Snap" };

describe("discovery lab records", () => {
  it("opens original version1 drafts without labs and keeps their work", () => {
    const previous = { version: 1, selectedSubjectId: "programming", lessons: updateLessonState(createPortalState(), "programming-first-message", { draftCode: 'print("Saved before labs")' }).lessons };
    const parsed = parsePortalState(JSON.stringify(previous));
    expect(parsed.recovered).toBe(false);
    expect(parsed.state.labs).toEqual({});
    expect(parsed.state.lessons["programming-first-message"].draftCode).toContain("Saved before labs");
  });
  it("records current checked evidence independently of playback and original lessons", () => {
    let state = updateLabState(createPortalState(), "loop-loom", { settings: { repeats: "3" }, answers: loomAnswers });
    state = recordLabState(state, "loop-loom", new Date("2026-10-18T12:00:00.000Z"));
    expect(state.labs["loop-loom"]).toMatchObject({ completed: true, completedAt: "2026-10-18T12:00:00.000Z" });
    expect(state.lessons).toEqual({});
    expect(parsePortalState(serializePortalState(state))).toEqual({ state, recovered: false });
  });
  it("invalidates checks when answers or settings change, preserving later reflections", () => {
    let state = updateLabState(createPortalState(), "loop-loom", { answers: loomAnswers });
    state = recordLabState(state, "loop-loom");
    const reflection = updateLabState(state, "loop-loom", { reflection: "The loop repeats a whole block." });
    expect(reflection.labs["loop-loom"]?.completed).toBe(true);
    const changed = updateLabState(reflection, "loop-loom", { settings: { repeats: "6" }, answers: {} });
    expect(changed.labs["loop-loom"]).toMatchObject({ completed: false, answers: {}, reflection: "The loop repeats a whole block." });
    expect(changed.labs["loop-loom"]?.completedAt).toBeUndefined();
    expect(state.labs["loop-loom"]?.answers.observation).toBe("6");
  });
  it("rejects a forged completion while retaining bounded draft answers", () => {
    const state = { ...createPortalState(), labs: { "loop-loom": { ...blankLabRecord(), answers: { prediction: "3" }, completed: true } } };
    const parsed = parsePortalState(JSON.stringify(state));
    expect(parsed.recovered).toBe(true);
    expect(parsed.state.labs["loop-loom"]).toMatchObject({ completed: false, answers: { prediction: "3" } });
    expect(recordLabState(parsed.state, "loop-loom")).toBe(parsed.state);
  });
  it("rejects unknown labs, prototype keys, identity fields and oversized text", () => {
    const cases = [
      { unknown: blankLabRecord() },
      JSON.parse('{"__proto__":{}}'),
      { "same-half": { ...blankLabRecord(), answers: { name: "a person" } } },
      { "same-half": { ...blankLabRecord(), settings: { selection: "x".repeat(101) } } },
      { "hidden-cubes": { ...blankLabRecord(), reflection: "x".repeat(1201) } },
      { "hidden-cubes": { ...blankLabRecord(), answers: { prediction: 12 } } },
    ];
    for (const labs of cases) expect(parsePortalState(JSON.stringify({ ...createPortalState(), labs })).recovered).toBe(true);
  });
  it("exports independent lab work and resets to a blank notebook", () => {
    const state = updateLabState(createPortalState(), "hidden-cubes", { settings: { preset: "3x2x2" }, answers: { prediction: "9" }, reflection: "I want to count one layer first." });
    const copy = exportPortalWork(state, new Date("2026-10-18T00:00:00Z"));
    expect(copy.labs[0]).toMatchObject({ labId: "hidden-cubes", title: "Hidden Cube Builder", answers: { prediction: "9" }, completed: false });
    expect(createPortalState().labs).toEqual({});
  });
});
