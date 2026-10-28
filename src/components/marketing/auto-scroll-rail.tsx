'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { ProgressiveBlur } from '@/components/magicui/progressive-blur';
import type { Locale } from '@/lib/marketing-i18n';
import { MotionToggle, useMarketingMotion } from './motion-surface';

const labels = {
  es: { previous: 'Ver temas anteriores', next: 'Ver más temas', pause: 'Pausar desplazamiento automático', resume: 'Reanudar desplazamiento automático' },
  en: { previous: 'See previous subjects', next: 'See more subjects', pause: 'Pause automatic scrolling', resume: 'Resume automatic scrolling' },
  ru: { previous: 'Предыдущие темы', next: 'Другие темы', pause: 'Остановить автопрокрутку', resume: 'Продолжить автопрокрутку' },
};

export function AutoScrollRail({ children, locale, label, className = '' }: { children: ReactNode; locale: Locale; label: string; className?: string }) {
  const viewport = useRef<HTMLDivElement>(null);
  const direction = useRef(1);
  const cooldown = useRef(0);
  const [edges, setEdges] = useState({ left: false, right: false });
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [touching, setTouching] = useState(false);
  const [visible, setVisible] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(true);
  const motion = useMarketingMotion();
  const overflowing = edges.left || edges.right;

  function updateEdges() {
    const rail = viewport.current;
    if (!rail) return;
    const next = { left: rail.scrollLeft > 1, right: rail.scrollLeft < rail.scrollWidth - rail.clientWidth - 1 };
    setEdges(previous => previous.left === next.left && previous.right === next.right ? previous : next);
  }

  useEffect(() => {
    const rail = viewport.current;
    if (!rail) return;
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const syncPreference = () => setReducedMotion(preference.matches);
    syncPreference();
    preference.addEventListener('change', syncPreference);
    const resize = new ResizeObserver(updateEdges);
    resize.observe(rail);
    if (rail.firstElementChild) resize.observe(rail.firstElementChild);
    const intersection = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { threshold: .5 });
    intersection.observe(rail);
    document.fonts.ready.then(updateEdges);
    return () => { resize.disconnect(); intersection.disconnect(); preference.removeEventListener('change', syncPreference); };
  }, []);

  useEffect(() => {
    const rail = viewport.current;
    if (!rail || !overflowing || !visible || reducedMotion || motion?.paused || hovered || focused || touching) return;
    let frame = 0;
    let previous = 0;
    let position = rail.scrollLeft;
    const start = performance.now() + 1400;
    const advance = (now: number) => {
      if (document.visibilityState === 'visible' && now > start && now > cooldown.current && previous) {
        const max = rail.scrollWidth - rail.clientWidth;
        const delta = Math.min(now - previous, 40) * .026 * direction.current;
        position = Math.min(max, Math.max(0, position + delta));
        rail.scrollLeft = position;
        if (rail.scrollLeft >= max - 1) direction.current = -1;
        else if (rail.scrollLeft <= 1) direction.current = 1;
      } else position = rail.scrollLeft;
      previous = now;
      frame = requestAnimationFrame(advance);
    };
    frame = requestAnimationFrame(advance);
    return () => cancelAnimationFrame(frame);
  }, [overflowing, visible, reducedMotion, motion?.paused, hovered, focused, touching]);

  function move(amount: number) {
    const rail = viewport.current;
    if (!rail) return;
    cooldown.current = performance.now() + 5000;
    rail.scrollBy({ left: amount * rail.clientWidth * .65, behavior: reducedMotion ? 'instant' : 'smooth' });
  }

  return <div className={`m-scroll-rail ${className}`} data-overflow={overflowing} data-auto-scroll={!reducedMotion && !motion?.paused && !hovered && !focused && !touching && visible && overflowing ? 'running' : 'paused'}>
    <div className="m-scroll-rail-toolbar"><span>{label}</span>{overflowing && <div className="m-scroll-rail-controls">
      <button type="button" aria-label={labels[locale].previous} disabled={!edges.left} onClick={() => move(-1)}><ChevronLeft size={17} aria-hidden="true" /></button>
      <MotionToggle locale={locale} className="m-scroll-rail-pause" labels={labels[locale]} />
      <button type="button" aria-label={labels[locale].next} disabled={!edges.right} onClick={() => move(1)}><ChevronRight size={17} aria-hidden="true" /></button>
    </div>}</div>
    <div className="m-scroll-rail-window">
      <div ref={viewport} className="m-scroll-rail-viewport" onScroll={updateEdges} onPointerEnter={event => { if (event.pointerType === 'mouse') setHovered(true); }} onPointerLeave={() => { setHovered(false); setTouching(false); }} onPointerDown={() => { setTouching(true); cooldown.current = performance.now() + 5000; }} onPointerUp={() => setTouching(false)} onPointerCancel={() => setTouching(false)} onWheel={() => { cooldown.current = performance.now() + 5000; }} onFocusCapture={event => {
        setFocused(true);
        const rail = viewport.current;
        if (!rail || !(event.target instanceof HTMLElement)) return;
        const item = event.target.getBoundingClientRect();
        const bounds = rail.getBoundingClientRect();
        if (item.left < bounds.left + 44 || item.right > bounds.right - 44) rail.scrollTo({ left: rail.scrollLeft + item.left - bounds.left - (rail.clientWidth - item.width) / 2, behavior: 'instant' });
      }} onBlurCapture={event => { if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setFocused(false); }}>
        {children}
      </div>
      {edges.left && <ProgressiveBlur side="left" className="m-scroll-rail-blur m-scroll-rail-blur-left" />}
      {edges.right && <ProgressiveBlur side="right" className="m-scroll-rail-blur m-scroll-rail-blur-right" />}
    </div>
  </div>;
}
