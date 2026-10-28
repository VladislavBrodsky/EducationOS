import { runPracticeCode } from "../learning-runner";
import type { LabCheck, LabRecord } from "./types";

export const LOOP_LOOM_MAX_REPEATS = 6;
export const LOOP_LOOM_INTERVAL_MS = 700;
export const LOOP_LOOM_INSTRUCTIONS = ["Clap", "Tap"] as const;

/** Accept only a stored whole-number setting. Empty or malformed values use 3. */
export function loopLoomRepeats(value?: string): number {
  return value !== undefined && /^[0-6]$/.test(value) ? Number(value) : 3;
}

export function loopLoomSource(repeats: number): string {
  const n = limitRepeats(repeats);
  return `repeat ${n}:\n  print("Clap")\n  print("Tap")`;
}

function limitRepeats(repeats: number): number {
  return Number.isFinite(repeats) ? Math.max(0, Math.min(LOOP_LOOM_MAX_REPEATS, Math.floor(repeats))) : 3;
}

export type LoopLoomSnapshot = {
  repeats: number;
  steps: number;
  totalLines: number;
  output: string[];
  completedBlocks: number;
  finished: boolean;
  nextInstruction: "Clap" | "Tap" | null;
};

/** Output is validated by the portal interpreter; cursor state only selects its prefix. */
export function loopLoomSnapshot(repeats: number, steps = 0): LoopLoomSnapshot {
  const n = limitRepeats(repeats);
  const totalLines = n * LOOP_LOOM_INSTRUCTIONS.length;
  const s = Number.isFinite(steps) ? Math.max(0, Math.min(totalLines, Math.floor(steps))) : 0;
  const result = runPracticeCode(loopLoomSource(n));
  if (!result.ok || result.output.length !== totalLines) throw new Error("Loop Loom practice code did not match its model.");
  return {
    repeats: n,
    steps: s,
    totalLines,
    output: result.output.slice(0, s),
    completedBlocks: Math.floor(s / LOOP_LOOM_INSTRUCTIONS.length),
    finished: s === totalLines,
    nextInstruction: s < totalLines ? LOOP_LOOM_INSTRUCTIONS[s % LOOP_LOOM_INSTRUCTIONS.length] : null,
  };
}

export function stepLoopLoom(state: LoopLoomSnapshot): LoopLoomSnapshot {
  return loopLoomSnapshot(state.repeats, state.steps + 1);
}

function wholeAnswer(value: string | undefined, max: number): number | null {
  if (value === undefined || !/^\d{1,2}$/.test(value.trim())) return null;
  const answer = Number(value.trim());
  return answer <= max ? answer : null;
}

/** This checks independent answers, never whether the child played the animation. */
export function assessLoopLoom(record: LabRecord): LabCheck {
  const repeats = loopLoomRepeats(record.settings.repeats);
  if (record.settings.repeats !== undefined && !/^[0-6]$/.test(record.settings.repeats)) {
    return { passed: false, field: "repeats", feedback: "Choose a whole number of repeats from 0 to 6." };
  }
  if (record.answers.predictionSubmitted !== "yes" || wholeAnswer(record.answers.prediction, 12) === null) {
    return { passed: false, field: "prediction", feedback: "Make and submit a prediction first. Your first idea can change after you investigate." };
  }
  if (wholeAnswer(record.answers.observation, 12) !== repeats * 2) {
    return { passed: false, field: "observation", feedback: repeats === 0 ? "Zero repeats runs neither instruction. How many lines can print?" : "There are two instructions in each block. Count the blocks, then multiply by two." };
  }
  if (wholeAnswer(record.answers.transfer, 24) !== 12) {
    return { passed: false, field: "transfer", feedback: "For the new case, count Clap, Tap, and Snap in one block. Then count four equal blocks." };
  }
  if (record.answers.transferFirst !== "Clap, Tap, Snap") {
    return { passed: false, field: "transferFirst", feedback: "Check the order inside the new block. Each whole block runs before the next one starts." };
  }
  return { passed: true, feedback: "You connected repeats to groups of instructions, and worked out a new three-instruction block. Your original prediction did not have to be right." };
}
