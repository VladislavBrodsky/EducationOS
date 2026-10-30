'use client';

import { useEffect, useRef, useState } from 'react';
import { useMotionPreference } from './use-motion-preference';
import styles from './word-rotate.module.css';

// Adapted from the Word Rotate concept: https://magicui.design/docs/components/word-rotate.
// MIT source license is retained in this directory; timers replace the Motion dependency.
export function WordRotate({ words, label, interval = 2500, className = '' }: {
  words: readonly string[];
  label?: string;
  interval?: number;
  className?: string;
}) {
  const root = useRef<HTMLSpanElement>(null);
  const { canAnimate } = useMotionPreference(root);
  const [index, setIndex] = useState(0);
  const items = words.filter(word => word.trim().length > 0);
  const count = items.length;
  const active = count ? index % count : 0;
  const accessibleLabel = label ?? items.join(', ');
  const delay = Number.isFinite(interval) ? Math.max(1200, interval) : 2500;

  useEffect(() => {
    if (!canAnimate || count < 2) return;
    const timer = window.setInterval(() => setIndex(value => (value + 1) % count), delay);
    return () => window.clearInterval(timer);
  }, [canAnimate, count, delay]);

  if (!count) return null;
  return <span ref={root} className={`${styles.root} ${className}`} data-word-rotate data-word-index={active} data-motion={canAnimate ? 'running' : 'static'}>
    <span className={styles.accessible}>{accessibleLabel}</span>
    <span className={styles.visual} aria-hidden="true">
      {items.map((word, itemIndex) => <span key={`${itemIndex}:${word}`} className={styles.word} data-active={itemIndex === active}>{word}</span>)}
    </span>
  </span>;
}
