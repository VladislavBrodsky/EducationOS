import { HALF_GRID, isHalf, readHalfSelection } from '@/lib/labs/same-half';

export const missionIds = ['paper-robot', 'rolling-lab', 'equal-halves', 'glider-lab', 'risk-lab', 'heart-route', 'ocean-web', 'message-lab', 'business-lab', 'language-lab'] as const;
export type MissionId = (typeof missionIds)[number];
export type MissionInputs = Record<string, string>;
export type MissionCheck = { passed: boolean; field?: string; code: 'design' | 'answer' | 'transfer' | 'success' };

export function integer(value: string | undefined, min = -1000, max = 1000): number | null {
  if (!value || value.length > 8 || !/^-?\d+$/.test(value)) return null;
  const n = Number(value);
  return Number.isSafeInteger(n) && n >= min && n <= max ? n : null;
}

export function robotTrace(repeats: number): { x: number; y: number }[] {
  if (!Number.isInteger(repeats) || repeats < 1 || repeats > 6) return [];
  const points = [{ x: 0, y: 0 }];
  const directions = [[1, 0], [0, 1], [-1, 0], [0, -1]];
  for (let i = 0; i < repeats; i++) {
    const last = points[points.length - 1];
    points.push({ x: last.x + directions[i % 4][0], y: last.y + directions[i % 4][1] });
  }
  return points;
}

/** Deliberately fictional scenarios, never a forecast or a real investment product. */
export function riskScenarios(allocationA: number) {
  if (!Number.isInteger(allocationA) || allocationA < 0 || allocationA > 100 || allocationA % 10 !== 0) return null;
  return { a: allocationA, b: 100 - allocationA, first: 90 + allocationA * 0.3, second: 110 - allocationA * 0.4 };
}

export const gliderTrials = { a: [3, 4, 5], b: [4, 5, 6] } as const;
export function businessBalance(price: number, units = 4) {
  if (!Number.isInteger(price) || price < 1 || price > 6 || !Number.isInteger(units) || units < 1 || units > 4) return null;
  return { revenue: price * units, variable: 3 * units, fixed: 6, balance: price * units - 3 * units - 6 };
}

export function checkMission(id: MissionId, v: MissionInputs): MissionCheck {
  const fail = (field: string, code: MissionCheck['code']): MissionCheck => ({ passed: false, field, code });
  switch (id) {
    case 'paper-robot':
      if (integer(v.repeats, 1, 6) !== 4) return fail('repeats', 'design');
      if (v.direction !== 'west') return fail('direction', 'transfer');
      break;
    case 'rolling-lab':
      if (integer(v.heightA, 1, 3) === null) return fail('heightA', 'design');
      if (integer(v.heightB, 1, 3) !== integer(v.heightA, 1, 3)) return fail('heightB', 'design');
      if (v.conclusion !== 'surface') return fail('conclusion', 'transfer');
      break;
    case 'equal-halves':
      if (!isHalf(readHalfSelection(v.cells ?? '').length, HALF_GRID.cells)) return fail('cells', 'design');
      if (integer(v.halfEight, 0, 8) !== 4) return fail('halfEight', 'transfer');
      break;
    case 'glider-lab':
      if (v.change !== 'wing') return fail('change', 'design');
      if (integer(v.meanA, 0, 10) !== 4) return fail('meanA', 'answer');
      if (integer(v.meanB, 0, 10) !== 5) return fail('meanB', 'answer');
      if (v.conclusion !== 'sample') return fail('conclusion', 'transfer');
      break;
    case 'risk-lab': {
      const s = riskScenarios(integer(v.allocation, 0, 100) ?? -1);
      if (!s || s.first < 100 || s.second < 90) return fail('allocation', 'design');
      if (integer(v.lowest, 0, 200) !== Math.min(s.first, s.second)) return fail('lowest', 'answer');
      if (v.risk !== 'remains') return fail('risk', 'transfer');
      break;
    }
    case 'heart-route':
      for (const [key, answer] of [['first', 'right'], ['second', 'lungs'], ['third', 'left']]) if (v[key] !== answer) return fail(key, 'design');
      if (v.oxygen !== 'lungs') return fail('oxygen', 'transfer');
      break;
    case 'ocean-web':
      for (const [key, answer] of [['first', 'zoo'], ['second', 'small'], ['third', 'large']]) if (v[key] !== answer) return fail(key, 'design');
      if (v.effect !== 'less-food') return fail('effect', 'transfer');
      break;
    case 'message-lab':
      if (v.audience !== 'families') return fail('audience', 'design');
      if (v.headline !== 'clear') return fail('headline', 'design');
      if (integer(v.rate, 0, 100) !== 15) return fail('rate', 'answer');
      if (v.claim !== 'sample') return fail('claim', 'transfer');
      break;
    case 'business-lab': {
      const price = integer(v.price, 1, 6);
      const b = businessBalance(price ?? 0);
      if (!b || price! > 5 || b.balance < 0) return fail('price', 'design');
      if (integer(v.profit, -100, 100) !== b.balance) return fail('profit', 'answer');
      if (v.fewer !== 'loss') return fail('fewer', 'transfer');
      break;
    }
    case 'language-lab':
      for (const [key, answer] of [['question', 'where'], ['instruction', 'left'], ['thanks', 'thank']]) if (v[key] !== answer) return fail(key, 'design');
      if (v.map !== 'left') return fail('map', 'transfer');
      break;
  }
  return { passed: true, code: 'success' };
}
