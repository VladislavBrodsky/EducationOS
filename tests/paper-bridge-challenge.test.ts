import { describe, expect, it } from 'vitest';
import { checkPaperBridge } from '../src/lib/paper-bridge-challenge';
import { blankDraft, demoStepIssue, stepEvidence } from '../src/lib/demo-state';

describe('paper challenge criteria', () => {
  it('requires both the requested manipulation and its explanation', () => {
    expect(checkPaperBridge({ folded: false, principle: 'shape' })).toMatchObject({ passed: false, field: 'folded' });
    expect(checkPaperBridge({ folded: true, principle: '' })).toMatchObject({ passed: false, feedback: 'choose' });
    for (const principle of ['material', 'supports', 'unknown']) expect(checkPaperBridge({ folded: true, principle }).passed).toBe(false);
    expect(checkPaperBridge({ folded: true, principle: 'shape' }).passed).toBe(true);
  });
  it('identifies invalid measurements and accepts an unexpected zero result', () => {
    const draft = { ...blankDraft(), baseline: '61', redesigned: '-1', experiment: 'The paper slipped off the support.' };
    expect(demoStepIssue(draft, 4)?.field).toBe('baseline');
    draft.baseline = '12.5';
    expect(demoStepIssue(draft, 4)?.field).toBe('redesigned');
    draft.redesigned = '0';
    expect(demoStepIssue(draft, 4)).toBeNull();
  });
  it('requires the two visible required ideas and normalizes repeated spacing', () => {
    const draft = { ...blankDraft(), ideas: ['Fold the paper', 'Fold  the paper', 'Curve the paper'] as [string, string, string] };
    expect(stepEvidence(draft)[2]).toBe(false);
    expect(demoStepIssue(draft, 2)?.field).toBe('idea-1');
    draft.ideas[1] = 'Curve the paper';
    expect(demoStepIssue(draft, 2)).toBeNull();
  });
});
