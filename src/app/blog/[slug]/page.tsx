import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { SiteShell } from '@/components/site-shell';
import { journalArticles } from '@/lib/journal';

export function generateStaticParams() { return journalArticles.map(({ slug }) => ({ slug })); }

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const article = journalArticles.find(item => item.slug === slug);
  if (!article) return {};
  return { title: article.title, description: article.description, alternates: { canonical: `/blog/${slug}` } };
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = journalArticles.find(item => item.slug === slug);
  if (!article) notFound();
  const next = journalArticles[(journalArticles.indexOf(article) + 1) % journalArticles.length];
  return <SiteShell><article className="container journal-article"><Link className="text-link journal-back" href="/blog"><ArrowLeft size={16} aria-hidden="true" /> All stories</Link><header><p className="eyebrow">{article.category} <span className="journal-dot">·</span> {article.readTime}</p><h1>{article.title}</h1><p className="section-lead">{article.description}</p></header><div className="journal-article-image"><Image src={article.image} alt={article.imageAlt} fill priority sizes="(max-width: 760px) 100vw, 82vw" /></div><div className="journal-prose">{article.sections.map(section => <section key={section.heading}><h2>{section.heading}</h2>{section.paragraphs.map(paragraph => <p key={paragraph}>{paragraph}</p>)}</section>)}<div className="journal-next"><span className="eyebrow">KEEP EXPLORING</span><Link href={`/blog/${next.slug}`}>{next.title}<ArrowRight size={20} aria-hidden="true" /></Link></div></div></article></SiteShell>;
}
