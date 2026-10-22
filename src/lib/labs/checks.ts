import { assessLoopLoom } from "./loop-loom";
import { assessSameHalf } from "./same-half";
import { assessHiddenCubes } from "./hidden-cubes";
import type { LabCheck, LabId, LabRecord } from "./types";

export function checkLab(id: LabId, record: LabRecord): LabCheck {
  switch (id) {
    case "loop-loom": return assessLoopLoom(record);
    case "same-half": return assessSameHalf(record);
    case "hidden-cubes": return assessHiddenCubes(record);
  }
}
