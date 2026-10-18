import { describe, expect, it } from "vitest";
import { createLessonState, createPortalState, exportPortalWork, parsePortalState, PORTAL_STATE_LIMIT, PORTAL_STORAGE_KEY, serializePortalState, updateLessonState } from "../src/lib/portal-state";
import { PORTAL_LESSONS } from "../src/lib/portal-learning";

describe("browser session learning state", () => {
  it("starts with no identity, seeded drafts or completion", () => {
    expect(PORTAL_STORAGE_KEY).toBe("educationos.portal.v1");
    expect(parsePortalState(null)).toEqual({ state: createPortalState(), recovered: false });
    expect(createLessonState("programming-first-message").draftCode).toContain("print(");
    expect(createLessonState().completed).toBe(false);
  });
  it("recovers malformed, oversized, unrecognised or identity-bearing storage", () => {
    for (const raw of ["broken", "x".repeat(PORTAL_STATE_LIMIT + 1), "[]", "null", JSON.stringify({ ...createPortalState(), learnerId: "injected" }), JSON.stringify({ ...createPortalState(), selectedSubjectId: "unknown" }), JSON.stringify({ ...createPortalState(), ageBand: "adult" }), JSON.stringify({ ...createPortalState(), lessons: { unknown: createLessonState() } })]) {
      expect(parsePortalState(raw)).toEqual({ state: createPortalState(), recovered: true });
    }
  });
  it("keeps subject drafts independent, preserves age choice and round trips bounded work", () => {
    let state = { ...createPortalState(), ageBand: "10-12" as const };
    state = updateLessonState(state, "programming-first-message", { draftCode: 'print("My work")' }) as typeof state;
    state = updateLessonState(state, "language-short-story", { writing: "A story draft." }) as typeof state;
    const parsed = parsePortalState(serializePortalState(state));
    expect(parsed.recovered).toBe(false);
    expect(parsed.state.lessons["programming-first-message"].draftCode).toBe('print("My work")');
    expect(parsed.state.lessons["language-short-story"].writing).toBe("A story draft.");
    expect(parsed.state.ageBand).toBe("10-12");
  });
  it("round trips escape-heavy drafts within every UI field limit without losing work", () => {
    let state = createPortalState();
    for (const lesson of PORTAL_LESSONS) {
      state = updateLessonState(state, lesson.id, {
        draftCode: lesson.activity.kind === "code" ? '"'.repeat(8000) : "",
        writing: lesson.activity.kind === "writing" ? '"'.repeat(5000) : "",
        observations: lesson.activity.kind === "experiment" ? { flat: "60", folded: "0", notice: '"'.repeat(1200) } : {},
        reflection: '"'.repeat(1200),
      });
    }
    const serialized = serializePortalState(state);
    expect(serialized.length).toBeGreaterThan(120_000);
    expect(parsePortalState(serialized)).toEqual({ state, recovered: false });
  });
  it("throws on invalid or oversized serialization instead of saving an empty fallback", () => {
    const id = "programming-first-message";
    const invalid = { ...createPortalState(), lessons: { [id]: { ...createLessonState(id), completed: true } } };
    expect(() => serializePortalState(invalid)).toThrow("state is invalid");
    const oversized = { ...createPortalState(), lessons: { [id]: { ...createLessonState(id), draftCode: "x".repeat(PORTAL_STATE_LIMIT) } } };
    expect(() => serializePortalState(oversized)).toThrow("storage limit");
  });
  it("records completion only after the stored activity passes its visible check", () => {
    const id = "programming-first-message";
    let state = updateLessonState(createPortalState(), id, { completed: true });
    expect(state.lessons[id].completed).toBe(false);
    state = updateLessonState(state, id, { draftCode: 'print("Hello, world!")\nprint("I can make things.")' });
    state = updateLessonState(state, id, { completed: true, completedAt: "2026-10-18T12:00:00.000Z" });
    expect(state.lessons[id].completed).toBe(true);
    expect(parsePortalState(serializePortalState(state)).state.lessons[id].completed).toBe(true);
  });
  it("invalidates completion and its timestamp when the submitted work changes", () => {
    const id = "mathematics-patterns";
    let state = updateLessonState(createPortalState(), id, { answer: "15" });
    state = updateLessonState(state, id, { completed: true, completedAt: "2026-10-18T12:00:00.000Z" });
    expect(state.lessons[id].completed).toBe(true);
    const reflected = updateLessonState(state, id, { reflection: "I added three to twelve." });
    expect(reflected.lessons[id].completed).toBe(true);
    const edited = updateLessonState(reflected, id, { answer: "14" });
    expect(edited.lessons[id].completed).toBe(false);
    expect(edited.lessons[id].completedAt).toBeUndefined();
    expect(state.lessons[id].answer).toBe("15");
  });
  it("removes a forged completion flag while retaining the valid draft", () => {
    const id = "mathematics-patterns";
    const stored = { ...createPortalState(), lessons: { [id]: { ...createLessonState(id), answer: "14", completed: true } } };
    const parsed = parsePortalState(JSON.stringify(stored));
    expect(parsed.recovered).toBe(true);
    expect(parsed.state.lessons[id].answer).toBe("14");
    expect(parsed.state.lessons[id].completed).toBe(false);
  });
  it("rejects unexpected lesson fields, unknown observation fields and oversized drafts", () => {
    const id = "science-paper-bridge";
    const initial = createLessonState(id);
    for (const draft of [{ ...initial, identity: "ignored?" }, { ...initial, writing: "x".repeat(6001) }, { ...initial, reflection: "x".repeat(1201) }, { ...initial, observations: { unknown: "text" } }, { ...initial, completedAt: "bad date" }, { ...initial, observations: { flat: 4 } }]) {
      const raw = JSON.stringify({ ...createPortalState(), lessons: { [id]: draft } });
      expect(parsePortalState(raw).recovered).toBe(true);
      expect(parsePortalState(raw).state.lessons).toEqual({});
    }
  });
  it("does not allow prototype keys or unknown lesson mutations", () => {
    expect(parsePortalState('{"version":1,"selectedSubjectId":"science","lessons":{"__proto__":{}}}').recovered).toBe(true);
    const state = createPortalState();
    expect(updateLessonState(state, "__proto__", { answer: "yes" })).toBe(state);
    expect(updateLessonState(state, "mathematics-patterns", { answer: "not-an-option" })).toBe(state);
  });
  it("exports checked drafts and reflections with an explicit interpretation", () => {
    const state = updateLessonState(createPortalState(), "language-short-story", { writing: "An unfinished story.", reflection: "I want to choose a clearer ending." });
    const exported = exportPortalWork(state, new Date("2026-10-18T00:00:00Z"));
    expect(exported.lessons[0]).toMatchObject({ lessonId: "language-short-story", subjectId: "language", writing: "An unfinished story.", completed: false });
    expect(exported.interpretation).toContain("not a verified assessment");
    expect(JSON.stringify(exported)).not.toContain("learnerId");
  });
});
