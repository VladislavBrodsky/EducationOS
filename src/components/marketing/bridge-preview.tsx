'use client';

import { useState } from 'react';
import type { Locale } from '@/lib/marketing-i18n';
import { showcaseCopy } from '@/lib/marketing-showcase';

export function BridgePreview({ locale }: { locale: Locale }) {
  const [folded, setFolded] = useState(false);
  const copy = showcaseCopy[locale];
  return <div className="fx-bridge-preview">
    <fieldset className="fx-shape-controls"><legend className="visually-hidden">{copy.controls}</legend>
      <button type="button" aria-pressed={!folded} onClick={() => setFolded(false)}>{copy.flat}</button>
      <button type="button" aria-pressed={folded} onClick={() => setFolded(true)}>{copy.folded}</button>
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
    <p className="fx-model-note">{copy.modelNote}</p>
  </div>;
}
