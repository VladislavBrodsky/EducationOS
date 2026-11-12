'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react';
import type { Locale } from '@/lib/marketing-i18n';
import {
  ANALYTICS_CHOICES_EVENT, ANALYTICS_CONSENT_KEY, isAnalyticsPath, parseConsent, serializeConsent, trackEvent,
  type ConsentChoice,
} from '@/lib/analytics';

const copy: Record<Locale, { title: string; body: string; accept: string; decline: string; more: string }> = {
  en: {
    title: 'Help us improve this site?',
    body: 'With your permission we use Google Analytics to count visits to our public pages. No advertising, no tracking in the demo or the learner app, and you can change your mind any time.',
    accept: 'Allow analytics', decline: 'No thanks', more: 'Privacy notice',
  },
  es: {
    title: '¿Nos ayudas a mejorar este sitio?',
    body: 'Con tu permiso usamos Google Analytics para contar las visitas a nuestras páginas públicas. Sin publicidad, sin medición en la demo ni en la app de aprendizaje, y puedes cambiar de opinión cuando quieras.',
    accept: 'Permitir analítica', decline: 'No, gracias', more: 'Aviso de privacidad',
  },
  ru: {
    title: 'Поможете нам улучшить сайт?',
    body: 'С вашего разрешения мы используем Google Analytics, чтобы считать посещения публичных страниц. Без рекламы, без отслеживания в демо и в приложении для учеников. Решение можно изменить в любой момент.',
    accept: 'Разрешить аналитику', decline: 'Нет, спасибо', more: 'Политика конфиденциальности',
  },
};

const CONSENT_CHANGED_EVENT = 'educationos:analytics-consent-changed';
const SERVER_SNAPSHOT = '\u0000server';

function readStoredRaw(): string {
  try { return window.localStorage.getItem(ANALYTICS_CONSENT_KEY) ?? ''; } catch { return ''; }
}
function subscribeToConsent(onChange: () => void) {
  window.addEventListener('storage', onChange);
  window.addEventListener(CONSENT_CHANGED_EVENT, onChange);
  return () => { window.removeEventListener('storage', onChange); window.removeEventListener(CONSENT_CHANGED_EVENT, onChange); };
}
function storeChoice(choice: ConsentChoice) {
  try { window.localStorage.setItem(ANALYTICS_CONSENT_KEY, serializeConsent(choice)); } catch { /* private mode: choice lasts for this page */ }
  window.dispatchEvent(new Event(CONSENT_CHANGED_EVENT));
}
function clearGaCookies() {
  const host = window.location.hostname;
  const domains = ['', host, `.${host}`, `.${host.split('.').slice(-2).join('.')}`];
  for (const cookie of document.cookie.split(';')) {
    const name = cookie.split('=')[0]?.trim();
    if (!name || !(name === '_ga' || name.startsWith('_ga_'))) continue;
    for (const domain of domains) document.cookie = `${name}=; Max-Age=0; path=/${domain ? `; domain=${domain}` : ''}`;
  }
}

