import { describe, expect, it } from 'vitest';
import { CONSENT_MAX_AGE_MS, isAnalyticsPath, isValidMeasurementId, parseConsent, serializeConsent } from '@/lib/analytics';

describe('analytics path gating', () => {
  it.each(['/', '/en', '/ru/blog/some-story', '/programs', '/privacy', '/demonstration-notes'])('measures public page %s', path => {
    expect(isAnalyticsPath(path)).toBe(true);
  });
  it.each(['/demo', '/demo/lab', '/DEMO/guardian', '/portal', '/portal/labs/x', '/studio', '/components', '/api/adult-studio/x'])('never measures %s', path => {
    expect(isAnalyticsPath(path)).toBe(false);
  });
});

describe('measurement id', () => {
  it('accepts GA4 ids only', () => {
    expect(isValidMeasurementId('G-P5EBK61FRJ')).toBe(true);
    expect(isValidMeasurementId('UA-12345-1')).toBe(false);
    expect(isValidMeasurementId('G-abc"onerror')).toBe(false);
    expect(isValidMeasurementId(undefined)).toBe(false);
  });
});

describe('stored consent', () => {
  const now = 1_800_000_000_000;
  it('round-trips both choices', () => {
    expect(parseConsent(serializeConsent('granted', now), now)).toBe('granted');
    expect(parseConsent(serializeConsent('denied', now), now)).toBe('denied');
  });
  it('asks again when missing, malformed, from the future or expired', () => {
    expect(parseConsent(null, now)).toBeNull();
    expect(parseConsent('yes', now)).toBeNull();
    expect(parseConsent(JSON.stringify({ v: 1, choice: 'maybe', at: now }), now)).toBeNull();
    expect(parseConsent(serializeConsent('granted', now + 1000), now)).toBeNull();
    expect(parseConsent(serializeConsent('granted', now - CONSENT_MAX_AGE_MS - 1), now)).toBeNull();
  });
});
