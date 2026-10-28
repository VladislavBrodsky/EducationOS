import type { LabCheck, LabRecord } from "./types";

export const HALF_GRID = { columns: 4, rows: 3, cells: 12 } as const;
export const DEFAULT_HALF_SELECTION = [0, 1, 2, 3, 4, 5];
export const HALF_PATTERNS = [
  DEFAULT_HALF_SELECTION,
  [0, 2, 4, 6, 8, 10],
  [0, 3, 5, 6, 8, 11],
  [0, 1, 4, 5, 8, 9],
] as const;

/** Invalid stored selections are empty, rather than silently becoming a correct half. */
export function readHalfSelection(value?: string): number[] {
  if (value === undefined) return [...DEFAULT_HALF_SELECTION];
  if (value === "") return [];
  if (!/^(?:0|[1-9]|1[01])(?:,(?:0|[1-9]|1[01]))*$/.test(value)) return [];
  const cells = value.split(",").map(Number);
  if (new Set(cells).size !== cells.length) return [];
  return cells.sort((a, b) => a - b);
}

export function writeHalfSelection(cells: readonly number[]): string {
  return [...new Set(cells.filter(cell => Number.isInteger(cell) && cell >= 0 && cell < HALF_GRID.cells))]
    .sort((a, b) => a - b).join(",");
}

export function toggleHalfCell(cells: readonly number[], cell: number): number[] {
  if (!Number.isInteger(cell) || cell < 0 || cell >= HALF_GRID.cells) return [...cells];
  const next = cells.includes(cell) ? cells.filter(item => item !== cell) : [...cells, cell];
  return readHalfSelection(writeHalfSelection(next));
}

export function isHalf(selected: number, equalParts: number): boolean {
  return Number.isInteger(selected) && Number.isInteger(equalParts) && equalParts > 0
    && selected >= 0 && selected <= equalParts && selected * 2 === equalParts;
}

/** Fractions of different-sized wholes cannot be used to claim equal selected areas. */
export function equalSelectedArea(
  first: { selected: number; parts: number; wholeArea: number },
  second: { selected: number; parts: number; wholeArea: number },
): boolean {
  const valid = ({ selected, parts, wholeArea }: typeof first) => Number.isInteger(selected)
    && Number.isInteger(parts) && parts > 0 && selected >= 0 && selected <= parts
    && Number.isFinite(wholeArea) && wholeArea > 0;
  return valid(first) && valid(second)
    && first.selected * first.wholeArea * second.parts === second.selected * second.wholeArea * first.parts;
}

/** Two selected small regions occupy 2/8, even though they are two of four pieces. */
export const UNEQUAL_PARTS = [1, 1, 2, 4] as const;
export function unequalSelectedShare(selectedIndices: readonly number[]): { selectedArea: number; totalArea: number } {
  const selected = new Set(selectedIndices.filter(index => Number.isInteger(index) && index >= 0 && index < UNEQUAL_PARTS.length));
  return {
    selectedArea: UNEQUAL_PARTS.reduce<number>((sum, area, index) => sum + (selected.has(index) ? area : 0), 0),
    totalArea: UNEQUAL_PARTS.reduce<number>((sum, area) => sum + area, 0),
  };
}

export function assessSameHalf(record: LabRecord): LabCheck {
  const { answers } = record;
  if (!["same", "different", "unsure"].includes(answers.prediction ?? "") || answers.revealed !== "yes") {
    return { passed: false, field: "prediction", feedback: "Make a prediction, then open the comparison. A prediction can be a guess." };
  }
  if (!isHalf(readHalfSelection(record.settings.selection).length, HALF_GRID.cells)) {
    return { passed: false, field: "selection", feedback: "Make your own half first: select six of the twelve equal cells. The shape can change." };
  }
  if (answers.observation !== "same-half") {
    return { passed: false, field: "observation", feedback: "Compare the same-sized wholes. Three of six and two of four each cover half the whole." };
  }
  if (answers.unequal !== "not-half") {
    return { passed: false, field: "unequal", feedback: "Look at the uneven pieces. The two selected pieces are small; counting pieces only works when the parts are equal." };
  }
  if (!/^\s*4\s*$/.test(answers.transfer ?? "") || answers.transferReason !== "equal-groups") {
    return { passed: false, field: /^\s*4\s*$/.test(answers.transfer ?? "") ? "transferReason" : "transfer", feedback: "Try the new whole: split eight equal cells into two groups with the same number. How many go in each group?" };
  }
  return { passed: true, feedback: "You made a half, compared equal areas, spotted unequal pieces, and found that four of eight equal cells make half. Your practice is recorded." };
}
