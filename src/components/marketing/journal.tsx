import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, ArrowUpRight, BookOpen, Clock3 } from 'lucide-react';
import { localizedPath, marketingCopy, type Locale } from '@/lib/marketing-i18n';
import { getMarketingArticle, marketingJournal } from '@/lib/marketing-journal';
import { visualWorldCopy } from '@/lib/marketing-worlds';
import { JournalShare } from '@/components/journal-share';
import { MarketingShell } from './marketing-shell';
import { MagicCard } from '@/components/magicui/magic-card';

export function JournalGrid({ locale, limit, headingLevel = 3 }: { locale: Locale; limit?: number; headingLevel?: 2 | 3 }) {
  const copy = marketingCopy[locale];
  const articles = limit ? marketingJournal[locale].slice(0, limit) : marketingJournal[locale];
  const Heading = headingLevel === 2 ? 'h2' : 'h3';
  return <div className="m-journal-grid">{articles.map(article => <MagicCard href={localizedPath(locale, `blog/${article.slug}`)} className="m-story" key={article.slug}>
    <div className="m-story-image"><Image src={article.image} alt={article.imageAlt} fill sizes="(max-width: 720px) 100vw, 33vw" /></div>
    <div className="m-story-body"><div className="m-story-meta"><span>{article.category}</span><span><Clock3 size={13} aria-hidden="true" /> {article.minutes} MIN</span></div><Heading>{article.title}</Heading><p>{article.description}</p><span className="m-story-link">{copy.readStory}<ArrowUpRight size={17} aria-hidden="true" /></span></div>
  </MagicCard>)}</div>;
}

export function JournalIndex({ locale }: { locale: Locale }) {
  const copy = marketingCopy[locale];
  return <MarketingShell locale={locale} section="blog">
    <section className="m-journal-hero container"><div><span className="m-kicker"><BookOpen size={15} aria-hidden="true" /> {copy.blogTitle}</span><h1>{copy.blogLead}</h1><p>{copy.blogDescription}</p><span className="m-concept-note">{visualWorldCopy[locale].concept}</span></div><div className="m-journal-hero-art" aria-hidden="true"><span className="m-journal-ring" /><Image src="/images/hero-ar-journal.webp" alt="" fill priority sizes="(max-width: 720px) 70vw, 36vw" /></div></section>
    <section className="container m-journal-index"><JournalGrid locale={locale} headingLevel={2} /></section>
  </MarketingShell>;
}

export function JournalArticle({ locale, slug }: { locale: Locale; slug: string }) {
  const article = getMarketingArticle(locale, slug);
  if (!article) return null;
  const copy = marketingCopy[locale];
  const next = marketingJournal[locale][(marketingJournal[locale].indexOf(article) + 1) % marketingJournal[locale].length];
  return <MarketingShell locale={locale} section={`blog/${slug}`}><article className="container m-article">
    <Link className="m-back" href={localizedPath(locale, 'blog')}><ArrowLeft size={16} aria-hidden="true" />{copy.backStories}</Link>
    <header><div className="m-article-meta"><span>{article.category}</span><span>{article.minutes} MIN</span></div><h1>{article.title}</h1><p>{article.description}</p></header>
    <div className="m-article-art"><Image src={article.image} alt={article.imageAlt} fill priority sizes="(max-width: 720px) 100vw, 78vw" /></div>
    <div className="m-article-content">{article.sections.map(section => <section key={section.heading}><h2>{section.heading}</h2>{section.paragraphs.map(paragraph => <p key={paragraph}>{paragraph}</p>)}</section>)}
      <aside className="m-article-challenge"><span className="m-kicker">{copy.challenge}</span><h2>{article.challenge.question}</h2><dl><div><dt>{copy.gather}</dt><dd>{article.challenge.material}</dd></div><div><dt>{copy.try}</dt><dd>{article.challenge.action}</dd></div></dl><div className="m-article-actions"><JournalShare title={article.title} locale={locale} /><Link className="m-button m-button-dark" href="/demo/lab">{copy.labAction}<ArrowRight size={17} aria-hidden="true" /></Link></div></aside>
      <div className="m-article-next"><span className="m-kicker">{copy.next}</span><Link href={localizedPath(locale, `blog/${next.slug}`)}>{next.title}<ArrowUpRight size={20} aria-hidden="true" /></Link></div>
    </div>
  </article></MarketingShell>;
}
