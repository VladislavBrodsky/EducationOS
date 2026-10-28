'use client';

import { useState, type KeyboardEvent } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight, Code2, TrendingUp, HeartPulse, Waves, Plane, Megaphone, BriefcaseBusiness, Languages } from 'lucide-react';
import type { Locale } from '@/lib/marketing-i18n';
import { visualWorldCopy, visualWorlds } from '@/lib/marketing-worlds';
import { AutoScrollRail } from './auto-scroll-rail';

const subjectIcons = { programming: Code2, investing: TrendingUp, anatomy: HeartPulse, ocean: Waves, aviation: Plane, marketing: Megaphone, business: BriefcaseBusiness, languages: Languages };

export function VisualWorlds({ locale }: { locale: Locale }) {
  const [active, setActive] = useState(0);
  const copy = visualWorldCopy[locale];
  const world = visualWorlds[active];
  const subject = copy.subjects[world.id];

  function onSubjectKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    const next = event.key === 'ArrowRight' ? (index + 1) % visualWorlds.length : event.key === 'ArrowLeft' ? (index - 1 + visualWorlds.length) % visualWorlds.length : event.key === 'Home' ? 0 : event.key === 'End' ? visualWorlds.length - 1 : null;
    if (next === null) return;
    event.preventDefault();
    setActive(next);
    event.currentTarget.parentElement?.querySelectorAll<HTMLButtonElement>('button')[next]?.focus();
  }

  return <section className="m-worlds" id="visual-worlds" aria-labelledby="visual-worlds-title">
    <div className="container m-worlds-inner">
      <div className="m-worlds-intro"><span className="m-kicker">{copy.kicker}</span><h2 id="visual-worlds-title">{copy.title}</h2><p>{copy.introduction}</p></div>
      <AutoScrollRail locale={locale} label={copy.choose}>
        <div className="m-worlds-choices" role="group" aria-label={copy.choose}>
          {visualWorlds.map((item, index) => { const Icon = subjectIcons[item.id]; return <button type="button" key={item.id} aria-pressed={active === index} onClick={() => setActive(index)} onKeyDown={event => onSubjectKeyDown(event, index)}><span className="m-worlds-subject-icon"><Icon size={20} strokeWidth={1.7} aria-hidden="true" /></span>{copy.subjects[item.id].label}</button>; })}
        </div>
      </AutoScrollRail>
      <div className="m-worlds-feature">
        <div className="m-worlds-art"><Image key={world.id} src={world.image} alt={subject.alt} fill sizes="(max-width: 760px) 90vw, 46vw" /></div>
        <div className="m-worlds-copy" aria-live="polite"><span className="m-worlds-counter">{String(active + 1).padStart(2, '0')} / {String(visualWorlds.length).padStart(2, '0')}</span><h3>{subject.question}</h3><p>{subject.detail}</p><span className="m-worlds-concept">{copy.concept}</span><Link className="m-inline-link" href="/demo/lab">{copy.demoLink}<ArrowUpRight size={18} aria-hidden="true" /></Link></div>
      </div>
    </div>
  </section>;
}
