"use client";

import Link from "next/link";
import { useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Check, ChevronDown, CircleHelp, FlaskConical, FoldVertical, Lightbulb, RotateCcw, ShieldCheck, Waves } from "lucide-react";
import { stepEvidence, type DemoDraft } from "@/lib/demo-state";
import { useDemo } from "@/components/demo/demo-provider";
import { MeasurementComparison } from "@/components/demo/measurement";

const shortTitles = ["Notice", "Find the tradeoff", "Imagine", "Predict", "Experiment", "Reflect", "Transfer"];
const instructions = ["Add a sentence about what you noticed before you continue.", "Explain the two wishes that are hard to achieve together.", "Record at least two different ideas, with a short description of each.", "Write a prediction that explains your change and what you expect.", "Record both times between 0 and 60 seconds, and add a sentence about what happened.", "Add a reflection about your recorded evidence.", "Describe another place to try the principle."];
const hints = [
  "Look closely before changing anything. What do you actually see?",
  "An invention often begins with two good wishes that seem to disagree.",
  "Two different ideas are more useful than two names for the same idea.",
  "A useful hypothesis can be wrong. Your test helps you find out.",
  "Keep everything else as similar as you can. An unexpected result is still evidence.",
  "Separate what you saw from what you think it means.",
  "A principle is a useful idea you can carry to a new situation.",
];

