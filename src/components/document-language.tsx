'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { pageLocale } from '@/lib/page-locale';
import type { Locale } from '@/lib/marketing-i18n';

export function DocumentLanguage({ portalHost, skipLabels }: { portalHost: boolean; skipLabels: Record<Locale, string> }) {
  const pathname = usePathname();
  const locale = pageLocale(pathname, portalHost);
  useEffect(() => { document.documentElement.lang = locale; }, [locale]);
  return <a href="#main-content" className="skip-link">{skipLabels[locale]}</a>;
}
