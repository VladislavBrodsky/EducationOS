'use client';

import { useEffect, useRef } from 'react';
import { useMotionPreference } from './use-motion-preference';
import styles from './scroll-progress.module.css';

// Informed by https://magicui.design/docs/components/scroll-progress (MIT).
// This is document position only; it never represents learning or mastery.
export function ScrollProgress({ className = '' }: { className?: string }) {
  const bar = useRef<HTMLDivElement>(null);
  const { ready, canAnimate } = useMotionPreference();

  useEffect(() => {
    if (!ready) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      const range = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
      const progress = range > 0 ? Math.max(0, Math.min(1, window.scrollY / range)) : 0;
      bar.current?.style.setProperty('--reading-progress', String(progress));
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    const resize = 'ResizeObserver' in window ? new ResizeObserver(schedule) : null;
    resize?.observe(document.documentElement);
    return () => {
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      resize?.disconnect();
      if (frame) cancelAnimationFrame(frame);
    };
  }, [ready]);

  return <div ref={bar} className={`${styles.root} ${className}`} aria-hidden="true" data-scroll-progress data-ready={ready} data-motion={canAnimate ? 'running' : 'static'} />;
}
