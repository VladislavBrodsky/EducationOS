import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { journalArticles } from '@/lib/journal';

export function JournalCards() {
  return <div className="journal-grid">{journalArticles.map(article => <Link className="journal-card" href={`/blog/${article.slug}`} key={article.slug}>
    <div className="journal-card-image"><Image src={article.image} alt={article.imageAlt} fill sizes="(max-width: 760px) 100vw, 33vw" /></div>
    <div className="journal-card-copy"><span className="eyebrow">{article.category} <span className="journal-dot">·</span> {article.readTime}</span><h3>{article.title}</h3><p>{article.description}</p><span className="journal-card-link">Read the story <ArrowUpRight size={16} aria-hidden="true" /></span></div>
  </Link>)}</div>;
}
