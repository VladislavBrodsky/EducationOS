import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { SiteShell, DemoCTA } from '@/components/site-shell';
import { programs } from '@/lib/site';
export const metadata: Metadata = { title: 'Programs for every growing stage', alternates: { canonical: '/programs' } };
export default function Programs() {
 return <SiteShell><div className="container"><section className="page-hero"><p className="eyebrow">FIVE STAGES. ONE CURIOUS MIND.</p><h1>Room to wonder.<br />Space to become.</h1><p className="section-lead">From a first “why?” to a carefully tested idea. Explore how the same invention challenge changes with a learner’s stage.</p><div className="notice">These are learning pathways in development. Today, you can try an age-adapted paper bridge mission in our account-free demo. This is not an accredited program or a promise of learning outcomes.</div></section>{programs.map((p,i)=><section className="program-detail" id={p.name.toLowerCase()} key={p.name}><span className="program-age">0{i+1} / AGES {p.ages}</span><div><h2>{p.name}</h2><h3 className="text-xl tracking-tight mb-4">{p.verb}</h3><p>{p.description}</p><Link className="text-link" href="/demo">Explore this stage in the demo <ArrowUpRight size={16} aria-hidden="true" /></Link></div><aside><span className="eyebrow mb-2">A QUESTION TO EXPLORE</span><p>{p.activity}</p></aside></section>)}</div><DemoCTA small /></SiteShell>;
}
