'use client';

import { Pause, Play } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { createContext, useContext, useEffect, useRef, useState, useSyncExternalStore, type ReactNode } from 'react';
import type { Locale } from '@/lib/marketing-i18n';

const MotionContext = createContext<{ paused: boolean; ready: boolean; toggle: () => void } | null>(null);
const subscribeHydration = () => () => {};
const hydratedSnapshot = () => true;
const serverSnapshot = () => false;
const labels = {
  es: { pause: 'Pausar animaciones', resume: 'Reanudar animaciones' },
  en: { pause: 'Pause animations', resume: 'Resume animations' },
  ru: { pause: 'Приостановить анимацию', resume: 'Возобновить анимацию' },
};

export function useMarketingMotion() {
  return useContext(MotionContext);
}

export function MotionToggle({ locale, className = '', labels: customLabels }: { locale: Locale; className?: string; labels?: { pause: string; resume: string } }) {
  const context = useContext(MotionContext);
  if (!context?.ready) return null;
  const label = (customLabels ?? labels[locale])[context.paused ? 'resume' : 'pause'];
  return <button className={`fx-motion-toggle ${className}`} type="button" aria-label={label} title={label} aria-pressed={context.paused} onClick={context.toggle}>
    {context.paused ? <Play size={16} aria-hidden="true" /> : <Pause size={16} aria-hidden="true" />}
  </button>;
}

export function MotionSurface({ children }: { children: ReactNode }) {
  const [paused, setPaused] = useState(false);
  const ready = useSyncExternalStore(subscribeHydration, hydratedSnapshot, serverSnapshot);
  const root = useRef<HTMLElement>(null);
  const revealed = useRef(new WeakSet<Element>());
  const pathname = usePathname();
  useEffect(() => {
    const surface = root.current;
    if (!surface || paused || !ready || !('IntersectionObserver' in window)) return;
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (preference.matches) return;
    const animations: Animation[] = [];
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        revealed.current.add(entry.target);
        if (!preference.matches) animations.push(entry.target.animate([
          { transform: 'translateY(14px)' }, { transform: 'translateY(0)' },
        ], { duration: 550, easing: 'cubic-bezier(.22,1,.36,1)' }));
        observer.unobserve(entry.target);
      }
    }, { threshold: .08 });
    // Content is visible in server HTML; enhancement never gates reading or focus.
    surface.querySelectorAll('.m-section-heading,.m-method-card,.m-age-card,.m-story,.m-detail-stage,.m-detail-step,.m-detail-trust-card,.fx-bento').forEach(element => {
      if (!revealed.current.has(element)) observer.observe(element);
    });
    const stop = () => { if (preference.matches) animations.forEach(animation => animation.finish()); };
    preference.addEventListener('change', stop);
    return () => { observer.disconnect(); preference.removeEventListener('change', stop); animations.forEach(animation => animation.cancel()); };
  }, [pathname, paused, ready]);
  return <MotionContext.Provider value={{ paused: paused || !ready, ready, toggle: () => setPaused(value => !value) }}>
    <main ref={root} id="main-content" className="m-main" data-motion={!ready || paused ? 'paused' : 'running'}>{children}</main>
  </MotionContext.Provider>;
}
