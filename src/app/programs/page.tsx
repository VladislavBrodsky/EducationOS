import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { DemoCTA, SiteShell } from '@/components/site-shell';
import { programs } from '@/lib/site';

export const metadata: Metadata = { title: 'Programs for every growing stage', alternates: { canonical: '/programs' } };

const stageVisuals = [
  { src: '/images/orbit-mascot.webp', alt: 'A young learner imagining a world of connected ideas' },
  { src: '/images/geometry-mascot.webp', alt: 'A learner exploring shape, nature, and creative subjects' },
  { src: '/images/math-cutout.webp', alt: 'A learner investigating glowing three-dimensional shapes' },
  { src: '/images/code-cutout.webp', alt: 'A learner creating with visual programming tools' },
  { src: '/images/flight-cutout.webp', alt: 'A learner testing a paper glider with visible airflow' },
];

export default function Programs() {
  return <SiteShell>
    <div className="container">
      <section className="page-hero page-hero-scene page-hero-math">
        <div className="page-hero-scene-art">
          <Image src="/images/math-cutout.webp" alt="Concept artwork of a child exploring three-dimensional shapes through clear glasses" fill priority loading="eager" sizes="(max-width: 760px) 100vw, 55vw" />
        </div>
        <div className="page-hero-scene-copy">
          <p className="eyebrow">FIVE STAGES · ONE CURIOUS MIND</p>
          <h1>Room to wonder<br />Space to become</h1>
          <p className="section-lead">From a first “why?” to a carefully tested idea. Explore how the same invention challenge changes with a learner’s stage</p>
          <div className="notice">These are learning pathways in development. Today, you can try an age-adapted paper bridge mission in our account-free demo. This is not an accredited program or a promise of learning outcomes.</div>
        </div>
      </section>

      <div className="program-detail-grid">
        {programs.map((program, index) => {
          const visual = stageVisuals[index];
          return <section className={`program-detail program-detail-${index + 1}`} id={program.name.toLowerCase()} key={program.name}>
            <div className="program-detail-copy">
              <span className="program-age">0{index + 1} / AGES {program.ages}</span>
              <h2>{program.name}</h2>
              <h3>{program.verb}</h3>
              <p>{program.description}</p>
              <Link className="text-link" href="/demo">Explore this stage in the demo <ArrowUpRight size={16} aria-hidden="true" /></Link>
            </div>
            <aside className="program-question">
              <div className="program-question-art">
                <Image src={visual.src} alt={visual.alt} fill sizes="(max-width: 760px) 100vw, 33vw" />
              </div>
              <div className="program-question-copy">
                <span className="eyebrow">A QUESTION TO EXPLORE</span>
                <p>{program.activity}</p>
              </div>
            </aside>
          </section>;
        })}
      </div>
    </div>
    <DemoCTA small />
  </SiteShell>;
}
