import { describe, expect, it } from "vitest";
import { runPracticeCode } from "../src/lib/learning-runner";
import { assessLoopLoom, loopLoomRepeats, loopLoomSnapshot, loopLoomSource, stepLoopLoom } from "../src/lib/labs/loop-loom";
import { blankLabRecord, type LabRecord } from "../src/lib/labs/types";

function answered(repeats = 3): LabRecord {
  return { ...blankLabRecord(), settings: { repeats: String(repeats) }, answers: { prediction: "3", predictionSubmitted: "yes", observation: String(repeats * 2), transfer: "12", transferFirst: "Clap, Tap, Snap" } };
}

describe("Loop Loom exact execution model", () => {
  it.each([0, 1, 2, 3, 4, 5, 6])("matches the existing interpreter for %i repeats and every intermediate prefix", repeats => {
    const result = runPracticeCode(loopLoomSource(repeats));
    expect(result.ok).toBe(true);
    expect(result.output).toEqual(Array.from({ length: repeats }, () => ["Clap", "Tap"]).flat());
    for (let steps = 0; steps <= repeats * 2; steps += 1) {
      const snapshot = loopLoomSnapshot(repeats, steps);
      expect(snapshot.output).toEqual(result.output.slice(0, steps));
      expect(snapshot.output).toHaveLength(steps);
      expect(snapshot.completedBlocks).toBe(Math.floor(steps / 2));
      expect(snapshot.output.filter(line => line === "Clap")).toHaveLength(Math.ceil(steps / 2));
      expect(snapshot.output.filter(line => line === "Tap")).toHaveLength(Math.floor(steps / 2));
      expect(snapshot.nextInstruction).toBe(steps === repeats * 2 ? null : steps % 2 === 0 ? "Clap" : "Tap");
      expect(snapshot.finished).toBe(steps === repeats * 2);
    }
  });

  it("uses precisely the authored default source and result", () => {
    expect(loopLoomSource(3)).toBe('repeat 3:\n  print("Clap")\n  print("Tap")');
    expect(loopLoomSnapshot(3, 6).output).toEqual(["Clap", "Tap", "Clap", "Tap", "Clap", "Tap"]);
  });

  it("executes one output instruction per step and stays finished at its boundary", () => {
    let state = loopLoomSnapshot(6);
    for (let i = 1; i <= 12; i += 1) {
      state = stepLoopLoom(state);
      expect(state.steps).toBe(i);
    }
    expect(stepLoopLoom(state)).toEqual(state);
    expect(stepLoopLoom(loopLoomSnapshot(0))).toEqual(loopLoomSnapshot(0));
  });

  it("resets from inputs, clamps impossible cursors and treats zero as a real setting", () => {
    expect(loopLoomRepeats("0")).toBe(0);
    for (const malformed of [undefined, "", "-1", "7", "3.5", "Infinity", "1e1", "03"]) expect(loopLoomRepeats(malformed)).toBe(3);
    expect(loopLoomSnapshot(3, -1).steps).toBe(0);
    expect(loopLoomSnapshot(3, 200).steps).toBe(6);
    expect(loopLoomSnapshot(3, NaN).steps).toBe(0);
    expect(loopLoomSnapshot(2).output).toEqual([]);
    expect(loopLoomSnapshot(0)).toMatchObject({ output: [], totalLines: 0, completedBlocks: 0, finished: true, nextInstruction: null });
  });
});

describe("Loop Loom independent assessment", () => {
  it("accepts an incorrect initial prediction when observed and transfer answers show understanding", () => {
    expect(assessLoopLoom(answered())).toMatchObject({ passed: true });
    expect(assessLoopLoom(answered()).feedback).toContain("original prediction did not have to be right");
  });
  it.each([0, 1, 2, 3, 4, 5, 6])("accepts correct evidence for %i repeats without animation state", repeats => {
    expect(assessLoopLoom(answered(repeats)).passed).toBe(true);
  });
  it("requires a submitted prediction rather than reveal or playback as evidence", () => {
    const record = answered();
    delete record.answers.predictionSubmitted;
    expect(assessLoopLoom(record).passed).toBe(false);
    expect(assessLoopLoom(blankLabRecord()).passed).toBe(false);
  });
  it("rejects wrong counts, invalid settings and incorrect first-block order", () => {
    for (const [key, value] of [["prediction", ""], ["prediction", "13"], ["observation", "3"], ["observation", "6.0"], ["transfer", "4"], ["transferFirst", "Clap, Clap, Clap"]]) {
      const record = answered();
      record.answers[key] = value;
      expect(assessLoopLoom(record).passed).toBe(false);
    }
    const badSetting = answered();
    badSetting.settings.repeats = "7";
    expect(assessLoopLoom(badSetting).passed).toBe(false);
  });
  it("does not let completion flags or a reflection replace correct work", () => {
    expect(assessLoopLoom({ ...blankLabRecord(), completed: true, reflection: "I played the animation." }).passed).toBe(false);
  });
});
