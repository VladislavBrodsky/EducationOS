import Image from 'next/image';
import { ArrowRight, Box, Code2, FlaskConical, Shapes } from 'lucide-react';

/** Editorial imagery is illustrative. All learning controls remain real HTML. */
export function LearningHeroArt() {
  return <div className="learning-hero-art">
    <Image src="/images/curiosity-hero.jpg" alt="A curious child imagining a globe, book, paper plane, and friendly robot" fill priority sizes="(max-width: 760px) 100vw, 48vw" />
    <div className="learning-hero-caption"><span className="status-dot" /> A WORLD OF QUESTIONS</div>
    <div className="learning-hero-note"><span>01 / NOTICE</span><strong>Curiosity begins here.</strong><span>Ask · try · make · reflect</span></div>
  </div>;
}

export function LearningObjects({ className = '' }: { className?: string }) {
  return <div className={`learning-objects ${className}`} aria-hidden="true"><Image src="/images/learning-objects.png" alt="" fill sizes="(max-width: 760px) 80vw, 34vw" /></div>;
}

export function LearningPageVisual({ theme }: { theme: 'stages' | 'method' | 'care' }) {
  const content = {
    stages: { eyebrow: 'A PATH TO EXPLORE', title: 'Every stage starts with a question.', detail: 'Five ways to meet a growing mind.' },
    method: { eyebrow: 'NOTICE → TRY → EXPLAIN', title: 'Ideas become clearer when you test them.', detail: 'A guided cycle with room to think again.' },
    care: { eyebrow: 'THOUGHTFUL BY DESIGN', title: 'A place to try, with clear boundaries.', detail: 'An account-free demonstration for families.' },
  }[theme];
  return <div className={`learning-page-visual learning-page-visual-${theme}`}>
    {theme === 'method' ? <Image src="/images/maker-studio.jpg" alt="A child exploring a small robot and visual models" fill sizes="(max-width: 760px) 100vw, 80vw" /> : <LearningObjects />}
    <div className="learning-page-visual-copy"><span>{content.eyebrow}</span><strong>{content.title}</strong><p>{content.detail}</p></div>
  </div>;
}

export function LearningBento() {
  return <section className="section container learning-bento" aria-labelledby="learning-bento-heading">
    <div className="learning-bento-heading"><p className="eyebrow">BUILT FOR THE WAY KIDS LEARN</p><h2 id="learning-bento-heading">See an idea.<br />Make it your own.</h2><p className="muted">Questions become experiments, patterns become programs, and a small project becomes something a learner can explain.</p></div>
    <div className="learning-bento-grid">
      <article className="learning-bento-card learning-bento-feature"><div><span className="bento-index">01 / EXPLORE</span><h3>Wonder is a good starting point.</h3><p>Follow a question across science, mathematics, programming, language, and art.</p></div><LearningObjects /></article>
      <article className="learning-bento-card learning-bento-code"><Code2 aria-hidden="true" /><span className="bento-index">02 / PROGRAM</span><h3>Make a pattern move.</h3><p>Write a tiny loop and see what changes when you edit it.</p><div className="bento-loop" aria-hidden="true"><span>repeat</span><span>→</span><span>notice</span><span>→</span><span>change</span></div></article>
      <article className="learning-bento-card learning-bento-shapes"><Shapes aria-hidden="true" /><span className="bento-index">03 / REASON</span><h3>Turn a shape. Test an idea.</h3><p>Use visual models to explain what stays the same.</p><div className="bento-shape-stack" aria-hidden="true"><Box /><FlaskConical /><ArrowRight /></div></article>
    </div>
  </section>;
}
