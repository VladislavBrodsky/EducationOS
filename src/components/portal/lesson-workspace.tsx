"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { ArrowLeft, ArrowRight, Check, CircleCheck, Code2, Lightbulb, Play, RotateCcw } from "lucide-react";
import { checkPortalActivity, getPortalLesson, getPortalSubject, getSubjectLessons, type ActivitySubmission } from "@/lib/portal-learning";
import { PRACTICE_CODE_LIMITS, runPracticeCode, type PracticeCodeResult } from "@/lib/learning-runner";
import { usePortal } from "./portal-provider";
import { usePortalNavigation } from "./portal-shell";

export function LessonWorkspace({ lessonId }: { lessonId: string }) {
  const { ready, lessonState, updateLesson, checkActivity } = usePortal();
  const { href } = usePortalNavigation();
  const lesson = getPortalLesson(lessonId)!;
  const subject = getPortalSubject(lesson.subjectId)!;
  const lessons = getSubjectLessons(lesson.subjectId);
  const index = lessons.findIndex(item => item.id === lesson.id);
  const next = lessons[index + 1];
  const draft = lessonState(lessonId);
  const [mobile, setMobile] = useState("learn");
  const [run, setRun] = useState<PracticeCodeResult | null>(null);
  const [assessment, setAssessment] = useState<ReturnType<typeof checkPortalActivity> | null>(null);
  const activity = lesson.activity;
  const code = draft.draftCode ?? (activity.kind === "code" ? activity.starterCode : "");
  function changed() { setAssessment(null); setRun(null); }
  function runCode() {
    const result = runPracticeCode(code);
    setRun(result);
    setAssessment(null);
    setMobile("result");
  }
  function record(event: FormEvent) {
    event.preventDefault();
    const submission: ActivitySubmission = { code, answer: draft.answer, writing: draft.writing, observations: draft.observations };
    if (activity.kind === "code") {
      // Persist the visible starter too, so a recorded activity can always be
      // restored and revalidated against the work that was actually checked.
      updateLesson(lessonId, { draftCode: code });
      setRun(runPracticeCode(code));
    }
    const result = checkActivity(lessonId, submission);
    setAssessment(result);
    setMobile("result");
  }
  const resultId = `activity-result-${lessonId}`;
  return <>
    <Link className="p-text-link p-back" href={href("/subjects")}><ArrowLeft size={17} aria-hidden="true" />Back to learning paths</Link>
    <div className="p-lesson-heading"><div><p className="p-eyebrow">{subject.title} / {lesson.skill}</p><h1>{lesson.title}</h1><p className="p-muted">{lesson.minutes} min · {lesson.subtitle}</p></div><div className="p-lesson-progress"><span className="p-small">Activity {index + 1} of {lessons.length}</span><div className="p-step-track" aria-hidden="true">{lessons.map(item => <span key={item.id} className={lessonState(item.id).completed ? "is-done" : item.id === lessonId ? "is-current" : ""} />)}</div></div></div>
    <div className="p-mobile-tabs" aria-label="Learning workspace sections">{["learn", "activity", "result"].map(tab => <button key={tab} type="button" className="p-tab" aria-pressed={mobile === tab} onClick={() => setMobile(tab)}>{tab === "learn" ? "Learn" : tab === "activity" ? "Activity" : "Result"}</button>)}</div>
    <div className="p-lesson-layout" data-mobile={mobile}>
      <section className="p-instructions" aria-label="Learning instructions"><div className="p-goal"><p className="p-eyebrow">YOUR GOAL</p><p>{lesson.objective}</p></div><h2>Explore the idea.</h2>{lesson.learn.map((paragraph, i) => <p key={i}>{paragraph}</p>)}<h3>Your activity</h3><p>{lesson.instructions}</p><details className="p-help"><summary><Lightbulb size={17} aria-hidden="true" />Give me a hint</summary><p>{activity.kind === "code" ? activity.hint : activity.kind === "writing" ? activity.example : activity.kind === "experiment" ? "Keep the conditions as similar as you can. Record what you notice, even when it surprises you." : "Compare each option with the idea above. Explain to yourself why one fits best."}</p></details>{activity.kind === "code" && <details className="p-help"><summary><Code2 size={17} aria-hidden="true" />Practice code guide</summary><p>This small language supports text, numbers, variables, arithmetic, print, and repeat. It is not full Python or JavaScript.</p><pre>{'message = "Hello"\nrepeat 3:\n  print(message)'}</pre><p>Indent repeated lines with two spaces. Runs are limited to 40 repeats per block and 100 output lines.</p></details>}</section>
      <section className="p-workspace" aria-label="Activity workspace">
        <div className="p-workspace-header"><span>{activity.kind === "code" ? activity.languageLabel : activity.kind === "choice" ? "Try an idea" : activity.kind === "writing" ? "Your writing space" : "Your investigation notebook"}</span><span className="p-small p-muted">Notes stay in this tab</span></div>
        <form onSubmit={record} noValidate>
          <div className="p-editor-body">
            {activity.kind === "code" && <><div className="p-field"><label htmlFor="practice-code">Your code</label><textarea id="practice-code" className="p-code-editor" value={code} onChange={event => { updateLesson(lessonId, { draftCode: event.target.value }); changed(); }} spellCheck={false} autoCapitalize="off" autoCorrect="off" maxLength={PRACTICE_CODE_LIMITS.sourceLength} rows={9} disabled={!ready} aria-describedby="practice-language-note" /></div><p id="practice-language-note" className="p-small p-muted">EducationOS practice code · Runs locally · Try a change and see what happens.</p><div className="p-toolbar"><button className="p-primary" type="button" onClick={runCode} disabled={!ready}><Play size={17} aria-hidden="true" />Run code</button><button className="p-secondary" type="button" onClick={() => { updateLesson(lessonId, { draftCode: activity.starterCode }); changed(); }} disabled={!ready || code === activity.starterCode}><RotateCcw size={16} aria-hidden="true" />Reset example</button></div></>}
            {activity.kind === "choice" && <fieldset className="p-choices"><legend>{activity.question}</legend>{activity.options.map(option => <label key={option.id} className={`p-choice ${draft.answer === option.id ? "is-selected" : ""}`}><input type="radio" name={`choice-${lessonId}`} value={option.id} checked={draft.answer === option.id} onChange={() => { updateLesson(lessonId, { answer: option.id }); changed(); }} disabled={!ready} /><span>{option.text}</span></label>)}</fieldset>}
            {activity.kind === "writing" && <><div className="p-field"><label htmlFor="writing-draft">{activity.prompt}</label><textarea id="writing-draft" value={draft.writing ?? ""} onChange={event => { updateLesson(lessonId, { writing: event.target.value }); changed(); }} placeholder={activity.placeholder} rows={9} maxLength={5000} disabled={!ready} aria-describedby="writing-criteria" /></div><p id="writing-criteria" className="p-small p-muted">Write at least {activity.minWords} words. Recording checks the length; it does not grade your writing.</p><ul className="p-checklist">{activity.checklist.map(item => <li key={item}><Check size={16} aria-hidden="true" />{item}</li>)}</ul></>}
            {activity.kind === "experiment" && <><p>{activity.prompt}</p><div className="p-form-grid">{activity.fields.map(field => <div className="p-field" key={field.id}><label htmlFor={`observation-${field.id}`}>{field.label}</label>{field.type === "number" ? <input id={`observation-${field.id}`} type="number" inputMode="decimal" min={field.min} max={field.max} step="1" value={draft.observations?.[field.id] ?? ""} onChange={event => { updateLesson(lessonId, { observations: { ...draft.observations, [field.id]: event.target.value } }); changed(); }} placeholder={field.placeholder} disabled={!ready} /> : <textarea id={`observation-${field.id}`} value={draft.observations?.[field.id] ?? ""} onChange={event => { updateLesson(lessonId, { observations: { ...draft.observations, [field.id]: event.target.value } }); changed(); }} placeholder={field.placeholder} rows={3} maxLength={1200} disabled={!ready} />}</div>)}</div><ul className="p-checklist">{activity.checklist.map(item => <li key={item}><Check size={16} aria-hidden="true" />{item}</li>)}</ul><p className="p-small p-muted">Recording checks that the fields contain observations. It does not verify your experiment.</p></>}
            <div className="p-form-actions"><button className={activity.kind === "code" ? "p-secondary" : "p-primary"} type="submit" disabled={!ready}>{activity.kind === "choice" ? "Check my answer" : activity.kind === "code" ? "Check & record activity" : "Record my practice"}<CircleCheck size={17} aria-hidden="true" /></button></div>
          </div>
          <div className="p-output" id={resultId} aria-live="polite"><p className="p-eyebrow">{activity.kind === "code" ? "OUTPUT" : "FEEDBACK"}</p>{activity.kind === "code" && (run ? <>{run.output.length > 0 && <pre>{run.output.join("\n")}</pre>}{run.error ? <p className="p-error" role="alert">Line {run.error.line}: {run.error.message}</p> : <p className="p-small p-muted">Run finished · {run.output.length} output {run.output.length === 1 ? "line" : "lines"}</p>}</> : <p className="p-muted">Your output will appear here after you run the code.</p>)}{assessment ? <div className={`p-assessment-feedback ${assessment.passed ? "is-success" : "is-error"}`} role={assessment.passed ? "status" : "alert"}><strong>{assessment.passed ? "Activity recorded." : "Try another way."}</strong><p>{assessment.feedback}</p></div> : activity.kind !== "code" && <p className="p-muted">Try the activity, then check or record your work.</p>}<div className="p-mobile-result-actions"><button type="button" className="p-secondary" onClick={() => setMobile("activity")}>Back to activity<ArrowLeft size={16} aria-hidden="true" /></button>{activity.kind === "code" && <button className="p-primary" type="submit" disabled={!ready}>Check & record<CircleCheck size={16} aria-hidden="true" /></button>}</div></div>
        </form>
      </section>
    </div>
    {draft.completed && <section className="p-reflection p-card" aria-labelledby="reflection-heading"><div><span className="p-tag"><CircleCheck size={15} aria-hidden="true" />Activity recorded</span><h2 id="reflection-heading">Make the idea yours.</h2><p>{lesson.reflection}</p></div><div className="p-field"><label htmlFor="reflection-note">My reflection <span className="p-muted">(optional)</span></label><textarea id="reflection-note" value={draft.reflection ?? ""} onChange={event => updateLesson(lessonId, { reflection: event.target.value })} rows={3} maxLength={1200} placeholder="I noticed… Next, I would try…" /></div><div className="p-toolbar">{next ? <Link className="p-primary" href={href(`/learn/${next.id}`)}>Next activity<ArrowRight size={18} aria-hidden="true" /></Link> : <Link className="p-primary" href={href("/progress")}>See what you’ve made<ArrowRight size={18} aria-hidden="true" /></Link>}<Link className="p-text-link" href={href("/subjects")}>Explore another subject</Link></div></section>}
  </>;
}
