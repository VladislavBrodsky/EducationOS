import type { Metadata } from 'next';
import Image from 'next/image';
import { DemoCTA, SiteShell } from '@/components/site-shell';
import { JournalCards } from '@/components/journal-cards';

export const metadata: Metadata = { title: 'The Curiosity Journal', description: 'Ideas for exploring physics, mathematics, and making with curious young minds', alternates: { canonical: '/blog' } };

export default function BlogPage() {
  return <SiteShell><div className="container"><section className="page-hero page-hero-scene page-hero-journal"><div className="page-hero-scene-art"><Image src="/images/geometry-mascot.webp" alt="" fill priority sizes="(max-width: 760px) 100vw, 55vw" /></div><div className="page-hero-scene-copy"><p className="eyebrow">THE CURIOSITY JOURNAL</p><h1>Little questions.<br />Big discoveries</h1><p className="section-lead">Stories and simple experiments for families who like to ask “what if?” Our visuals imagine future ways to see an idea; the activities you can try today live in the browser and the world around you</p></div></section><JournalCards /></div><DemoCTA small /></SiteShell>;
}
