import { describe, expect, it } from "vitest";
import { assessSameHalf, DEFAULT_HALF_SELECTION, equalSelectedArea, HALF_PATTERNS, isHalf, readHalfSelection, toggleHalfCell, unequalSelectedShare, writeHalfSelection } from "../src/lib/labs/same-half";
import { blankLabRecord, type LabRecord } from "../src/lib/labs/types";

const complete = (): LabRecord => ({ ...blankLabRecord(), settings: { selection: "0,2,4,6,8,10" }, answers: { prediction: "different", revealed: "yes", observation: "same-half", unequal: "not-half", transfer: "4", transferReason: "equal-groups" } });

describe("Same Half Different Shape model", () => {
  it("has six unique selected cells in every preset, independent of shape", () => {
    expect(readHalfSelection()).toEqual(DEFAULT_HALF_SELECTION);
    for (const pattern of HALF_PATTERNS) {
      expect(new Set(pattern).size).toBe(6);
      expect(isHalf(pattern.length, 12)).toBe(true);
      expect(readHalfSelection(writeHalfSelection(pattern))).toEqual([...pattern].sort((a, b) => a - b));
    }
  });
  it("toggles a cell without changing other cells, and enforces all twelve boundaries", () => {
    let cells: number[] = [];
    for (let cell = 0; cell < 12; cell++) cells = toggleHalfCell(cells, cell);
    expect(cells).toHaveLength(12);
    expect(toggleHalfCell(cells, 12)).toEqual(cells);
    expect(toggleHalfCell(cells, -1)).toEqual(cells);
    expect(toggleHalfCell(cells, 0.5)).toEqual(cells);
    for (let cell = 0; cell < 12; cell++) cells = toggleHalfCell(cells, cell);
    expect(cells).toEqual([]);
  });
  it("rejects malformed or duplicated stored selections instead of turning them into a half", () => {
    for (const value of ["0,0,1,2,3,4", "-1", "12", "1.5", "01,2", "0,,1", "NaN", "__proto__"]) expect(readHalfSelection(value)).toEqual([]);
    expect(readHalfSelection("11,2,0")).toEqual([0, 2, 11]);
    expect(writeHalfSelection([-1, 12, 0, 0, 1.5, 11])).toBe("0,11");
  });
  it("compares selected areas using both fraction and whole size", () => {
    expect(equalSelectedArea({ selected: 3, parts: 6, wholeArea: 12 }, { selected: 2, parts: 4, wholeArea: 12 })).toBe(true);
    expect(equalSelectedArea({ selected: 3, parts: 6, wholeArea: 12 }, { selected: 2, parts: 4, wholeArea: 24 })).toBe(false);
    expect(equalSelectedArea({ selected: 3, parts: 6, wholeArea: 12 }, { selected: 1, parts: 4, wholeArea: 12 })).toBe(false);
    expect(equalSelectedArea({ selected: 3, parts: 0, wholeArea: 12 }, { selected: 2, parts: 4, wholeArea: 12 })).toBe(false);
    expect(isHalf(4, 8)).toBe(true);
    expect(isHalf(0, 0)).toBe(false);
    expect(isHalf(6, 13)).toBe(false);
    expect(isHalf(0.5, 1)).toBe(false);
  });
  it("does not confuse two of four unequal pieces with half the whole", () => {
    expect(unequalSelectedShare([0, 1])).toEqual({ selectedArea: 2, totalArea: 8 });
    expect(unequalSelectedShare([3])).toEqual({ selectedArea: 4, totalArea: 8 });
    expect(unequalSelectedShare([0, 0, 1, -1, 4])).toEqual({ selectedArea: 2, totalArea: 8 });
  });
  it("permits learning from a wrong initial prediction but requires the observed relationship and transfer", () => {
    expect(assessSameHalf(complete()).passed).toBe(true);
    for (const prediction of ["same", "different", "unsure"]) expect(assessSameHalf({ ...complete(), answers: { ...complete().answers, prediction } }).passed).toBe(true);
    for (const key of Object.keys(complete().answers)) {
      const work = complete();
      delete work.answers[key];
      expect(assessSameHalf(work).passed).toBe(false);
    }
    const incorrectAnswers: Record<string, string>[] = [{ transfer: "3" }, { transfer: "4 cells" }, { transfer: "4.1" }, { transferReason: "any-pieces" }, { observation: "different-amount" }, { unequal: "half" }];
    for (const patch of incorrectAnswers) {
      const work = complete();
      expect(assessSameHalf({ ...work, answers: { ...work.answers, ...patch } }).passed).toBe(false);
    }
    expect(assessSameHalf({ ...complete(), settings: { selection: "0,1,2" } }).passed).toBe(false);
  });
});
