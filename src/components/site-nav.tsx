'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const links = [
  { href: '/en/programs', label: 'Programs' },
  { href: '/en/approach', label: 'Approach' },
  { href: '/en/blog', label: 'Journal' },
  { href: '/en/trust', label: 'Families' },
];

export function SiteNav() {
  const pathname = usePathname();
  return <nav aria-label="Main navigation">{links.map(({ href, label }) => <Link key={href} href={href} aria-current={pathname === href || pathname.startsWith(`${href}/`) ? 'page' : undefined}>{label}</Link>)}</nav>;
}
