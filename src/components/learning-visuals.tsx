import Image from 'next/image';
import { Code2 } from 'lucide-react';

/** Editorial imagery is illustrative. All learning controls remain real HTML. */
export function LearningHeroArt() {
  return <div className="learning-hero-art">
    <Image src="/images/physics-vision.webp" alt="Concept artwork of a young learner wearing clear glasses and exploring a floating model of Earth and waves" fill priority sizes="(max-width: 760px) 100vw, 48vw" />
    <div className="learning-hero-caption"><span className="status-dot" /> IDEAS YOU CAN EXPLORE</div>
    <div className="learning-hero-note"><span>01 / NOTICE</span><strong>See a question differently.</strong><span>Ask · try · make · reflect</span></div>
  </div>;
}

export function LearningObjects({ className = '' }: { className?: string }) {
  return <div className={`learning-objects ${className}`} aria-hidden="true"><Image src="/images/learning-objects.webp" alt="" fill sizes="(max-width: 760px) 80vw, 34vw" /></div>;
}

export function LearningPageVisual({ theme }: { theme: 'stages' | 'method' | 'care' }) {
  const content = {
    stages: { eyebrow: 'A PATH TO EXPLORE', title: 'Every stage starts with a question.', detail: 'Five ways to meet a growing mind.' },
    method: { eyebrow: 'NOTICE → TRY → EXPLAIN', title: 'Ideas become clearer when you test them.', detail: 'A guided cycle with room to think again.' },
    care: { eyebrow: 'THOUGHTFUL BY DESIGN', title: 'A place to try, with clear boundaries.', detail: 'An account-free demonstration for families.' },
  }[theme];
  return <div className={`learning-page-visual learning-page-visual-${theme}`}>
    {theme === 'care' ? <LearningObjects /> : <Image src={theme === 'stages' ? '/images/math-vision.webp' : '/images/flight-vision.webp'} alt={theme === 'stages' ? 'Concept artwork of a child exploring colorful three-dimensional geometry' : 'Concept artwork of a child studying a paper glider and airflow'} fill sizes="(max-width: 760px) 100vw, 80vw" />}
    <div className="learning-page-visual-copy"><span>{content.eyebrow}</span><strong>{content.title}</strong><p>{content.detail}</p></div>
  </div>;
}

export function LearningBento() {
  return <section className="section container learning-bento" aria-labelledby="learning-bento-heading">
    <div className="learning-bento-heading"><p className="eyebrow">BUILT FOR THE WAY KIDS LEARN</p><h2 id="learning-bento-heading">See an idea.<br />Make it your own.</h2><p className="muted">Questions become experiments, patterns become programs, and a small project becomes something a learner can explain.</p></div>
    <div className="learning-bento-grid">
      <article className="learning-bento-card learning-bento-feature"><Image src="/images/physics-vision.webp" alt="" fill sizes="(max-width: 760px) 100vw, 45vw" /><div><span className="bento-index">01 / EXPLORE</span><h3>Wonder is a good starting point.</h3><p>Follow a question across science, mathematics, programming, language, and art.</p></div><span className="bento-visual-label">PHYSICS / IMAGINE</span></article>
      <article className="learning-bento-card learning-bento-code"><Code2 aria-hidden="true" /><span className="bento-index">02 / PROGRAM</span><h3>Make a pattern move.</h3><p>Write a tiny loop and see what changes when you edit it.</p><div className="bento-loop" aria-hidden="true"><span>repeat</span><span>→</span><span>notice</span><span>→</span><span>change</span></div></article>
      <article className="learning-bento-card learning-bento-photo"><Image src="/images/math-vision.webp" alt="" fill sizes="(max-width: 760px) 100vw, 30vw" /><div><span className="bento-index">03 / REASON</span><h3>Turn a shape. Test an idea.</h3><p>Use visual models to explain what stays the same.</p></div></article>
      <article className="learning-bento-card learning-bento-photo learning-bento-flight"><Image src="/images/flight-vision.webp" alt="" fill sizes="(max-width: 760px) 100vw, 50vw" /><div><span className="bento-index">04 / BUILD</span><h3>What makes a glider fly?</h3><p>Change one feature, compare two flights, and explain what you notice.</p></div><span className="bento-visual-label">AERODYNAMICS / TRY</span></article>
    </div>
  </section>;
}
