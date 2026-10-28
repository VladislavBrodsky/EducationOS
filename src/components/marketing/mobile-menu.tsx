'use client';

import Link from 'next/link';
import { ArrowUpRight, Menu, X } from 'lucide-react';
import { useDismissDisclosure } from './use-dismiss-disclosure';

export function MobileMenu({ label, navigationLabel, items }: {
  label: string;
  navigationLabel: string;
  items: { href: string; label: string; current?: boolean; primary?: boolean }[];
}) {
  const disclosure = useDismissDisclosure();
  return <details className="m-mobile-menu" ref={disclosure}>
    <summary aria-label={label}>
      <Menu className="m-menu-open-icon" size={21} aria-hidden="true" />
      <X className="m-menu-close-icon" size={21} aria-hidden="true" />
    </summary>
    <nav className="m-mobile-menu-links" aria-label={navigationLabel}>
      {items.map(item => <Link key={item.href} href={item.href} aria-current={item.current ? 'page' : undefined} className={item.primary ? 'm-mobile-menu-cta' : undefined} onClick={() => {
        if (disclosure.current) disclosure.current.open = false;
      }}><span>{item.label}</span><ArrowUpRight size={17} aria-hidden="true" /></Link>)}
    </nav>
  </details>;
}
