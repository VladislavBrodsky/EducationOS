"use client";

import { useEffect, useId, useMemo, useRef, useState, useSyncExternalStore, type FormEvent } from "react";
import { Pause, Play, RotateCcw, SkipForward } from "lucide-react";
import { LOOP_LOOM_INTERVAL_MS, loopLoomRepeats, loopLoomSnapshot, loopLoomSource } from "@/lib/labs/loop-loom";
import type { LabCheck, LabProps } from "@/lib/labs/types";
import { boxCorners, fitProjection, iso, slabOf } from "@/vendor/anatomy/iso-kit";
import { AnatomySolid } from "./anatomy-solid";
import "./loop-loom.css";

function subscribeReducedMotion(callback: () => void) {
  const query = window.matchMedia("(prefers-reduced-motion: reduce)");
  query.addEventListener("change", callback);
  return () => query.removeEventListener("change", callback);
}
function reducedMotionSnapshot() { return window.matchMedia("(prefers-reduced-motion: reduce)").matches; }
function reducedMotionServerSnapshot() { return true; }

/** Fixed-view Anatomy SVG: a teaching analogy for ordered execution, not a CPU. */
function LoomFigure({ repeats, steps, revealed }: { repeats: number; steps: number; revealed: boolean }) {
  const titleId = useId();
  const descriptionId = useId();
  const model = loopLoomSnapshot(repeats, steps);
  const projection = fitProjection(boxCorners({ x: 0, y: 0, w: 10, d: 6, r: 0 }, 0, 2), 640, 350, { pad: 26, azimuth: 45, elevation: 30 });
  const solid = (x: number, y: number, w: number, d: number, z: number, height: number) => slabOf({ x, y, w, d, r: 0.06 }, z, height, projection, 2);
  const plateLabel = (x: number, text: string) => {
    const at = iso([x, 2, 1.04], projection);
    return <text x={at[0]} y={at[1]} className="loom-plate-label" textAnchor="middle">{text}</text>;
  };
  return <svg className="loom-figure" viewBox="0 0 640 350" role="img" aria-labelledby={`${titleId} ${descriptionId}`}>
    <title id={titleId}>Loop Loom instruction machine</title>
    <desc id={descriptionId}>A fixed-view isometric teaching model. The shuttle follows the Clap plate, then the Tap plate. {revealed ? `${model.output.length} printed tickets are in the tray.` : "Output tickets stay hidden until you predict or choose Show me."} The tickets represent text, not sound.</desc>
    <AnatomySolid paths={solid(0, 0, 10, 6, 0, 0.22)} />
    <AnatomySolid paths={solid(0.7, 0.5, 0.45, 3.1, 0.22, 0.4)} />
    <AnatomySolid paths={solid(8.85, 0.5, 0.45, 3.1, 0.22, 0.4)} />
    <AnatomySolid paths={solid(0.7, 0.62, 8.6, 0.24, 0.62, 0.18)} />
    <AnatomySolid paths={solid(0.7, 3.1, 8.6, 0.24, 0.62, 0.18)} />
    <AnatomySolid paths={solid(1.8, 1.15, 2.25, 1.7, 0.65, 0.25)} accent={revealed && model.nextInstruction === "Clap"} />
    <AnatomySolid paths={solid(5.8, 1.15, 2.25, 1.7, 0.65, 0.25)} accent={revealed && model.nextInstruction === "Tap"} />
    {plateLabel(2.9, "1 · Clap")}{plateLabel(6.9, "2 · Tap")}
    <g className="loom-shuttle" aria-hidden="true"><AnatomySolid paths={solid(model.nextInstruction === "Tap" ? 6.5 : 2.5, 0.5, 0.85, 0.55, 0.8, 0.75)} accent /></g>
    <AnatomySolid paths={solid(0.6, 3.9, 8.8, 1.55, 0.22, 0.12)} />
    {revealed && Array.from({ length: model.totalLines }, (_, index) => <g key={index} className={index < model.steps ? "loom-ticket is-printed" : "loom-ticket is-empty"}>
      <AnatomySolid paths={solid(0.88 + index % 6 * 1.38, 4.02 + Math.floor(index / 6) * 0.7, 1.13, 0.54, 0.34, 0.12)} accent={index < model.steps} />
    </g>)}
  </svg>;
}

