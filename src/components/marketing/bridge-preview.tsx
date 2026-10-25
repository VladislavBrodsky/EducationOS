'use client';

import { useId, useState, type FormEvent } from 'react';
import type { Locale } from '@/lib/marketing-i18n';
import { showcaseCopy } from '@/lib/marketing-showcase';
import { paperBridgeCopy } from '@/lib/paper-bridge-copy';
import { checkPaperBridge } from '@/lib/paper-bridge-challenge';
import { ActivityFeedback, useActivityCheck } from '@/components/learning/activity-feedback';

export function BridgePreview({ locale }: { locale: Locale }) {
  const [folded, setFolded] = useState(false);
  const [principle, setPrinciple] = useState('');
  const copy = showcaseCopy[locale];
  const task = paperBridgeCopy[locale];
  const selectId = useId();
  const { result, rootRef, feedbackId, fieldProps, focusError, clearResult, check } = useActivityCheck(() => {
    const checked = checkPaperBridge({ folded, principle });
    return { ...checked, feedback: task[checked.feedback === 'choose' ? 'missing' : checked.feedback] };
  });
  function submit(event: FormEvent) { event.preventDefault(); check(); }
  return <div className="fx-bridge-preview" ref={rootRef}>
    <p className="fx-task-goal">{task.goal}</p>
    <form onSubmit={submit} noValidate>
    <p className="fx-task-step">{task.shapeStep}</p>
    <fieldset className="fx-shape-controls"><legend className="visually-hidden">{copy.controls}</legend>
      <button type="button" aria-pressed={!folded} onClick={() => { setFolded(false); clearResult(); }}>{copy.flat}</button>
      <button type="button" {...fieldProps('folded')} aria-pressed={folded} onClick={() => { setFolded(true); clearResult(); }}>{copy.folded}</button>
    </fieldset>
    <div className="fx-bridge-scene" data-shape={folded ? 'folded' : 'flat'}>
      <svg viewBox="0 0 500 230" role="img" aria-label={folded ? copy.foldedNote : copy.flatNote}>
        <ellipse cx="250" cy="192" rx="200" ry="16" fill="#24351b" opacity=".07" />
        <g stroke="#44523b" strokeWidth="1.5" strokeLinejoin="round">
          <path d="m65 135 65-30 48 22-65 32z" fill="#f7f9ee" /><path d="m65 135 48 24v43l-48-25z" fill="#d6dfc8" /><path d="m113 159 65-32v42l-65 33z" fill="#aab99a" />
          <path d="m325 135 65-30 48 22-65 32z" fill="#f7f9ee" /><path d="m325 135 48 24v43l-48-25z" fill="#d6dfc8" /><path d="m373 159 65-32v42l-65 33z" fill="#aab99a" />
        </g>
        <g className="fx-paper-flat" stroke="#44523b" strokeWidth="1.5" strokeLinejoin="round"><path d="m113 120 218 0 60 29-218 0z" fill="#e0fa95" /><path d="m173 149 218 0v5H173z" fill="#9db854" /></g>
        <g className="fx-paper-folded" stroke="#44523b" strokeWidth="1.5" strokeLinejoin="round">
          <path d="m113 119 22-19 22 19 22-19 22 19 22-19 22 19 22-19 22 19 22-19 22 19 22-19 22 19 60 29-22-19-22 19-22-19-22 19-22-19-22 19-22-19-22 19-22-19-22 19-22-19-22 19-22-19-22 19z" fill="#d5fc51" />
          {[0, 1, 2, 3, 4, 5].map(i => <path key={i} d={`m${135 + 44 * i} 100 60 29-22 19-60-29z`} fill="#b4d84d" />)}
        </g>
        <path d="M210 57h80m-10-7 10 7-10 7" fill="none" stroke="#728566" strokeWidth="1.5" strokeDasharray="3 4" />
      </svg>
    </div>
    <p className="fx-model-status" role="status">{folded ? copy.foldedNote : copy.flatNote}</p>
    <div className="fx-task-answer"><p className="fx-task-step">{task.principleStep}</p><label htmlFor={selectId}>{task.question}</label>
      <select id={selectId} {...fieldProps('principle')} value={principle} onChange={event => { setPrinciple(event.target.value); clearResult(); }}>
        <option value="">{task.choose}</option>{['shape', 'material', 'supports'].map((value, index) => <option key={value} value={value}>{task.options[index]}</option>)}
      </select>
    </div>
    <div className="fx-task-actions"><button className="m-button m-button-dark" type="submit">{task.check}</button><button className="m-button m-button-light" type="button" onClick={() => { setFolded(false); setPrinciple(''); clearResult(); }}>{task.reset}</button></div>
    <ActivityFeedback onReview={focusError} reviewLabel={task.review} id={feedbackId} result={result} successTitle={task.successTitle} errorTitle={task.errorTitle} />
    </form>
    <p className="fx-model-note">{copy.modelNote}</p>
    <noscript><p className="fx-task-noscript">{task.noScript}</p></noscript>
  </div>;
}
