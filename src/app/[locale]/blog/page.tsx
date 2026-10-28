import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { JournalIndex } from '@/components/marketing/journal';
import { isLocale, marketingCopy } from '@/lib/marketing-i18n';
import { marketingShareImage } from '@/lib/marketing-social';
import { SITE_URL } from '@/lib/site';

export function generateStaticParams() { return [{ locale: 'en' }, { locale: 'ru' }]; }

export async function generateMetadata({ params }: PageProps<'/[locale]/blog'>): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale) || locale === 'es') return {};
  return { title: marketingCopy[locale].blogTitle, description: marketingCopy[locale].blogDescription, alternates: { canonical: `/${locale}/blog`, languages: { es: '/blog', en: '/en/blog', ru: '/ru/blog', 'x-default': '/blog' } }, openGraph: { locale: locale === 'en' ? 'en_US' : 'ru_RU', url: `${SITE_URL}/${locale}/blog`, title: marketingCopy[locale].blogTitle, description: marketingCopy[locale].blogDescription, images: [marketingShareImage(locale)] } };
}

export default async function LocalizedBlog({ params }: PageProps<'/[locale]/blog'>) {
  const { locale } = await params;
  if (!isLocale(locale) || locale === 'es') notFound();
  return <JournalIndex locale={locale} />;
}
