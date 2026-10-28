import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { JournalArticle } from '@/components/marketing/journal';
import { getMarketingArticle, marketingJournal } from '@/lib/marketing-journal';
import { isLocale } from '@/lib/marketing-i18n';
import { SITE_URL } from '@/lib/site';

export function generateStaticParams() { return (['en', 'ru'] as const).flatMap(locale => marketingJournal[locale].map(({ slug }) => ({ locale, slug }))); }

export async function generateMetadata({ params }: PageProps<'/[locale]/blog/[slug]'>): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!isLocale(locale) || locale === 'es') return {};
  const article = getMarketingArticle(locale, slug);
  if (!article) return {};
  return { title: article.title, description: article.description, alternates: { canonical: `/${locale}/blog/${slug}`, languages: { es: `/blog/${slug}`, en: `/en/blog/${slug}`, ru: `/ru/blog/${slug}`, 'x-default': `/blog/${slug}` } }, openGraph: { type: 'article', locale: locale === 'en' ? 'en_US' : 'ru_RU', url: `${SITE_URL}/${locale}/blog/${slug}`, title: article.title, description: article.description, images: [article.image] }, twitter: { card: 'summary_large_image', images: [article.image] } };
}

export default async function LocalizedArticle({ params }: PageProps<'/[locale]/blog/[slug]'>) {
  const { locale, slug } = await params;
  if (!isLocale(locale) || locale === 'es' || !getMarketingArticle(locale, slug)) notFound();
  return <JournalArticle locale={locale} slug={slug} />;
}