function LabWorkspace() {
  const { session, draft, ready, updateDraft, mission } = useDemo();
  const step = draft.step;
  const evidence = stepEvidence(draft);
  const [error, setError] = useState("");
  const [strategy, setStrategy] = useState<number | null>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const router = useRouter();
  function update(update: Partial<DemoDraft>) { updateDraft(update); setError(""); }
  function goToStep(next: number) { updateDraft({ step: next }); setError(""); requestAnimationFrame(() => headingRef.current?.focus()); }
  function advance(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!evidence[step]) { setError(instructions[step]); return; }
    if (step === 6) router.push("/demo/portfolio");
    else goToStep(step + 1);
  }
  function noteField(field: "notice" | "contradiction" | "hypothesis" | "experiment" | "reflect" | "transfer", label: string, placeholder: string) {
    return <div className="demo-field"><label htmlFor={`demo-${field}`}>{label}<span>A sentence or two is enough.</span></label><textarea id={`demo-${field}`} value={draft[field]} maxLength={1200} rows={5} onChange={(event) => update({ [field]: event.target.value })} placeholder={placeholder} aria-required="true" aria-invalid={Boolean(error)} aria-describedby={error ? "demo-step-error" : undefined} disabled={!ready} /><span className="demo-field-footnote">Made-up examples only. No personal information.</span></div>;
  }
  return <>
    <div className="demo-lab-heading"><Link className="demo-text-link" href="/demo"><ArrowLeft size={16} aria-hidden="true" /> Back to your dashboard</Link><span className="demo-pill"><FlaskConical size={14} aria-hidden="true" /> INVENTORS LAB / MISSION 001</span></div>
    <div className="demo-page-heading demo-lab-title"><div><h1>A little paper.<br />A stronger bridge</h1><p>Ages {session.ageBand.replace("-", "–")} · A shape-changing experiment in seven steps.</p></div><div className="demo-lab-progress"><strong>{evidence.filter(Boolean).length}<span>/ 7</span></strong><span>steps with evidence</span></div></div>
    <div className="demo-lab-layout"><aside className="demo-mission-sidebar"><nav aria-label="Mission steps"><ol>{shortTitles.map((title, index) => <li key={title}><button type="button" className={step === index ? "is-current" : ""} aria-current={step === index ? "step" : undefined} onClick={() => goToStep(index)} disabled={!ready}><span className={evidence[index] ? "is-complete" : ""}>{evidence[index] ? <Check size={14} aria-hidden="true" /> : `0${index + 1}`}</span><span>{title}</span>{evidence[index] && <span className="demo-sr-only">Evidence recorded</span>}</button></li>)}</ol></nav><details className="demo-materials"><summary>Before you begin <ChevronDown size={15} aria-hidden="true" /></summary><ul>{mission.content.materials.map((material) => <li key={material}>{material}</li>)}</ul><p>{mission.content.adultGuidance}</p></details><div className="demo-mission-hint"><Lightbulb size={20} aria-hidden="true" /><strong>Think like an inventor.</strong><p>{hints[step]}</p></div></aside>
      <section className="demo-lab-panel" aria-labelledby="demo-step-title"><div className="demo-step-header"><span className="demo-eyebrow">STEP 0{step + 1} / 07</span>{evidence[step] && <span className="demo-evidence-added"><Check size={13} aria-hidden="true" /> Evidence added</span>}</div><h2 id="demo-step-title" tabIndex={-1} ref={headingRef}>{mission.content.steps[step].title}</h2><p className="demo-step-prompt">{mission.content.steps[step].prompt}</p>
        {step === 0 && <div className="demo-safety-callout"><ShieldCheck size={19} aria-hidden="true" /><p><strong>Build with adult support.</strong> Use one large, light toy block on a low, stable table. No heavy loads, small parts, or sharp tools.</p></div>}
        {step === 1 && <div className="demo-tradeoff"><div><span>WE WANT</span><strong>A bridge that stands longer.</strong></div><span className="demo-tradeoff-cross" aria-hidden="true">+</span><div><span>WE KEEP</span><strong>Just one sheet of paper.</strong></div></div>}
        {step === 2 && <div className="demo-strategies" aria-label="Optional thinking prompts">{[{ label: "Change the shape", icon: Waves, hint: "What changes if you curve, roll, or arch the paper?" }, { label: "Divide into folds", icon: FoldVertical, hint: "Could repeated folds change how the paper carries the load?" }, { label: "Move the support", icon: RotateCcw, hint: "Could the contact points or direction of the paper make a difference? Keep the 10 cm gap." }].map((item, index) => <button key={item.label} type="button" aria-pressed={strategy === index} onClick={() => setStrategy(strategy === index ? null : index)}><item.icon size={20} aria-hidden="true" /><span>{item.label}</span>{strategy === index && <small>{item.hint}</small>}</button>)}</div>}
        <form onSubmit={advance} noValidate>
          {step === 0 && noteField("notice", "What do you notice?", "The flat paper bends in the middle when…")}
          {step === 1 && noteField("contradiction", "Describe the tradeoff", "I want the bridge to…, while keeping… This is tricky because…")}
          {step === 2 && <div className="demo-ideas-fields">{draft.ideas.map((idea, index) => <div className="demo-field" key={index}><label htmlFor={`demo-idea-${index}`}>Idea 0{index + 1}{index === 2 && <span>Optional: stretch your thinking.</span>}</label><textarea id={`demo-idea-${index}`} rows={2} maxLength={300} value={idea} onChange={(event) => { const ideas = [...draft.ideas] as DemoDraft["ideas"]; ideas[index] = event.target.value; update({ ideas }); }} aria-required={index < 2} aria-invalid={Boolean(error)} aria-describedby={error ? "demo-step-error" : undefined} placeholder={index === 0 ? "One way I could change the bridge is…" : index === 1 ? "A different way could be…" : "What else is possible?"} disabled={!ready} /></div>)}</div>}
          {step === 3 && <>{noteField("hypothesis", "Make your prediction", "If I change…, then I predict…, because…")}<div className="demo-soft-note"><CircleHelp size={16} aria-hidden="true" /><p>Change one thing. Keep the paper, 10 cm gap, block, and placement the same.</p></div></>}
          {step === 4 && <><div className="demo-trial-note"><strong>One baseline. One redesign. Same conditions.</strong><p>Time until the bridge collapses. Stop at 60 seconds and record 60 if it is still standing. Use the same block, paper type, gap, and placement. Enter 0 if it collapses immediately.</p></div><div className="demo-number-fields"><div className="demo-field"><label htmlFor="demo-baseline">Flat paper / baseline</label><div className="demo-number-input"><input id="demo-baseline" type="number" inputMode="decimal" min="0" max="60" step="0.1" value={draft.baseline} onChange={(event) => update({ baseline: event.target.value })} aria-required="true" aria-invalid={Boolean(error)} disabled={!ready} /><span>seconds</span></div></div><div className="demo-field"><label htmlFor="demo-redesigned">Your redesigned paper</label><div className="demo-number-input"><input id="demo-redesigned" type="number" inputMode="decimal" min="0" max="60" step="0.1" value={draft.redesigned} onChange={(event) => update({ redesigned: event.target.value })} aria-required="true" aria-invalid={Boolean(error)} disabled={!ready} /><span>seconds</span></div></div></div>{noteField("experiment", "What happened during the test?", "I observed… One thing that might have affected the result was…")}<MeasurementComparison draft={draft} /></>}
          {step === 5 && <><MeasurementComparison draft={draft} />{noteField("reflect", "What does your evidence suggest?", "My observation supports / does not support my prediction because… Next I would check…")}</>}
          {step === 6 && noteField("transfer", "Where could this idea go next?", "I could use the same principle to… I would need to test…")}
          {error && <p id="demo-step-error" className="demo-form-error" role="alert">{error}</p>}
          <div className="demo-form-actions"><button type="button" className="demo-button demo-button-outline" onClick={() => goToStep(step - 1)} disabled={step === 0 || !ready}><ArrowLeft size={16} aria-hidden="true" /> Previous</button><span>Notes stay in this tab</span><button className="demo-button demo-button-dark" type="submit" disabled={!ready}>{step === 6 ? "View your portfolio" : "Next step"}<ArrowRight size={16} aria-hidden="true" /></button></div>
        </form>
      </section>
    </div>
  </>;
}
export default function LabPage() { const { session } = useDemo(); return <LabWorkspace key={session.ageBand} />; }
