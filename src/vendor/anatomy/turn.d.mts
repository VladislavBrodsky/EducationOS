/** Minimal original adapter types for the pinned Anatomy runtime used here. */
export type TurnStats = { ms: number; writes: number; moved: number; forced: number; refined: number; unseparated: number; emitted: number };
export type TurnController = {
  set(values: number | Record<string, number>, options?: { detail?: number }): TurnStats;
  stats(): TurnStats;
  destroy(): void;
};
export const TURN: {
  mount(stage: HTMLElement, data: unknown, options?: { onHold?: () => void; onFrame?: (controller: TurnController) => void }): TurnController;
};
