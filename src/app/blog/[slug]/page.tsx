import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { JournalArticle } from '@/components/marketing/journal';
import { getMarketingArticle, marketingJournal } from '@/lib/marketing-journal';
import { SITE_URL } from '@/lib/site';

export function generateStaticParams() { return marketingJournal.es.map(({ slug }) => ({ slug })); }

export async function generateMetadata({ params }: PageProps<'/blog/[slug]'>): Promise<Metadata> {
  const { slug } = await params;
  const article = getMarketingArticle('es', slug);
  if (!article) return {};
  return { title: article.title, description: article.description, alternates: { canonical: `/blog/${slug}`, languages: { es: `/blog/${slug}`, en: `/en/blog/${slug}`, ru: `/ru/blog/${slug}`, 'x-default': `/blog/${slug}` } }, openGraph: { type: 'article', locale: 'es_MX', url: `${SITE_URL}/blog/${slug}`, title: article.title, description: article.description, images: [article.image] }, twitter: { card: 'summary_large_image', images: [article.image] } };
}

export default async function ArticlePage({ params }: PageProps<'/blog/[slug]'>) {
  const { slug } = await params;
  if (!getMarketingArticle('es', slug)) notFound();
  return <JournalArticle locale="es" slug={slug} />;
}
