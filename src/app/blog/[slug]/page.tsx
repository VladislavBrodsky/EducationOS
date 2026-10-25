import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { SiteShell } from '@/components/site-shell';
import { JournalShare } from '@/components/journal-share';
import { journalArticles } from '@/lib/journal';
import { SITE_URL } from '@/lib/site';

export function generateStaticParams() { return journalArticles.map(({ slug }) => ({ slug })); }

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const article = journalArticles.find(item => item.slug === slug);
  if (!article) return {};
  return { title: article.title, description: article.description, alternates: { canonical: `/blog/${slug}` }, openGraph: { type: 'article', title: article.title, description: article.description, url: `${SITE_URL}/blog/${slug}`, images: [{ url: '/images/curiosity-hero.webp', width: 1400, height: 933, alt: 'A curious learner imagines a world of discovery' }] }, twitter: { card: 'summary_large_image', title: article.title, description: article.description, images: ['/images/curiosity-hero.webp'] } };
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = journalArticles.find(item => item.slug === slug);
  if (!article) notFound();
  const next = journalArticles[(journalArticles.indexOf(article) + 1) % journalArticles.length];
  return <SiteShell><article className="container journal-article"><Link className="text-link journal-back" href="/blog"><ArrowLeft size={16} aria-hidden="true" /> All stories</Link><header><p className="eyebrow">{article.category} <span className="journal-dot">·</span> {article.readTime}</p><h1>{article.title}</h1><p className="section-lead">{article.description}</p></header><div className="journal-article-image"><Image src={article.image} alt={article.imageAlt} fill priority sizes="(max-width: 760px) 100vw, 82vw" /></div><div className="journal-prose">{article.sections.map(section => <section key={section.heading}><h2>{section.heading}</h2>{section.paragraphs.map(paragraph => <p key={paragraph}>{paragraph}</p>)}</section>)}<aside className="journal-challenge"><span className="eyebrow">{article.challenge.label}</span><h2>{article.challenge.question}</h2><dl><div><dt>Gather</dt><dd>{article.challenge.material}</dd></div><div><dt>Try</dt><dd>{article.challenge.action}</dd></div></dl><div className="journal-challenge-actions"><JournalShare title={article.title} /><Link className="button button-dark" href="/demo/lab">Try a guided mission <ArrowRight size={17} aria-hidden="true" /></Link></div></aside><div className="journal-next"><span className="eyebrow">KEEP EXPLORING</span><Link href={`/blog/${next.slug}`}>{next.title}<ArrowRight size={20} aria-hidden="true" /></Link></div></div></article></SiteShell>;
}
