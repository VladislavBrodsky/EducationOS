'use client';

import { useEffect, useState, useSyncExternalStore, type RefObject } from 'react';
import { useMarketingMotion } from '@/components/marketing/motion-surface';

function subscribePreference(onChange: () => void) {
  const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
  preference.addEventListener('change', onChange);
  document.addEventListener('visibilitychange', onChange);
  return () => {
    preference.removeEventListener('change', onChange);
    document.removeEventListener('visibilitychange', onChange);
  };
}

function preferenceSnapshot(): 'animate' | 'static' {
  return document.visibilityState === 'visible'
    && !window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'animate' : 'static';
}
function serverSnapshot() { return 'server' as const; }

/** Static on the server; suspend work when readers, the page, or the device ask for quiet. */
export function useMotionPreference(targetRef?: RefObject<Element | null>) {
  const motion = useMarketingMotion();
  const preference = useSyncExternalStore(subscribePreference, preferenceSnapshot, serverSnapshot);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const target = targetRef?.current;
    if (!target || !('IntersectionObserver' in window)) return;
    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry?.isIntersecting ?? false), { threshold: .1 },
    );
    observer.observe(target);
    return () => observer.disconnect();
  }, [targetRef]);

  return {
    ready: preference !== 'server',
    canAnimate: preference === 'animate' && (!targetRef || inView) && !motion?.paused,
  };
}
