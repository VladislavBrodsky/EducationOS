import { describe, expect, it } from "vitest";
import { PRACTICE_CODE_LIMITS, runPracticeCode } from "../src/lib/learning-runner";
import { checkPortalActivity, getPortalLesson, getSubjectLessons, PORTAL_LESSONS, PORTAL_SUBJECTS } from "../src/lib/portal-learning";

describe("bounded EducationOS practice code", () => {
  it("executes ordered messages, named values and arithmetic without host evaluation", () => {
    expect(runPracticeCode('name = "Ada"\nprint("Hello, " + name)\nseeds = 4\nseeds = seeds + 3\nprint(seeds)\nprint((2 + 3) * 4 / 2)')).toMatchObject({ ok: true, output: ["Hello, Ada", "7", "10"] });
  });
  it("executes nested repeats and updates variables in sequence", () => {
    expect(runPracticeCode('count = 0\nrepeat 2:\n  repeat 3:\n    count = count + 1\nprint(count)')).toMatchObject({ ok: true, output: ["6"] });
    expect(runPracticeCode('repeat 0:\n  print("no")\nprint("done")')).toMatchObject({ ok: true, output: ["done"] });
  });
  it("ignores blank and comment lines while reporting original line numbers", () => {
    const result = runPracticeCode('# a note\n\nprint("hello")\nprint(missing)');
    expect(result).toMatchObject({ ok: false, output: ["hello"], error: { line: 4 } });
    expect(result.error?.message).toContain("Give missing a value");
  });
  it("handles quoted punctuation and escaped quotes without parsing them as code", () => {
    expect(runPracticeCode('print("<script>globalThis.alert(1)</script>")')).toMatchObject({ ok: true, output: ["<script>globalThis.alert(1)</script>"] });
    expect(runPracticeCode('print("Say \\"Hello\\"")')).toMatchObject({ ok: true, output: ['Say "Hello"'] });
    expect(runPracticeCode("print('Hello')")).toMatchObject({ ok: true, output: ["Hello"] });
  });
  it.each(['fetch("https://example.com")', 'import os', 'while True:', 'print(globalThis.location)', 'print(__import__("os"))', 'x = [1, 2]', 'print("text".constructor)', 'print(1); print(2)', 'print(`hello`)', 'print(eval("2+2"))'])("rejects unsupported host-like syntax: %s", (source) => {
    expect(runPracticeCode(source).ok).toBe(false);
  });
  it("gives actionable errors for indentation, missing quotes and invalid calculation", () => {
    expect(runPracticeCode('repeat 2:\n print("x")').error?.line).toBe(2);
    expect(runPracticeCode('repeat 2:\n\tprint("x")').error?.message).toContain("without tabs");
    expect(runPracticeCode('repeat 2:').error?.message).toContain("Add a line below");
    expect(runPracticeCode('print("hello)').error?.message).toContain("matching quote");
    expect(runPracticeCode('print(1 / 0)').error?.message).toContain("Division by zero");
    expect(runPracticeCode('print("a" + 2)').ok).toBe(false);
  });
  it("bounds source length, repeat values, nesting, output and operations", () => {
    expect(runPracticeCode("a".repeat(PRACTICE_CODE_LIMITS.sourceLength + 1)).ok).toBe(false);
    expect(runPracticeCode('repeat 41:\n  print("x")').error?.message).toContain("0 to 40");
    expect(runPracticeCode('repeat -1:\n  print("x")').ok).toBe(false);
    expect(runPracticeCode('repeat 1.5:\n  print("x")').ok).toBe(false);
    const deep = 'repeat 1:\n  repeat 1:\n    repeat 1:\n      repeat 1:\n        repeat 1:\n          print("x")';
    expect(runPracticeCode(deep).error?.message).toContain("four nested");
    const manyPrints = runPracticeCode('repeat 40:\n  repeat 40:\n    print("x")');
    expect(manyPrints.output).toHaveLength(100);
    expect(manyPrints.ok).toBe(false);
    const manySteps = runPracticeCode('count = 0\nrepeat 40:\n  repeat 40:\n    count = count + 1');
    expect(manySteps.ok).toBe(false);
    expect(manySteps.operations).toBeLessThanOrEqual(PRACTICE_CODE_LIMITS.operations + 1);
  });
  it("bounds expression complexity, numerical growth and text growth", () => {
    expect(runPracticeCode(`print(${"(".repeat(18)}1${")".repeat(18)})`).ok).toBe(false);
    expect(runPracticeCode('print(1000000000000 * 1000000000000)').ok).toBe(false);
    const result = runPracticeCode('word = "hello"\nrepeat 40:\n  word = word + word');
    expect(result.ok).toBe(false);
    expect(result.error?.message).toContain("text grew too long");
  });
});

describe("authored portal activities", () => {
  it("has three linked, usable lessons in each of the five subjects", () => {
    expect(PORTAL_SUBJECTS).toHaveLength(5);
    expect(new Set(PORTAL_LESSONS.map((lesson) => lesson.id)).size).toBe(15);
    for (const subject of PORTAL_SUBJECTS) {
      const lessons = getSubjectLessons(subject.id);
      expect(lessons.map((lesson) => lesson.id)).toEqual(subject.lessonIds);
      expect(lessons).toHaveLength(3);
      expect(lessons.every((lesson) => lesson.learn.length >= 3 && lesson.objective && lesson.reflection)).toBe(true);
    }
  });
  it("checks actual program output and explains the scope of its check", () => {
    const lesson = getPortalLesson("programming-first-message")!;
    expect(checkPortalActivity(lesson, { code: 'print("Hello, world!")\nprint("I can make things.")' })).toMatchObject({ passed: true, output: ["Hello, world!", "I can make things."] });
    expect(checkPortalActivity(lesson, { code: 'print("Hello, world!")' }).passed).toBe(false);
    expect(checkPortalActivity(lesson, { code: 'print(nope)' })).toMatchObject({ passed: false, error: { line: 1 } });
  });
  it("checks the selected option and supports a useful retry", () => {
    const lesson = getPortalLesson("mathematics-patterns")!;
    expect(checkPortalActivity(lesson, {}).passed).toBe(false);
    expect(checkPortalActivity(lesson, { answer: "14" })).toMatchObject({ passed: false });
    expect(checkPortalActivity(lesson, { answer: "15" })).toMatchObject({ passed: true });
  });
  it("records writing by a visible length criterion without pretending to assess quality", () => {
    const lesson = getPortalLesson("language-precise-description")!;
    expect(checkPortalActivity(lesson, { writing: "Too short." }).passed).toBe(false);
    const checked = checkPortalActivity(lesson, { writing: Array(20).fill("word").join(" ") });
    expect(checked.passed).toBe(true);
    expect(checked.feedback).toContain("not writing quality");
    expect(checkPortalActivity(lesson, { writing: "word ".repeat(2000) }).passed).toBe(false);
  });
  it("accepts zero and capped experiment times with observation, without claiming improvement", () => {
    const lesson = getPortalLesson("science-paper-bridge")!;
    const observations = { flat: "60", folded: "0", notice: "The folded paper slipped off the support." };
    expect(checkPortalActivity(lesson, { observations })).toMatchObject({ passed: true });
    expect(checkPortalActivity(lesson, { observations }).feedback).toContain("does not verify");
    for (const invalid of ["-1", "61", "1e1", "Infinity", "0.5", ""]) expect(checkPortalActivity(lesson, { observations: { ...observations, folded: invalid } }).passed).toBe(false);
    expect(checkPortalActivity(lesson, { observations: { ...observations, notice: "" } }).passed).toBe(false);
  });
});
