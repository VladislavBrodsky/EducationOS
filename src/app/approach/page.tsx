import type { Metadata } from 'next';
import Image from 'next/image';
import { ArrowRight, FlaskConical, Lightbulb, RefreshCcw, ScanSearch, Scale, Sparkles, Waypoints } from 'lucide-react';
import { DemoCTA, SiteShell } from '@/components/site-shell';

export const metadata: Metadata = { title: 'Learning through invention', alternates: { canonical: '/approach' } };

const steps = [
  { title: 'Notice', body: 'Look closely before solving. Describe what happens with the first version of your paper bridge', icon: ScanSearch },
  { title: 'Find a contradiction', body: 'We want a stronger bridge, but we want to use the same sheet of paper. A useful tension gives invention a direction', icon: Scale },
  { title: 'Imagine possibilities', body: 'Sketch or describe different approaches. Change the shape and rearrange the same material to explore', icon: Sparkles },
  { title: 'Form a hypothesis', body: 'Choose one idea and make a prediction you can test. Explain why you think it might work', icon: Lightbulb },
  { title: 'Run a fair experiment', body: 'Compare your first structure with the new version. Keep conditions steady and record what you observe', icon: FlaskConical },
  { title: 'Reflect on the evidence', body: 'Did the result fit your prediction? A surprising result is a reason to think again', icon: RefreshCcw },
  { title: 'Transfer the idea', body: 'Look for another place where the same principle might help. End with a new question', icon: Waypoints },
];

export default function Approach() {
  return <SiteShell>
    <div className="container">
      <section className="page-hero page-hero-scene page-hero-flight">
        <div className="page-hero-scene-art">
          <Image src="/images/flight-cutout.webp" alt="Concept artwork of a child comparing a paper glider with visual airflow" fill priority loading="eager" sizes="(max-width: 760px) 100vw, 55vw" />
        </div>
        <div className="page-hero-scene-copy">
          <p className="eyebrow">OUR LEARNING APPROACH</p>
          <h1>Teach a way of thinking<br />Open a world of ideas</h1>
          <p className="section-lead">A guided cycle of questions, possibilities, and real observations. Inspired by TRIZ inventive problem solving and adapted for hands-on exploration</p>
        </div>
      </section>

      <div className="approach-steps">
        {steps.map(({ title, body, icon: Icon }, index) => <section className={`approach-step approach-step-${index + 1}`} key={title}>
          <div className="approach-step-top">
            <span className="step-number">0{index + 1}</span>
          </div>
          <div><div className="approach-step-heading"><span className="approach-step-icon"><Icon size={25} strokeWidth={1.6} aria-hidden="true" /></span><h2>{title}</h2></div><p>{body}</p></div>
          {index < steps.length - 1 && <ArrowRight className="approach-step-arrow" size={20} aria-hidden="true" />}
        </section>)}
      </div>

      <div className="notice">Evidence over scores. The demo portfolio shows the ideas and observations you actually record. It does not infer intelligence, diagnose learning needs, or claim mastery from a completed activity. Curriculum and age suitability require educator review before a real learner launch.</div>
    </div>
    <DemoCTA small />
  </SiteShell>;
}
