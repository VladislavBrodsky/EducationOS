'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const links = [
  { href: '/programs', label: 'Programs' },
  { href: '/approach', label: 'Approach' },
  { href: '/blog', label: 'Journal' },
  { href: '/trust', label: 'Families' },
];

export function SiteNav() {
  const pathname = usePathname();
  return <nav aria-label="Main navigation">{links.map(({ href, label }) => <Link key={href} href={href} aria-current={pathname === href || pathname.startsWith(`${href}/`) ? 'page' : undefined}>{label}</Link>)}</nav>;
}
