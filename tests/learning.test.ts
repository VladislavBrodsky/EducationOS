import { describe, expect, it } from 'vitest';
import { advance, exportPortfolio, isComplete, newAttempt, progress, sampleAnswers, stages, updateAnswer, validateStep, type Attempt } from '../src/lib/learning';
describe('synthetic learning progression', () => {
  it('does not advance empty steps or invent evidence', () => {
    const a = newAttempt('builders');
    expect(advance(a)).toBe(a); expect(validateStep(a)).toBeTruthy();
    expect(progress(a)).toBe(0); expect(exportPortfolio([a]).missions).toEqual([]);
  });
  it('requires three distinct ideas, preserving creative alternatives', () => {
    const a = { ...newAttempt('makers'), step: 2, answers: { ...sampleAnswers, idea2: sampleAnswers.idea1.toUpperCase() } };
    expect(validateStep(a)).toMatch(/different/);
    expect(validateStep({ ...a, answers: sampleAnswers })).toBeNull();
  });
  it.each(['', '-1', '1.5', '51', 'Infinity', 'NaN', '1e1'])('rejects invalid experiment count %s', flat => {
    expect(validateStep({ ...newAttempt('makers'), step: 4, answers: { ...sampleAnswers, flat } })).toBeTruthy();
  });
  it('accepts a zero result and never assumes a folded design wins', () => {
    expect(validateStep({ ...newAttempt('makers'), step: 4, answers: { ...sampleAnswers, flat: '8', folded: '0' } })).toBeNull();
  });
  it('supports all five stages through the entire mission', () => {
    for (const stage of stages) {
      let a: Attempt = { ...newAttempt(stage.id), answers: { ...sampleAnswers } };
      for (let i = 0; i < 7; i++) a = advance(a);
      expect(isComplete(a)).toBe(true); expect(progress(a)).toBe(100);
      const result = exportPortfolio([a]);
      expect(result.syntheticDemo).toBe(true); expect(result.missions[0].missionVersion).toBe(1);
      expect(result.missions[0].evidence.folded).toBe('8');
      expect(JSON.stringify(result)).not.toMatch(/masteryScore|birthdate|learnerId/);
    }
  });
  it('invalidates downstream completion when earlier evidence changes', () => {
    const a = { ...newAttempt('builders'), step: 1, completedSteps: [0, 1, 2, 3, 4, 5, 6], answers: { ...sampleAnswers } };
    const changed = updateAnswer(a, 'goal', 'A different synthetic goal');
    expect(changed.completedSteps).toEqual([0]); expect(isComplete(changed)).toBe(false);
    expect(a.answers.goal).toBe(sampleAnswers.goal);
    expect(exportPortfolio([changed]).missions[0].evidence).toEqual({ notice: sampleAnswers.notice });
  });
  it('bounds manual notes', () => { expect(updateAnswer(newAttempt('explorers'), 'notice', 'x'.repeat(2000)).answers.notice.length).toBe(1000); });
});
