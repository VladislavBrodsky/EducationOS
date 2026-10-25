import Image from 'next/image';
import Link from 'next/link';
import { ArrowDownRight, ArrowRight, ArrowUpRight, Atom, Check, ChevronRight, Code2, FlaskConical, Layers3, Lightbulb, Shapes, ShieldCheck, Sparkles } from 'lucide-react';
import { localizedPath, marketingCopy, type Locale } from '@/lib/marketing-i18n';
import { JournalGrid } from './journal';
import { MarketingShell } from './marketing-shell';
import { OrbitingCircles } from '@/components/magicui/orbiting-circles';
import { ShineBorder } from '@/components/magicui/shine-border';
import { MagicCard } from '@/components/magicui/magic-card';
import { MotionToggle } from './motion-surface';
import { LearningBento } from './learning-bento';
import { showcaseCopy } from '@/lib/marketing-showcase';

// The four-part introduction links into the corresponding seven-step cycle.
const methodDetailSteps = [1, 3, 5, 6] as const;
const ageArtwork = ['orbit-mascot', 'geometry-mascot', 'math-cutout', 'code-cutout', 'flight-cutout'];

export function LandingPage({ locale }: { locale: Locale }) {
  const copy = marketingCopy[locale];
  return <MarketingShell locale={locale}>
    <section className="m-hero container">
      <div className="m-hero-copy">
        <div className="m-hero-eyebrow"><span className="m-kicker"><span className="m-live-dot" />{copy.eyebrow}</span><span className="m-hero-age">{copy.heroAge}</span></div>
        <h1>{copy.heroLead}<br /><em>{copy.heroAccent}</em></h1>
        <p>{copy.heroDescription}</p>
        <div className="m-hero-actions">
          <div className="m-hero-primary">
            <Link href="/demo/lab" className="m-button m-button-dark fx-shimmer" aria-label={copy.heroAction} aria-describedby="hero-mission-details hero-demo-note"><span><strong>{copy.heroAction}</strong><small id="hero-mission-details">{copy.heroMission}</small></span><ArrowUpRight size={20} aria-hidden="true" /></Link>
            <div className="m-hero-note" id="hero-demo-note"><ShieldCheck size={15} aria-hidden="true" /><span>{copy.heroNote}</span></div>
          </div>
          <Link href="#method" className="m-hero-secondary">{copy.heroSecondary}<ArrowRight size={17} aria-hidden="true" /></Link>
        </div>
      </div>
      <div className="m-hero-stage fx-hero-stage">
        <div className="fx-dot-pattern" aria-hidden="true" /><ShineBorder />
        <span className="m-stage-label"><span className="fx-status-dot" />{copy.visualLabel}</span><MotionToggle locale={locale} />
        <OrbitingCircles radius="clamp(108px, 17vw, 210px)" duration={42}><Atom size={24} /><Code2 size={24} /><FlaskConical size={24} /><Shapes size={24} /></OrbitingCircles>
        <div className="m-stage-object"><Image src="/images/learning-objects.webp" alt="" fill priority sizes="(max-width: 760px) 88vw, 46vw" /></div>
        <div className="m-stage-card"><span>{showcaseCopy[locale].heroTag}</span><strong>{copy.visualCard}</strong><span>{copy.visualStep}<ArrowUpRight size={16} aria-hidden="true" /></span></div>
      </div>
    </section>
    <div className="m-ribbon"><div className="container">{copy.ribbon.map((item, index) => <span key={item}><span className="m-ribbon-number">0{index + 1}</span>{item}</span>)}</div></div>
    <section id="method" className="m-section container m-method"><div className="m-section-heading"><div><span className="m-kicker">{copy.methodKicker}</span><h2>{copy.methodTitle}</h2></div><p>{copy.methodDescription}</p></div><div className="m-method-grid">{copy.methodSteps.map(([number, title, description], index) => <MagicCard className="m-method-card" href={`${localizedPath(locale, 'approach')}#step-${methodDetailSteps[index]}`} key={number}><div className="m-method-card-top"><span>{number} / 04</span>{index === 0 ? <Lightbulb aria-hidden="true" /> : index === 1 ? <Sparkles aria-hidden="true" /> : index === 2 ? <FlaskConical aria-hidden="true" /> : <Layers3 aria-hidden="true" />}</div><div><h3>{title}</h3><p>{description}</p></div><ArrowDownRight className="m-method-arrow" size={18} aria-hidden="true" /></MagicCard>)}</div></section>
    <section id="ages" className="m-ages"><div className="container m-section"><div className="m-section-heading"><div><span className="m-kicker">{copy.programsKicker}</span><h2>{copy.programsTitle}</h2></div><p>{copy.programsDescription}</p></div><div className="m-age-grid">{copy.programs.map(([name, ages, description], index) => <MagicCard className="m-age-card" href={`${localizedPath(locale, 'programs')}#stage-${index + 1}`} key={ages}><span className="m-age-index">0{index + 1} <span>/</span> 05</span><div className="m-age-glyph" aria-hidden="true"><Image src={`/images/${ageArtwork[index]}.webp`} alt="" fill sizes="(max-width: 760px) 42vw, 18vw" /></div><span className="m-age-years">{ages}</span><h3>{name}</h3><p>{description}</p><span className="fx-age-arrow"><ArrowUpRight size={18} aria-hidden="true" /></span></MagicCard>)}</div></div></section>
    <LearningBento locale={locale} />
    <section className="m-journal-preview"><div className="container m-section"><div className="m-section-heading"><div><span className="m-kicker">{copy.journalKicker}</span><h2>{copy.journalTitle}</h2></div><div><p>{copy.journalDescription}</p><Link className="m-inline-link" href={localizedPath(locale, 'blog')}>{copy.journalAction}<ArrowUpRight size={17} aria-hidden="true" /></Link></div></div><JournalGrid locale={locale} limit={3} /></div></section>
    <section id="care" className="container m-care"><div className="m-care-icon"><ShieldCheck size={28} aria-hidden="true" /></div><div><span className="m-kicker">{copy.careKicker}</span><h2>{copy.careTitle}</h2><p>{copy.careDescription}</p></div><Link className="m-inline-link" href={localizedPath(locale, 'trust')}>{copy.careAction}<ChevronRight size={18} aria-hidden="true" /></Link></section>
    <section className="m-closing"><div className="container"><span className="m-closing-icon"><Check size={24} aria-hidden="true" /></span><h2>{copy.closingTitle}</h2><Link className="m-button m-button-dark fx-shimmer" href="/demo/lab">{copy.closingAction}<ArrowRight size={19} aria-hidden="true" /></Link></div></section>
  </MarketingShell>;
}
