'use client';

// Magic UI's pointer-position spotlight, adapted to CSS without a motion runtime.
// See LICENSE and NOTICE.md in this directory.
import Link from 'next/link';
import { useEffect, useRef, type ComponentProps, type PointerEvent } from 'react';
import { useMarketingMotion } from '@/components/marketing/motion-surface';

export function MagicCard({ className = '', children, ...props }: Omit<ComponentProps<typeof Link>, 'onPointerMove'>) {
  const motion = useMarketingMotion();
  const frame = useRef<number | null>(null);
  const point = useRef({ x: 0, y: 0 });
  useEffect(() => () => { if (frame.current !== null) cancelAnimationFrame(frame.current); }, []);
  function move(event: PointerEvent<HTMLAnchorElement>) {
    if (event.pointerType !== 'mouse' || motion?.paused || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    point.current = { x: event.clientX, y: event.clientY };
    if (frame.current !== null) return;
    const element = event.currentTarget;
    frame.current = requestAnimationFrame(() => {
      const bounds = element.getBoundingClientRect();
      element.style.setProperty('--spot-x', `${point.current.x - bounds.left}px`);
      element.style.setProperty('--spot-y', `${point.current.y - bounds.top}px`);
      frame.current = null;
    });
  }
  return <Link {...props} className={`fx-magic ${className}`} onPointerMove={move}>
    <span className="fx-spotlight" aria-hidden="true" />{children}
  </Link>;
}
