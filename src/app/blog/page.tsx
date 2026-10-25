import type { Metadata } from 'next';
import { JournalIndex } from '@/components/marketing/journal';
import { marketingCopy } from '@/lib/marketing-i18n';
import { SITE_URL } from '@/lib/site';

export const metadata: Metadata = {
  title: marketingCopy.es.blogTitle,
  description: marketingCopy.es.blogDescription,
  alternates: { canonical: '/blog', languages: { es: '/blog', en: '/en/blog', ru: '/ru/blog', 'x-default': '/blog' } },
  openGraph: { locale: 'es_MX', url: `${SITE_URL}/blog`, title: marketingCopy.es.blogTitle, description: marketingCopy.es.blogDescription },
};

export default function BlogPage() { return <JournalIndex locale="es" />; }
