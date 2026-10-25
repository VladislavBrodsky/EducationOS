import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/site';
import { locales, localizedPath } from '@/lib/marketing-i18n';
import { marketingJournal } from '@/lib/marketing-journal';

export default function sitemap(): MetadataRoute.Sitemap {
  const localized = locales.flatMap(locale => [
    localizedPath(locale),
    localizedPath(locale, 'blog'),
    ...marketingJournal[locale].map(({ slug }) => localizedPath(locale, `blog/${slug}`)),
  ]);
  const legacy = ['/programs', '/approach', '/trust', '/safety', '/privacy', '/terms', '/accessibility'];
  return [...localized, ...legacy].map(path => ({ url: `${SITE_URL}${path === '/' ? '' : path}`, changeFrequency: 'monthly', priority: path === '/' ? 1 : path.includes('/blog/') ? 0.6 : 0.7 }));
}
