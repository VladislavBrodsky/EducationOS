import Image from 'next/image';
import Link from 'next/link';
import { ArrowDown, ArrowUpRight, Eye, FileCheck2, FlaskConical, Lightbulb, LockKeyhole, RefreshCcw, Scale, ScanSearch, ShieldCheck, Sparkles, Users, Waypoints } from 'lucide-react';
import { detailCopy } from '@/lib/marketing-details';
import { type Locale } from '@/lib/marketing-i18n';
import { MarketingShell } from './marketing-shell';

const stageImages = ['/images/orbit-mascot.webp', '/images/geometry-mascot.webp', '/images/math-cutout.webp', '/images/code-cutout.webp', '/images/flight-cutout.webp'];
const methodIcons = [ScanSearch, Scale, Sparkles, Lightbulb, FlaskConical, RefreshCcw, Waypoints];
const trustIcons = [ShieldCheck, Eye, Users, LockKeyhole, FlaskConical, FileCheck2];

function DetailHero({ kicker, title, description, image }: { kicker: string; title: string; description: string; image: string }) {
  return <section className="m-detail-hero container">
    <div className="m-detail-hero-copy"><span className="m-kicker">{kicker}</span><h1>{title}</h1><p>{description}</p></div>
    <div className="m-detail-hero-art page-hero-scene-art"><span className="m-detail-orbit" aria-hidden="true" /><Image src={image} alt="" fill priority sizes="(max-width: 760px) 90vw, 42vw" /></div>
  </section>;
}

function DetailAction({ locale }: { locale: Locale }) {
  const copy = detailCopy[locale].shared;
  return <div className="m-detail-action container"><div><p className="m-kicker">INVENTORS LAB</p><h2>{copy.demo}</h2><p>{copy.demoNote}</p></div><Link className="m-button m-button-dark" href="/demo/lab">{copy.demo}<ArrowUpRight size={18} aria-hidden="true" /></Link></div>;
}

export function ProgramsDetail({ locale }: { locale: Locale }) {
  const copy = detailCopy[locale].programs;
  return <MarketingShell locale={locale} section="programs">
    <DetailHero kicker={copy.kicker} title={copy.title} description={copy.description} image="/images/math-cutout.webp" />
    <div className="container m-detail-intro"><p>{copy.preview}</p><a href="#stages" className="m-inline-link">{copy.stagesLabel}<ArrowDown size={17} aria-hidden="true" /></a></div>
    <div id="stages" className="container m-detail-stages">{copy.stages.map((stage, index) => <section className="m-detail-stage" key={stage.ages} id={`stage-${index + 1}`}>
      <div className="m-detail-stage-copy"><span className="m-kicker">0{index + 1} / 05 · {stage.ages}</span><h2>{stage.name}</h2><h3>{stage.verb}</h3><p>{stage.description}</p><Link className="m-inline-link" href="/demo/lab">{detailCopy[locale].shared.demo}<ArrowUpRight size={17} aria-hidden="true" /></Link></div>
      <div className={`m-detail-stage-art m-detail-stage-art-${index + 1}`}><Image src={stageImages[index]} alt="" fill sizes="(max-width: 760px) 90vw, 35vw" /><div><span className="m-kicker">{copy.activityLabel}</span><p>{stage.activity}</p></div></div>
    </section>)}</div>
    <DetailAction locale={locale} />
  </MarketingShell>;
}

export function ApproachDetail({ locale }: { locale: Locale }) {
  const copy = detailCopy[locale].approach;
  return <MarketingShell locale={locale} section="approach">
    <DetailHero kicker={copy.kicker} title={copy.title} description={copy.description} image="/images/flight-cutout.webp" />
    <div className="container m-detail-steps">{copy.steps.map((step, index) => {
      const Icon = methodIcons[index];
      return <section className="m-detail-step" key={step.title}><div className="m-detail-step-top"><span>0{index + 1} / 07</span><Icon size={26} strokeWidth={1.5} aria-hidden="true" /></div><div><h2>{step.title}</h2><p>{step.body}</p></div></section>;
    })}</div>
    <aside className="container m-detail-notice"><ShieldCheck size={24} aria-hidden="true" /><p>{copy.evidence}</p></aside>
    <DetailAction locale={locale} />
  </MarketingShell>;
}

export function TrustDetail({ locale }: { locale: Locale }) {
  const copy = detailCopy[locale].trust;
  const shared = detailCopy[locale].shared;
  return <MarketingShell locale={locale} section="trust">
    <DetailHero kicker={copy.kicker} title={copy.title} description={copy.description} image="/images/orbit-mascot.webp" />
    <div className="container m-detail-trust-grid">{copy.cards.map((card, index) => {
      const Icon = trustIcons[index];
      return <section className="m-detail-trust-card" key={card.title}><span className="m-detail-trust-icon"><Icon size={27} strokeWidth={1.5} aria-hidden="true" /></span><h2>{card.title}</h2><p>{card.body}</p><Link className="m-inline-link" href={card.href}>{shared.readMore}<ArrowUpRight size={16} aria-hidden="true" /></Link>{locale !== 'en' && <span className="m-detail-english-note">{shared.englishOnly}</span>}</section>;
    })}</div>
    <aside className="container m-detail-notice"><ShieldCheck size={24} aria-hidden="true" /><p>{copy.boundary}</p></aside>
  </MarketingShell>;
}
