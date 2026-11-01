'use client';

// Magic UI Border Beam concept (MIT); native CSS replaces its optional Motion dependency.
// https://magicui.design/docs/components/border-beam — see LICENSE and NOTICE.md.
import { useRef } from 'react';
import { useMotionPreference } from './use-motion-preference';
import styles from './border-beam.module.css';

/** One finite accent per visible entry, with no reading or interaction dependency. */
export function BorderBeam() {
  const root = useRef<HTMLSpanElement>(null);
  const { canAnimate } = useMotionPreference(root);
  return <span ref={root} className={styles.frame} aria-hidden="true" data-border-beam data-motion={canAnimate ? 'running' : 'static'}><span className={styles.beam} /></span>;
}
