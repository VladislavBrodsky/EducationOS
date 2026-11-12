/**
 * Google Analytics 4 for the public marketing website only.
 *
 * Rules (see docs/ANALYTICS.md):
 * - Nothing loads until the visitor accepts (Consent Mode v2, basic mode).
 * - Never on the learner portal host, the demo, studio, component workbench or API routes,
 *   where children may be present.
 * - Advertising storage, ad personalization and Google signals stay off.
 */

export const ANALYTICS_CONSENT_KEY = 'educationos.analytics-consent';
export const ANALYTICS_CHOICES_EVENT = 'educationos:analytics-choices';
/** Ask again after this long, whichever answer was given. */
export const CONSENT_MAX_AGE_MS = 365 * 24 * 60 * 60 * 1000;

const EXCLUDED_PREFIXES = ['/demo', '/portal', '/studio', '/components', '/api'] as const;

/** Hosts the GA4 tag needs, as documented by Google for Content-Security-Policy. */
export const GA_CSP = {
  script: ['https://*.googletagmanager.com'],
  img: ['https://*.google-analytics.com', 'https://*.googletagmanager.com'],
  connect: ['https://*.google-analytics.com', 'https://*.analytics.google.com', 'https://*.googletagmanager.com'],
} as const;

const MEASUREMENT_ID = /^G-[A-Z0-9]{4,16}$/;

export function isValidMeasurementId(value: string | undefined | null): value is string {
  return typeof value === 'string' && MEASUREMENT_ID.test(value);
}

/** True when a pathname belongs to the public marketing site and may be measured. */
export function isAnalyticsPath(pathname: string): boolean {
  const path = pathname.toLowerCase();
  return !EXCLUDED_PREFIXES.some(prefix => path === prefix || path.startsWith(`${prefix}/`));
}

export type ConsentChoice = 'granted' | 'denied';
type StoredConsent = { v: 1; choice: ConsentChoice; at: number };

export function parseConsent(raw: string | null, now = Date.now()): ConsentChoice | null {
  if (!raw) return null;
  try {
    const value = JSON.parse(raw) as Partial<StoredConsent>;
    if (value.v !== 1 || (value.choice !== 'granted' && value.choice !== 'denied') || typeof value.at !== 'number') return null;
    if (value.at > now || now - value.at > CONSENT_MAX_AGE_MS) return null;
    return value.choice;
  } catch {
    return null;
  }
}

export function serializeConsent(choice: ConsentChoice, now = Date.now()): string {
  return JSON.stringify({ v: 1, choice, at: now } satisfies StoredConsent);
}

type Gtag = (...args: unknown[]) => void;
declare global {
  interface Window { dataLayer?: unknown[]; gtag?: Gtag }
}

/** Sends a GA4 event when the tag is active; a no-op otherwise (no consent, excluded page, server). */
export function trackEvent(name: string, params: Record<string, string | number | boolean> = {}): void {
  if (typeof window === 'undefined' || typeof window.gtag !== 'function') return;
  if (!isAnalyticsPath(window.location.pathname)) return;
  window.gtag('event', name, params);
}
