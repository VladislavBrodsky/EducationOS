import Image from 'next/image';
import Link from 'next/link';
import type { Metadata } from 'next';
import { ArrowLeft, ArrowUpRight, MousePointer2 } from 'lucide-react';
import { missions, missionUi, translate, type Mission } from '@/lib/missions/catalog';
import { localizedPath, type Locale } from '@/lib/marketing-i18n';
import { SITE_URL } from '@/lib/site';
import { MarketingShell } from '@/components/marketing/marketing-shell';
import { MissionWorkspace } from './mission-workspace';
import './missions.css';

export function missionMetadata(locale: Locale, mission?: Mission): Metadata {
  const path=mission?`missions/${mission.id}`:'missions';
  const title=translate(locale,mission?.title??missionUi.title);
  const description=translate(locale,mission?.summary??missionUi.intro);
  const image=mission?.image??'/images/hero-ar-programs.webp';
  return {title,description,alternates:{canonical:localizedPath(locale,path),languages:{es:localizedPath('es',path),en:localizedPath('en',path),ru:localizedPath('ru',path),'x-default':localizedPath('es',path)}},openGraph:{type:'website',locale:locale==='es'?'es_MX':locale==='en'?'en_US':'ru_RU',url:SITE_URL+localizedPath(locale,path),title,description,images:[image]},twitter:{card:'summary_large_image',images:[image]}};
}
export function MissionIndex({locale}:{locale:Locale}) {
  const t=(key:keyof typeof missionUi)=>translate(locale,missionUi[key]);
  return <MarketingShell locale={locale} section="missions" primaryAction={{href:localizedPath(locale,'missions'),label:t('all')}}><section className="container ms-index"><header><span className="m-kicker">EducationOS / {t('ready')}</span><h1>{t('title')}</h1><p>{t('intro')}</p></header><div className="ms-catalog">{missions.map((mission,index)=><Link className="ms-mission-card" href={localizedPath(locale,`missions/${mission.id}`)} key={mission.id}><div className="ms-card-art"><Image src={mission.image} alt="" fill sizes="(max-width:640px) 90vw, (max-width:980px) 45vw, 30vw"/><span>{String(index+1).padStart(2,'0')}</span></div><div><span className="m-kicker">{translate(locale,mission.subject)}</span><h2>{translate(locale,mission.title)}</h2><p>{translate(locale,mission.summary)}</p><span className="ms-card-action">{t('start')}<ArrowUpRight size={18} aria-hidden="true"/></span></div></Link>)}</div><p className="ms-storage">{t('local')}</p></section></MarketingShell>;
}
export function MissionPage({locale,mission}:{locale:Locale;mission:Mission}) {
  const t=(key:keyof typeof missionUi)=>translate(locale,missionUi[key]);
  return <MarketingShell locale={locale} section={`missions/${mission.id}`} primaryAction={{href:localizedPath(locale,'missions'),label:t('all')}}><article className="container ms-page"><Link className="m-back" href={localizedPath(locale,'missions')}><ArrowLeft size={16} aria-hidden="true"/>{t('all')}</Link><header className="ms-hero"><div><span className="m-kicker">{translate(locale,mission.subject)}</span><h1>{translate(locale,mission.title)}</h1><p>{translate(locale,mission.summary)}</p><span className="ms-browser-badge"><MousePointer2 size={15} aria-hidden="true"/>{t('ready')}</span></div><div className="ms-hero-art" aria-hidden="true"><Image src={mission.image} alt="" fill priority sizes="(max-width:640px) 130px, 240px"/></div></header><p className="ms-goal">{translate(locale,mission.goal)}</p><MissionWorkspace key={`${locale}/${mission.id}`} mission={mission} locale={locale}/></article></MarketingShell>;
}
