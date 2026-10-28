'use client';

import { useState } from 'react';
import { Check, RotateCcw, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { ActivityFeedback, useActivityCheck } from '@/components/learning/activity-feedback';
import { HALF_GRID, readHalfSelection, toggleHalfCell, writeHalfSelection } from '@/lib/labs/same-half';
import { checkMission } from '@/lib/missions/model';
import { missionUi, translate, type Mission } from '@/lib/missions/catalog';
import { localizedPath, type Locale } from '@/lib/marketing-i18n';
import { useMissionDraft } from './use-mission-draft';
import { MissionModel } from './mission-model';

export function MissionWorkspace({ mission, locale }: { mission: Mission; locale: Locale }) {
  const draft=useMissionDraft(mission.id);
  const [edited,setEdited]=useState(false);
  const t=(key:keyof typeof missionUi)=>translate(locale,missionUi[key]);
  const { result, rootRef, feedbackId, fieldProps, focusError, clearResult, check }=useActivityCheck(()=>{
    const checked=checkMission(mission.id,draft.inputs);
    return {...checked,feedback:translate(locale,checked.passed?mission.success:mission.errors[checked.code as keyof typeof mission.errors])};
  });
  function change(field:string,value:string) { setEdited(edited||Boolean(result?.passed)); clearResult(); draft.change(field,value); }
  const selected=readHalfSelection(draft.inputs.cells??'');
  return <div className="ms-workspace" ref={rootRef} data-mission={mission.id}>
    <section className="ms-model" aria-labelledby="mission-model-title"><h2 id="mission-model-title">{t('model')}</h2><MissionModel mission={mission} inputs={draft.inputs} locale={locale}>
      <fieldset className="ms-grid-field" disabled={!draft.ready}><legend>{translate(locale,mission.fields.find(f=>f.kind==='grid')?.label??missionUi.model)}</legend><div className="ms-half-grid">{Array.from({length:HALF_GRID.cells},(_,cell)=><button type="button" {...(cell===0?fieldProps('cells'):{})} key={cell} aria-label={`${t('cell')} ${cell+1}`} aria-pressed={selected.includes(cell)} onClick={()=>change('cells',writeHalfSelection(toggleHalfCell(selected,cell)))}>{cell+1}{selected.includes(cell)&&<Check size={16} aria-hidden="true"/>}</button>)}</div><p>{t('selected')}: {selected.length} / {HALF_GRID.cells}</p></fieldset>
    </MissionModel><p className="ms-scope">{translate(locale,mission.scope)}</p></section>
    <form id="mission-controls" className="ms-task" noValidate onSubmit={event=>{event.preventDefault();setEdited(false);check();}} aria-busy={!draft.ready}>
      {(['explore','explain'] as const).map(stage=><fieldset key={stage} disabled={!draft.ready}><legend>{t(stage)}</legend>{mission.fields.filter(f=>f.stage===stage&&f.kind!=='grid').map(field=><div className="ms-field" key={field.key}><label htmlFor={`mission-${field.key}`}>{translate(locale,field.label)}{field.kind==='range'&&<output htmlFor={`mission-${field.key}`}>{draft.inputs[field.key]}</output>}</label>{field.kind==='select'?<select id={`mission-${field.key}`} {...fieldProps(field.key)} aria-required="true" value={draft.inputs[field.key]} onChange={event=>change(field.key,event.target.value)}><option value="">{t('choose')}</option>{field.options?.map(option=><option value={option.value} key={option.value}>{translate(locale,option.label)}</option>)}</select>:<input id={`mission-${field.key}`} {...fieldProps(field.key)} type={field.kind==='range'?'range':'number'} aria-required={field.kind==='number'?true:undefined} min={field.min} max={field.max} step={field.step??1} inputMode={field.min!<0?'text':'numeric'} value={draft.inputs[field.key]} onChange={event=>change(field.key,event.target.value)}/>}</div>)}{stage==='explore'&&mission.fields.some(f=>f.kind==='grid')&&<p>{t('selected')}: {selected.length} / {HALF_GRID.cells}</p>}</fieldset>)}
      <div className="ms-actions"><button className="m-button m-button-dark" type="submit" disabled={!draft.ready}>{t('check')}<ArrowRight size={17} aria-hidden="true"/></button><button className="ms-reset" type="button" disabled={!draft.ready} onClick={()=>{draft.reset();clearResult();setEdited(false);}}><RotateCcw size={16} aria-hidden="true"/>{t('reset')}</button></div>
      {edited&&<p className="ms-edited" role="status">{t('changed')}</p>}
      <ActivityFeedback result={result} id={feedbackId} successTitle={t('success')} errorTitle={t('error')} onReview={()=>focusError()} reviewLabel={t('review')}/>
      {result?.passed&&<Link className="ms-next" href={localizedPath(locale,'missions')}>{t('next')}<ArrowRight size={18} aria-hidden="true"/></Link>}
      <details className="ms-help"><summary>{t('help')}</summary><p>{translate(locale,mission.principle)}</p>{mission.source&&<a href={mission.source.url}>{t('source')} · {mission.source.label}</a>}</details>
      <p className="ms-storage" role="status">{draft.storageFailed?t('storage'):t('local')}</p>
      <noscript><p>{locale==='es'?'Activa JavaScript para manipular el modelo y comprobar tus respuestas. La explicación y las referencias siguen disponibles.':locale==='ru'?'Включи JavaScript для работы с моделью и проверки. Объяснение и источники доступны без него.':'Enable JavaScript to manipulate the model and check answers. The explanation and references remain available.'}</p></noscript>
    </form>
  </div>;
}