function loadGoogleTag(measurementId: string) {
  if (window.gtag) return;
  window.dataLayer = window.dataLayer ?? [];
  // gtag.js reads the `arguments` object itself, so the stub must push it unchanged.
  // eslint-disable-next-line prefer-rest-params
  window.gtag = function gtag() { window.dataLayer!.push(arguments); };
  window.gtag('consent', 'default', {
    analytics_storage: 'granted',
    ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied',
    functionality_storage: 'denied', personalization_storage: 'denied', security_storage: 'granted',
  });
  window.gtag('set', 'ads_data_redaction', true);
  window.gtag('js', new Date());
  window.gtag('config', measurementId, {
    send_page_view: false, // page views are sent below so excluded routes are never measured
    allow_google_signals: false,
    allow_ad_personalization_signals: false,
    cookie_flags: 'SameSite=Lax;Secure',
  });
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`;
  document.head.appendChild(script);
}

export function Analytics({ measurementId, locale }: { measurementId: string; locale: Locale }) {
  const pathname = usePathname() ?? '/';
  const storedRaw = useSyncExternalStore(subscribeToConsent, readStoredRaw, () => SERVER_SNAPSHOT);
  const [sessionChoice, setSessionChoice] = useState<ConsentChoice | null>(null); // covers browsers that block storage
  const [reopened, setReopened] = useState(false);
  const lastPage = useRef<string | null>(null);
  const disableKey = `ga-disable-${measurementId}`;
  const measurable = isAnalyticsPath(pathname);
  // undefined while server rendering / hydrating, so the banner never flashes for returning visitors
  const choice: ConsentChoice | null | undefined = storedRaw === SERVER_SNAPSHOT ? undefined : sessionChoice ?? parseConsent(storedRaw || null);
  const open = reopened || choice === null;

  useEffect(() => {
    const reopen = () => setReopened(true);
    window.addEventListener(ANALYTICS_CHOICES_EVENT, reopen);
    return () => window.removeEventListener(ANALYTICS_CHOICES_EVENT, reopen);
  }, []);

  // Load the tag after consent and send one page view per measurable route.
  useEffect(() => {
    const flags = window as unknown as Record<string, boolean>;
    flags[disableKey] = !(choice === 'granted' && measurable);
    if (choice !== 'granted' || !measurable) return;
    loadGoogleTag(measurementId);
    const frame = window.requestAnimationFrame(() => {
      const location = window.location.href;
      if (lastPage.current === location) return;
      lastPage.current = location;
      window.gtag?.('event', 'page_view', { page_location: location, page_title: document.title });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [choice, measurable, pathname, measurementId, disableKey]);

  // Key event: a visitor heads into the demo from a marketing page.
  useEffect(() => {
    if (choice !== 'granted') return;
    const onClick = (event: MouseEvent) => {
      const anchor = (event.target as Element | null)?.closest?.('a[href]');
      if (!(anchor instanceof HTMLAnchorElement)) return;
      const target = new URL(anchor.href, window.location.href);
      if (target.origin !== window.location.origin || !(target.pathname === '/demo' || target.pathname.startsWith('/demo/'))) return;
      const area = anchor.closest('header') ? 'header' : anchor.closest('footer') ? 'footer' : anchor.closest('section[id]')?.id ?? 'page';
      trackEvent('demo_start', { link_url: target.pathname, link_text: (anchor.textContent ?? '').trim().slice(0, 100), cta_location: area });
    };
    document.addEventListener('click', onClick, { capture: true });
    return () => document.removeEventListener('click', onClick, { capture: true });
  }, [choice]);

  const decide = useCallback((next: ConsentChoice) => {
    setSessionChoice(next);
    setReopened(false);
    storeChoice(next);
    if (next === 'denied') {
      (window as unknown as Record<string, boolean>)[disableKey] = true;
      window.gtag?.('consent', 'update', { analytics_storage: 'denied' });
      clearGaCookies();
    } else {
      window.gtag?.('consent', 'update', { analytics_storage: 'granted' });
    }
  }, [disableKey]);

  if (!open || choice === undefined || !measurable) return null;
  const text = copy[locale];
  return (
    <section className="consent-banner" aria-labelledby="consent-title">
      <div>
        <h2 id="consent-title">{text.title}</h2>
        <p>{text.body} <Link href="/privacy">{text.more}</Link></p>
      </div>
      <div className="consent-actions">
        <button type="button" className="button button-light" onClick={() => decide('denied')}>{text.decline}</button>
        <button type="button" className="button button-dark" onClick={() => decide('granted')}>{text.accept}</button>
      </div>
    </section>
  );
}

export function AnalyticsChoicesButton({ label }: { label: string }) {
  return <button type="button" className="text-link" onClick={() => window.dispatchEvent(new Event(ANALYTICS_CHOICES_EVENT))}>{label}</button>;
}