export function LoopLoom(props: LabProps) {
  const repeats = loopLoomRepeats(props.record.settings.repeats);
  // A changed repeat count creates a new paused controller, including timers and output.
  return <LoopLoomWorkspace key={repeats} {...props} repeats={repeats} />;
}

function LoopLoomWorkspace({ record, ready, onChange, onRecord, repeats }: LabProps & { repeats: number }) {
  const [steps, setSteps] = useState(0);
  const [runRequested, setRunRequested] = useState(false);
  const [showMe, setShowMe] = useState(false);
  const [flat, setFlat] = useState(false);
  const [message, setMessage] = useState("");
  const [check, setCheck] = useState<LabCheck | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useSyncExternalStore(subscribeReducedMotion, reducedMotionSnapshot, reducedMotionServerSnapshot);
  const model = useMemo(() => loopLoomSnapshot(repeats, steps), [repeats, steps]);
  const revealed = showMe || record.answers.predictionSubmitted === "yes";
  const running = runRequested && !model.finished && ready && revealed && !reducedMotion;
  const source = loopLoomSource(repeats);
  const id = useId();

  useEffect(() => {
    if (!running) return;
    const interval = window.setInterval(() => setSteps(current => Math.min(current + 1, repeats * 2)), LOOP_LOOM_INTERVAL_MS);
    return () => window.clearInterval(interval);
  }, [running, repeats]);

  useEffect(() => {
    function pauseWhenHidden() { if (document.hidden) setRunRequested(false); }
    document.addEventListener("visibilitychange", pauseWhenHidden);
    const observer = typeof IntersectionObserver === "undefined" ? null : new IntersectionObserver(entries => {
      if (entries.some(entry => !entry.isIntersecting)) setRunRequested(false);
    });
    if (rootRef.current) observer?.observe(rootRef.current);
    return () => { document.removeEventListener("visibilitychange", pauseWhenHidden); observer?.disconnect(); };
  }, []);

  function answer(key: string, value: string) {
    setCheck(null);
    if (key === "prediction") setRunRequested(false);
    onChange({ answers: { ...record.answers, [key]: value, ...(key === "prediction" ? { predictionSubmitted: "" } : {}) } });
  }
  function changeRepeats(next: number) {
    if (!Number.isInteger(next) || next < 0 || next > 6 || next === repeats) return;
    setRunRequested(false);
    setSteps(0);
    setShowMe(false);
    setCheck(null);
    onChange({ settings: { ...record.settings, repeats: String(next) }, answers: {} });
  }
  function predict(event: FormEvent) {
    event.preventDefault();
    if (!/^\d{1,2}$/.test((record.answers.prediction ?? "").trim()) || Number(record.answers.prediction) > 12) {
      setMessage("Choose a whole number from 0 to 12 for your prediction.");
      return;
    }
    onChange({ answers: { ...record.answers, predictionSubmitted: "yes" } });
    setMessage(Number(record.answers.prediction) === repeats * 2 ? "Prediction saved. Use Step to see how each block works." : "Prediction saved. Count the instructions inside one block, then count how many blocks repeat. Explore to test your idea.");
  }

  return <div className="loom-lab" ref={rootRef}>
    <section className="lab-panel loom-prediction" aria-labelledby={`${id}-predict-title`}>
      <p className="p-eyebrow">01 / Predict</p><h2 id={`${id}-predict-title`}>Two instructions. How many lines?</h2>
      <p>The block says Clap, then Tap. If it repeats {repeats} {repeats === 1 ? "time" : "times"}, how many lines will appear? A prediction is your first idea; it can change.</p>
      <form onSubmit={predict} className="loom-predict-form" noValidate>
        <div className="p-field"><label htmlFor={`${id}-prediction`}>My predicted number of lines</label><input id={`${id}-prediction`} type="number" inputMode="numeric" min="0" max="12" step="1" value={record.answers.prediction ?? ""} onChange={event => answer("prediction", event.target.value)} disabled={!ready} /></div>
        <button type="submit" className="p-primary" disabled={!ready}>Save my prediction</button>
        {!revealed && <button type="button" className="p-secondary" disabled={!ready} onClick={() => { setShowMe(true); setMessage("The model is revealed. Submit your own prediction too before recording your learning."); }}>Show me</button>}
      </form>
      <p className="loom-status" role="status">{message || (record.answers.predictionSubmitted === "yes" ? "Your prediction is saved. Explore to test it." : "Make a prediction before the output is revealed.")}</p>
    </section>

    <section className="lab-panel loom-explore" aria-labelledby={`${id}-explore-title`}>
      <div className="loom-section-heading"><div><p className="p-eyebrow">02 / Explore</p><h2 id={`${id}-explore-title`}>Make a rhythm with a loop.</h2></div><button className="p-secondary" type="button" aria-pressed={flat} onClick={() => setFlat(current => !current)}>{flat ? "Isometric view" : "2D view"}</button></div>
      <p className="p-muted">The loom is a teaching analogy. Its tickets represent printed text. It does not make sound or show how a real computer is built.</p>
      <div className="loom-controls"><div className="loom-repeat-control"><label htmlFor={`${id}-repeats`}>Repeats</label><div><button className="p-secondary" type="button" aria-label="One fewer repeat" disabled={!ready || repeats === 0} onClick={() => changeRepeats(repeats - 1)}>−</button><input id={`${id}-repeats`} type="number" inputMode="numeric" min="0" max="6" step="1" value={repeats} onChange={event => { if (event.target.value !== "") changeRepeats(Number(event.target.value)); }} disabled={!ready} /><button className="p-secondary" type="button" aria-label="One more repeat" disabled={!ready || repeats === 6} onClick={() => changeRepeats(repeats + 1)}>+</button></div></div><p className="p-small p-muted">Changing repeats starts again and clears the answers for this case.</p></div>

      {!flat ? <div className="loom-diagram"><LoomFigure repeats={repeats} steps={model.steps} revealed={revealed} /></div> : <div className="loom-flat-trace"><h3>Flat instruction trace</h3><ol><li className={revealed && model.nextInstruction === "Clap" ? "is-next" : ""}>Print Clap.</li><li className={revealed && model.nextInstruction === "Tap" ? "is-next" : ""}>Print Tap.</li></ol><p>After Tap, go back to Clap if another block remains.</p>{revealed ? <p>{model.completedBlocks} of {repeats} blocks complete · {model.steps} lines printed</p> : <p>Make your prediction to reveal the trace counts.</p>}</div>}
      <div className="loom-code-output"><div><h3>EducationOS practice code</h3><pre className="loom-code"><code>{source}</code></pre><p className="p-small p-muted">A small learning language, with two-space indentation. This is not full Python or JavaScript.</p></div><div><h3>Printed output</h3>{revealed ? <><pre className="loom-code loom-output" aria-label="Printed output">{model.output.length ? model.output.join("\n") : repeats === 0 ? "(empty output)" : "(nothing printed yet)"}</pre><p className="loom-readout" aria-live="polite">{repeats === 0 ? "Zero repeats runs neither instruction." : model.finished ? `Block repeated ${repeats} ${repeats === 1 ? "time" : "times"} · ${model.totalLines} lines printed.` : `${model.completedBlocks} complete ${model.completedBlocks === 1 ? "block" : "blocks"} · ${model.steps} ${model.steps === 1 ? "line" : "lines"} printed. Next: ${model.nextInstruction}.`}</p></> : <div className="loom-hidden-output"><p>Your output is hidden.</p><p className="p-small p-muted">Save a prediction or choose Show me.</p></div>}</div></div>
      <div className="p-toolbar"><button className="p-primary" type="button" disabled={!ready || !revealed || model.finished} onClick={() => { setRunRequested(false); setSteps(current => Math.min(current + 1, repeats * 2)); }}><SkipForward size={17} aria-hidden="true" />Step</button><button className="p-secondary" type="button" disabled={!ready || !revealed || model.finished || reducedMotion} onClick={() => setRunRequested(current => !current)}>{running ? <Pause size={17} aria-hidden="true" /> : <Play size={17} aria-hidden="true" />}{running ? "Pause" : "Run"}</button><button className="p-secondary" type="button" disabled={!ready} onClick={() => { setRunRequested(false); setSteps(0); }}><RotateCcw size={17} aria-hidden="true" />Reset run</button></div>
      <p className="p-small p-muted">{reducedMotion ? "Reduced motion is on. Use Step to advance one instruction at a time." : "Run advances one instruction every 0.7 seconds. Pause whenever you want."} Try two steps first. Then compare 0, 1, and 3 repeats.</p>
      {revealed && <details className="p-help"><summary>Why does the line count grow?</summary><p>One block contains two print instructions. Repeating the whole block {repeats} {repeats === 1 ? "time" : "times"} creates {repeats} × 2 = {model.totalLines} lines. A repeat count counts whole blocks, not output lines.</p></details>}
    </section>

    <section className="lab-panel loom-explain" aria-labelledby={`${id}-explain-title`}><p className="p-eyebrow">03 / Explain & try a new case</p><h2 id={`${id}-explain-title`}>Can you use the idea again?</h2><p>You can work these out with the code or the 2D trace. Playing the animation is optional.</p>
      <div className="p-field"><label htmlFor={`${id}-observation`}>With {repeats} {repeats === 1 ? "repeat" : "repeats"} and two instructions per block, how many lines print?</label><input id={`${id}-observation`} type="number" inputMode="numeric" min="0" max="12" step="1" value={record.answers.observation ?? ""} onChange={event => answer("observation", event.target.value)} disabled={!ready} /></div>
      <h3>New case: add Snap.</h3><pre className="loom-code"><code>{'repeat 4:\n  print("Clap")\n  print("Tap")\n  print("Snap")'}</code></pre>
      <div className="p-field"><label htmlFor={`${id}-transfer`}>How many lines will this new program print?</label><input id={`${id}-transfer`} type="number" inputMode="numeric" min="0" max="24" step="1" value={record.answers.transfer ?? ""} onChange={event => answer("transfer", event.target.value)} disabled={!ready} /></div>
      <div className="p-field"><label htmlFor={`${id}-order`}>What are the first three output lines, in order?</label><select id={`${id}-order`} value={record.answers.transferFirst ?? ""} onChange={event => answer("transferFirst", event.target.value)} disabled={!ready}><option value="">Choose an order</option><option value="Clap, Clap, Clap">Clap, Clap, Clap</option><option value="Snap, Tap, Clap">Snap, Tap, Clap</option><option value="Clap, Tap, Snap">Clap, Tap, Snap</option></select></div>
      <button type="button" className="p-primary" disabled={!ready} onClick={() => setCheck(onRecord())}>Check & record my learning</button>
      {check && <div className={`p-assessment-feedback ${check.passed ? "is-success" : "is-error"}`} role="status"><strong>{check.passed ? "Learning recorded." : "Keep investigating."}</strong><p>{check.feedback}</p></div>}
    </section>
    <noscript><section className="lab-panel"><h2>Loop Loom without animation</h2><p>Start with the default program above: two print instructions repeat three times. Predict the number of lines before opening the worked example.</p><details><summary>Reveal the worked example</summary><table><caption>Three blocks, with two lines in each block</caption><thead><tr><th>Block</th><th>First line</th><th>Second line</th></tr></thead><tbody><tr><td>1</td><td>Clap</td><td>Tap</td></tr><tr><td>2</td><td>Clap</td><td>Tap</td></tr><tr><td>3</td><td>Clap</td><td>Tap</td></tr></tbody></table><p>Three groups of two make six lines. Zero repeats prints nothing. For a new case, try three instructions repeated four times.</p></details><p>Use paper to answer the questions. Saving answers requires JavaScript.</p></section></noscript>
  </div>;
}
