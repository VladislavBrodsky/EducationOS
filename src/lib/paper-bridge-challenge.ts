export type PaperBridgeAnswer = { folded: boolean; principle: string };
export type PaperBridgeCheck = { passed: boolean; feedback: 'fold' | 'choose' | 'shape' | 'success'; field?: 'folded' | 'principle' };

/** Checks the stated design constraints, not a fabricated physics simulation. */
export function checkPaperBridge(answer: PaperBridgeAnswer): PaperBridgeCheck {
  if (!answer.folded) return { passed: false, feedback: 'fold', field: 'folded' };
  if (!answer.principle) return { passed: false, feedback: 'choose', field: 'principle' };
  if (answer.principle !== 'shape') return { passed: false, feedback: 'shape', field: 'principle' };
  return { passed: true, feedback: 'success' };
}
