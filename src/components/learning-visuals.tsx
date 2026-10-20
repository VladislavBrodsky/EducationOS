import Image from 'next/image';

/** Concept art illustrates possible ways to see ideas; activities remain browser based. */
export function LearningHeroArt() {
  return <div className="learning-hero-art learning-cutout-stage">
    <span className="learning-orbit learning-orbit-one" aria-hidden="true" />
    <span className="learning-orbit learning-orbit-two" aria-hidden="true" />
    <Image src="/images/physics-cutout.webp" alt="Concept artwork of a learner in clear glasses exploring Earth, motion, and waves" fill priority sizes="(max-width: 760px) 100vw, 48vw" />
    <div className="learning-hero-caption"><span className="status-dot" /> IDEAS YOU CAN EXPLORE</div>
    <div className="learning-hero-note"><span>01 / NOTICE</span><strong>See a question differently</strong><span>Ask · try · make · reflect</span></div>
  </div>;
}

export function LearningObjects({ className = '' }: { className?: string }) {
  return <div className={`learning-objects ${className}`} aria-hidden="true"><Image src="/images/learning-objects.webp" alt="" fill sizes="(max-width: 760px) 80vw, 34vw" /></div>;
}

export function LearningPageVisual({ theme }: { theme: 'stages' | 'method' | 'care' }) {
  const content = {
    stages: { eyebrow: 'A PATH TO EXPLORE', title: 'Every stage starts with a question', detail: 'Five ways to meet a growing mind' },
    method: { eyebrow: 'NOTICE → TRY → EXPLAIN', title: 'Ideas become clearer when you test them', detail: 'A guided cycle with room to think again' },
    care: { eyebrow: 'THOUGHTFUL BY DESIGN', title: 'A place to try, with clear boundaries', detail: 'An account-free demonstration for families' },
  }[theme];
  return <div className={`learning-page-visual learning-page-visual-${theme}`}>
    {theme === 'care' ? <LearningObjects /> : <Image src={theme === 'stages' ? '/images/math-cutout.webp' : '/images/flight-cutout.webp'} alt={theme === 'stages' ? 'Concept artwork of a child exploring colorful three-dimensional geometry' : 'Concept artwork of a child studying a paper glider and airflow'} fill sizes="(max-width: 760px) 100vw, 80vw" />}
    <div className="learning-page-visual-copy"><span>{content.eyebrow}</span><strong>{content.title}</strong><p>{content.detail}</p></div>
  </div>;
}

const cards = [
  { number: '01', action: 'EXPLORE', title: 'Wonder is a good starting point', detail: 'Follow a question across science, mathematics, programming, language, and art', image: '/images/orbit-mascot.webp', theme: 'physics', label: 'SCIENCE / IMAGINE' },
  { number: '02', action: 'PROGRAM', title: 'Make a pattern move', detail: 'Write a tiny loop and see what changes when you edit it', image: '/images/code-cutout.webp', theme: 'code', label: 'PROGRAMMING / CREATE' },
  { number: '03', action: 'REASON', title: 'Turn a shape, test an idea', detail: 'Use visual models to explain what stays the same', image: '/images/geometry-mascot.webp', theme: 'math', label: 'MATH / DISCOVER' },
  { number: '04', action: 'BUILD', title: 'What makes a glider fly?', detail: 'Change one feature, compare two flights, and explain what you notice', image: '/images/flight-cutout.webp', theme: 'flight', label: 'AERODYNAMICS / TRY' },
] as const;

export function LearningBento() {
  return <section className="section container learning-bento" aria-labelledby="learning-bento-heading">
    <div className="learning-bento-heading"><p className="eyebrow">BUILT FOR THE WAY KIDS LEARN</p><h2 id="learning-bento-heading">See an idea<br />Make it your own</h2><p className="muted">Questions become experiments, patterns become programs, and a small project becomes something a learner can explain</p></div>
    <div className="learning-bento-grid">
      {cards.map(card => <article className={`learning-bento-card learning-bento-${card.theme}`} key={card.number}>
        <span className="bento-index">{card.number} / {card.action}</span>
        <div className="learning-bento-copy"><h3>{card.title}</h3><p>{card.detail}</p></div>
        <div className="learning-bento-art" aria-hidden="true"><Image src={card.image} alt="" fill sizes="(max-width: 760px) 100vw, 47vw" /></div>
        <span className="bento-visual-label">{card.label}</span>
      </article>)}
    </div>
  </section>;
}
