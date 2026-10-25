'use client';

// Magic UI's pointer-position spotlight, adapted to CSS without a motion runtime.
// See LICENSE and NOTICE.md in this directory.
import Link from 'next/link';
import type { ComponentProps, PointerEvent } from 'react';

export function MagicCard({ className = '', children, ...props }: Omit<ComponentProps<typeof Link>, 'onPointerMove'>) {
  function move(event: PointerEvent<HTMLAnchorElement>) {
    if (event.pointerType !== 'mouse' || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    event.currentTarget.style.setProperty('--spot-x', `${event.clientX - bounds.left}px`);
    event.currentTarget.style.setProperty('--spot-y', `${event.clientY - bounds.top}px`);
  }
  return <Link {...props} className={`fx-magic ${className}`} onPointerMove={move}>
    <span className="fx-spotlight" aria-hidden="true" />{children}
  </Link>;
}
