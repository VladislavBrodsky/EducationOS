'use client';

/**
 * SPDX-License-Identifier: MIT
 * Magic UI's horizontal repeat/transform pattern, adapted for EducationOS.
 * Source inspected 30 October 2026: https://magicui.design/r/marquee.json
 * Copyright (c) Magic UI. See ./LICENSE and ./NOTICE.md.
 */
import { Pause, Play } from 'lucide-react';
import { Children, useEffect, useId, useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { useMarketingMotion } from '@/components/marketing/motion-surface';
import { ProgressiveBlur } from './progressive-blur';
import styles from './marquee.module.css';

export type MarqueeProps = {
  /** Presentational cards only: no controls, links, element IDs, or live regions.
   * Keep actual topic choices or navigation in an adjacent static interface. */
  children: ReactNode;
  label: string;
  className?: string;
  /** Seconds for one complete loop; restrained to 12–360 seconds. */
  duration?: number;
  reverse?: boolean;
  /** Optional controlled pause state; otherwise shares the page motion setting. */
  paused?: boolean;
  onPausedChange?: (paused: boolean) => void;
  showControls?: boolean;
  pauseLabel?: string;
  resumeLabel?: string;
  browseLabel?: string;
};

/** A decorative topic ribbon with one semantic list and one inert visual copy.
 * Server HTML and reduced-motion mode use a static, natively scrollable list.
 * Focus the list to browse it with arrow keys; interactive controls belong outside.
 */
export function Marquee({
  children,
  label,
  className = '',
  duration = 40,
  reverse = false,
  paused,
  onPausedChange,
  showControls = true,
  pauseLabel = 'Pause rolling topics',
  resumeLabel = 'Resume rolling topics',
  browseLabel = 'Use the arrow keys to explore the list',
}: MarqueeProps) {
  const titleId = useId();
  const viewportId = useId();
  const hintId = useId();
  const viewport = useRef<HTMLDivElement>(null);
  const primary = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(true);
  const [pageVisible, setPageVisible] = useState(false);
  const [inView, setInView] = useState(false);
  const [minimumWidth, setMinimumWidth] = useState(0);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [pointerActive, setPointerActive] = useState(false);
  const [browsing, setBrowsing] = useState(false);
  const [localPaused, setLocalPaused] = useState(false);
  const motion = useMarketingMotion();
  const items = Children.toArray(children);
  const userPaused = paused ?? motion?.paused ?? localPaused;
  const staticMode = !ready || reducedMotion || browsing;
  const running = !staticMode && !userPaused && !motion?.paused && !hovered && !focused
    && !pointerActive && pageVisible && inView && items.length > 0;
  const canControl = paused === undefined || onPausedChange !== undefined;

  useEffect(() => {
    const windowElement = viewport.current;
    if (!windowElement) return;
    let alive = true;
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const synchronize = () => {
      setReducedMotion(preference.matches);
      setPageVisible(document.visibilityState === 'visible');
      // Keep the native static list if visibility cannot be observed safely.
      setReady(typeof IntersectionObserver !== 'undefined');
    };
    const measure = () => {
      if (alive) setMinimumWidth(windowElement.clientWidth);
    };
    synchronize();
    measure();
    preference.addEventListener('change', synchronize);
    document.addEventListener('visibilitychange', synchronize);
    window.addEventListener('resize', measure);
    const resize = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(measure) : null;
    resize?.observe(windowElement);
    const intersection = typeof IntersectionObserver !== 'undefined'
      ? new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { threshold: 0.01 })
      : null;
    intersection?.observe(windowElement);
    void document.fonts.ready.then(measure);
    return () => {
      alive = false;
      resize?.disconnect();
      intersection?.disconnect();
      preference.removeEventListener('change', synchronize);
      document.removeEventListener('visibilitychange', synchronize);
      window.removeEventListener('resize', measure);
    };
  }, []);

  // Defensive fallback if a consumer accidentally supplies a focusable card:
  // reveal the original list before positioning focus, never a visual clone.
  useLayoutEffect(() => {
    const active = document.activeElement;
    if (browsing && active instanceof HTMLElement && primary.current?.contains(active)) {
      active.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'instant' });
    }
  }, [browsing]);

  function togglePaused() {
    if (onPausedChange) onPausedChange(!userPaused);
    else if (paused === undefined) {
      if (motion) motion.toggle();
      else setLocalPaused(value => !value);
    }
  }

  const variables = {
    '--marquee-duration': `${Number.isFinite(duration) ? Math.max(12, Math.min(duration, 360)) : 40}s`,
    '--marquee-min-width': `${minimumWidth}px`,
  } as CSSProperties;

  return <div
    className={`${styles.root} ${className}`}
    data-marquee="true"
    data-ready={ready}
    data-static={staticMode}
    data-motion={staticMode ? 'static' : running ? 'running' : 'paused'}
    style={variables}
    onPointerEnter={event => { if (event.pointerType === 'mouse') setHovered(true); }}
    onPointerLeave={() => { setHovered(false); setPointerActive(false); }}
    onPointerDown={() => setPointerActive(true)}
    onPointerUp={() => setPointerActive(false)}
    onPointerCancel={() => setPointerActive(false)}
    onFocusCapture={() => setFocused(true)}
    onBlurCapture={event => {
      if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
        setFocused(false);
        setBrowsing(false);
      }
    }}
  >
    <div className={styles.toolbar}>
      <span id={titleId} className={styles.label}>{label}</span>
      {ready && !reducedMotion && showControls && canControl && <button
        className={styles.pause}
        type="button"
        aria-controls={viewportId}
        aria-pressed={userPaused}
        onClick={togglePaused}
      >{userPaused ? <Play size={15} aria-hidden="true" /> : <Pause size={15} aria-hidden="true" />}
        {userPaused ? resumeLabel : pauseLabel}
      </button>}
    </div>
    <span id={hintId} className={styles.hint}>{browseLabel}</span>
    <div className={styles.window}>
      {/* A focusable native scroll region enables arrow-key browsing without controls. */}
      {/* eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex */}
      <div tabIndex={0}
        id={viewportId}
        ref={viewport}
        className={styles.viewport}
        role="region"
        aria-labelledby={titleId}
        aria-describedby={hintId}
        onFocusCapture={() => setBrowsing(true)}
      >
        <div className={styles.track} data-marquee-track="true" data-reverse={reverse}>
          <div ref={primary} className={styles.set} data-marquee-primary="true" role="list" aria-label={label}>
            {items.map((item, index) => <div className={styles.item} role="listitem" key={index}>{item}</div>)}
          </div>
          <div className={`${styles.set} ${styles.clone}`} data-marquee-clone="true" aria-hidden="true" inert>
            {items.map((item, index) => <div className={styles.item} key={index}>{item}</div>)}
          </div>
        </div>
      </div>
      {!staticMode && <>
        <ProgressiveBlur side="left" className={`${styles.edge} ${styles.left}`} />
        <ProgressiveBlur side="right" className={`${styles.edge} ${styles.right}`} />
      </>}
    </div>
  </div>;
}
