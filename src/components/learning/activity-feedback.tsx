'use client';

import { useId, useRef, useState } from 'react';
import { CircleAlert, CircleCheck } from 'lucide-react';
import './activity-feedback.css';

export type ActivityResult = { passed: boolean; feedback: string; field?: string };

/** Shared check → correction → retry loop. Editing an answer clears its old result. */
export function useActivityCheck<T extends ActivityResult>(onCheck: () => T) {
  const [result, setResult] = useState<T | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const feedbackId = useId();
  function focusError(next = result) {
    if (next && !next.passed) requestAnimationFrame(() => {
      const controls = rootRef.current?.querySelectorAll<HTMLElement>('[data-answer]');
      const control = Array.from(controls ?? []).find(element => element.dataset.answer === next.field);
      if (control?.getClientRects().length) control.focus();
    });
  }
  function showResult(next: T) {
    setResult(next);
    // Keep the explanation visible. The learner chooses when to return to a field.
    requestAnimationFrame(() => document.getElementById(feedbackId)?.scrollIntoView({ block: 'nearest', behavior: 'instant' }));
  }
  function fieldProps(field: string) {
    const invalid = result?.passed === false && result.field === field;
    return { 'data-answer': field, 'aria-invalid': invalid || undefined, 'aria-describedby': invalid ? feedbackId : undefined };
  }
  return { result, rootRef, feedbackId, fieldProps, focusError, showResult, clearResult: () => setResult(null), check: () => showResult(onCheck()) };
}

export function ActivityFeedback({ result, id, successTitle = 'Success — activity recorded', errorTitle = 'Try again', className = '', onReview, reviewLabel = 'Review this answer' }: {
  result: ActivityResult | null; id?: string; successTitle?: string; errorTitle?: string; className?: string; onReview?: () => void; reviewLabel?: string;
}) {
  if (!result) return null;
  const Icon = result.passed ? CircleCheck : CircleAlert;
  return <div id={id} className={`activity-feedback ${className} ${result.passed ? 'is-success' : 'is-error'}`} role={result.passed ? 'status' : 'alert'} aria-atomic="true">
    <Icon size={21} aria-hidden="true" /><div><strong>{result.passed ? successTitle : errorTitle}</strong><p>{result.feedback}</p>{!result.passed && onReview && <button type="button" className="activity-review" onClick={() => onReview()}>{reviewLabel}</button>}</div>
  </div>;
}
