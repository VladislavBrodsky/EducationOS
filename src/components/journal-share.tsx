'use client';

import type { Locale } from '@/lib/marketing-i18n';
import { ShareLink } from './share-link';

export function JournalShare({ title, locale }: { title: string; locale: Locale }) {
  return <ShareLink key={`${locale}:${title}`} title={title} locale={locale} />;
}
