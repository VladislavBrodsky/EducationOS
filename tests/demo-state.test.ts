import { describe, expect, it } from 'vitest';
import { blankDemoSession, blankDraft, exportDemoEvidence, parseDemoSession, parseMeasurement, stepEvidence } from '../src/lib/demo-state';
import { AGE_PROGRAMS, DEMO_MISSIONS, getDemoMission } from '../src/content/missions';
import curriculum from '../shared/curriculum/missions.v1.json';

describe('current local synthetic demo', () => {
  it('recovers malformed or oversized browser storage without accepting extra identity fields', () => {
    for (const value of ['invalid json', 'a'.repeat(60001), JSON.stringify({ ...blankDemoSession(), learnerId: 'injected' })]) {
      const result = parseDemoSession(value);
      expect(result.recovered).toBe(true);
      expect(result.session).toEqual(blankDemoSession());
    }
    expect(parseDemoSession(null).recovered).toBe(false);
  });
  it('preserves independent drafts for all five age groups', () => {
    const session = blankDemoSession();
    session.drafts['10-12'].notice = 'An invented observation.';
    const parsed = parseDemoSession(JSON.stringify(session));
    expect(parsed.session.drafts['10-12'].notice).toBe('An invented observation.');
    expect(parsed.session.drafts['5-6'].notice).toBe('');
  });
  it('uses the exact same authored curriculum snapshot as FastAPI and preserves all TRIZ stages', () => {
    expect(DEMO_MISSIONS).toEqual(curriculum);
    expect(AGE_PROGRAMS).toHaveLength(5);
    for (const program of AGE_PROGRAMS) {
      const mission = getDemoMission(program.ageBand);
      expect(mission.content.steps.map(step => step.kind)).toEqual(['notice', 'contradiction', 'imagine', 'hypothesis', 'experiment', 'reflect', 'transfer']);
      expect(mission.content.adultGuidance).toContain('adult');
    }
  });
  it('accepts zero and capped trials without inferring that the redesign improves', () => {
    expect(parseMeasurement('0')).toBe(0);
    expect(parseMeasurement('60')).toBe(60);
    for (const value of ['-1', '61', '1e1', 'Infinity', '0.01']) expect(parseMeasurement(value)).toBeNull();
    const session = blankDemoSession();
    session.drafts['10-12'] = { ...blankDraft(), baseline: '8', redesigned: '0', experiment: 'The redesign collapsed immediately.' };
    expect(stepEvidence(session.drafts['10-12'])[4]).toBe(true);
    const exported = exportDemoEvidence(session, new Date('2026-10-18T00:00:00Z'));
    expect(exported.observations.measurements?.difference).toBe(-8);
    expect(exported.syntheticDemoOnly).toBe(true);
    expect(exported.interpretation).toContain('not a verified assessment');
  });
  it('requires distinct alternatives rather than repeated names', () => {
    expect(stepEvidence({ ...blankDraft(), ideas: ['Fold the paper', 'FOLD THE PAPER', ''] })[2]).toBe(false);
    expect(stepEvidence({ ...blankDraft(), ideas: ['Fold the paper', 'Curve the paper', ''] })[2]).toBe(true);
  });
});
