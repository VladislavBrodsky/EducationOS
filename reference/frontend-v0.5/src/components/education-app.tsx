'use client';

import { useEffect, useRef, useState } from 'react';
import { ArrowDownToLine, ArrowLeft, ArrowRight, ArrowUpRight, Anchor, Beaker, BookOpen, Box, Check, ChevronRight, Compass, FlaskConical, Layers3, LayoutDashboard, Lightbulb, LockKeyhole, Orbit, RotateCcw, ShieldCheck, Sparkles, Telescope, TreePine, Building2, X } from 'lucide-react';
import { Badge, Button, Card, EmptyState, Field, Progress } from './ui';
import { advance, exportPortfolio, isComplete, newAttempt, progress, sampleAnswers, stages, steps, updateAnswer, validateStep, type AnswerKey, type Attempt, type StageId } from '@/lib/learning';

type View = 'dashboard' | 'lab' | 'skills' | 'portfolio' | 'guardian';
const navigation = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'lab', label: 'Inventors Lab', icon: FlaskConical },
  { id: 'skills', label: 'Skills Vault', icon: Layers3 },
  { id: 'portfolio', label: 'Portfolio', icon: BookOpen },
  { id: 'guardian', label: 'Guardian preview', icon: ShieldCheck }
] as const;
const worldIcons = [TreePine, Anchor, Orbit, Building2, Telescope];
const stepDescriptions = [
  'Begin with a question. Look closely before you decide what to build.',
  'Inventors look for a tension: something we want to improve, and something we need to protect.',
  'Explore three different directions before choosing one. A sketch is a great place to start.',
  'Choose one idea and make a prediction you can test. Explain why you think it might work.',
  'Compare a flat bridge and an accordion-folded bridge. Keep the paper, gap, and counters the same.',
  'Look at what happened. A surprising result is useful evidence, too.',
  'Carry the idea into a different situation. Where else could structure make a difference?'
];

function BridgeIllustration() {
  return <svg viewBox="0 0 480 340" role="img" aria-labelledby="bridge-art-title"><title id="bridge-art-title">An experimental folded paper bridge between two supports</title>
    <defs><pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse"><path d="M 30 0 L 0 0 0 30" fill="none" stroke="#b8cf74" strokeWidth=".6" /></pattern></defs>
    <rect width="480" height="340" fill="url(#grid)" opacity=".4" /><ellipse cx="250" cy="277" rx="172" ry="25" fill="#a9c751" opacity=".4" />
    <path d="M54 215l66-29 40 21v75l-66 29-40-22z" fill="#254c3b" /><path d="M54 215l40 22 66-30-40-21z" fill="#476d52" /><path d="M94 237v74l66-29v-75z" fill="#183c2e" />
    <path d="M330 146l66-29 40 21v75l-66 29-40-22z" fill="#254c3b" /><path d="M330 146l40 22 66-30-40-21z" fill="#476d52" /><path d="M370 168v74l66-29v-75z" fill="#183c2e" />
    <path d="M93 200l25-27 24 5 24-26 24 5 24-26 24 5 24-26 24 5 24-26 40 21 24-4-24 26-24-5-24 26-24-5-24 26-24-5-24 26-24-5-24 26-24-5z" fill="#fffef1" stroke="#254c3b" strokeWidth="2" strokeLinejoin="round" />
    {[0, 1, 2, 3, 4].map(n => <path key={n} d={`M${118+n*48} ${173-n*21}l40 21m-16-16l40 21`} fill="none" stroke="#a1b28b" strokeWidth="1.4" />)}
    <g stroke="#254c3b" strokeWidth="2" fill="#fffef1"><ellipse cx="242" cy="113" rx="23" ry="11" /><path d="M219 98v15c0 14 46 14 46 0V98" /><ellipse cx="242" cy="98" rx="23" ry="11" /><path d="M219 83v15c0 14 46 14 46 0V83" /><ellipse cx="242" cy="83" rx="23" ry="11" /></g>
    <path d="M130 88v-20h35m188 175v20h-35" fill="none" stroke="#254c3b" strokeWidth="1.5" /><circle cx="373" cy="70" r="27" stroke="#254c3b" strokeWidth="1.5" fill="none" /><path d="M360 70h26m-13-13v26" stroke="#254c3b" strokeWidth="1.5" />
    <text x="80" y="55" fill="#254c3b" fontSize="10" fontFamily="monospace" letterSpacing="2">STRUCTURE / 001</text><text x="280" y="308" fill="#254c3b" fontSize="10" fontFamily="monospace" letterSpacing="1.5">WHAT IF WE FOLD IT?</text>
  </svg>;
}

export function EducationApp() {
  const [view, setView] = useState<View>('dashboard');
  const [stageId, setStageId] = useState<StageId>('builders');
  const [attempts, setAttempts] = useState<Partial<Record<StageId, Attempt>>>({ builders: newAttempt('builders') });
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const headingRef = useRef<HTMLHeadingElement>(null);
  const labRef = useRef<HTMLHeadingElement>(null);
  const errorRef = useRef<HTMLParagraphElement>(null);
  const resetDialog = useRef<HTMLDialogElement>(null);
  const initial = useRef(true);
  const stage = stages.find(s => s.id === stageId)!;
  const attempt = attempts[stageId] ?? newAttempt(stageId);
  const allAttempts = Object.values(attempts) as Attempt[];
  const started = allAttempts.filter(a => a.completedSteps.length > 0);
  const completed = allAttempts.filter(isComplete);
  const title = { dashboard: 'A world of possibilities.', lab: 'Inventors Lab', skills: 'Your thinking, made visible.', portfolio: 'A collection of discoveries.', guardian: 'See the thinking behind the learning.' }[view];
  useEffect(() => { if (initial.current) initial.current = false; else headingRef.current?.focus(); }, [view]);
  useEffect(() => { if (error) errorRef.current?.focus(); }, [error]);
  function go(next: View) { setError(null); setMessage(''); setView(next); }
  function changeStage(next: StageId) {
    setStageId(next); setAttempts(prev => ({ ...prev, [next]: prev[next] ?? newAttempt(next) })); setError(null); setMessage('');
  }
  function write(key: AnswerKey, value: string) { setAttempts(prev => ({ ...prev, [stageId]: updateAnswer(prev[stageId] ?? newAttempt(stageId), key, value) })); setError(null); }
  function nextStep() {
    const issue = validateStep(attempt);
    if (issue) { setError(issue); return; }
    const next = advance(attempt);
    setAttempts(prev => ({ ...prev, [stageId]: next })); setError(null);
    if (isComplete(next)) setMessage('Mission complete. Your demonstration evidence is ready in the Portfolio.');
    requestAnimationFrame(() => labRef.current?.focus());
  }
  function moveStep(step: number) { setAttempts(prev => ({ ...prev, [stageId]: { ...attempt, step } })); setError(null); requestAnimationFrame(() => labRef.current?.focus()); }
  function fillSample() {
    const keys: AnswerKey[][] = [['notice'], ['goal', 'constraint'], ['idea1', 'idea2', 'idea3'], ['hypothesis'], ['flat', 'folded', 'observation'], ['reflection'], ['transfer']];
    let next = attempt;
    for (const key of keys[attempt.step]) next = updateAnswer(next, key, sampleAnswers[key]);
    setAttempts(prev => ({ ...prev, [stageId]: next })); setError(null); setMessage('Fictional example added. These are sample notes, not measured results.');
  }
  function download() {
    const blob = new Blob([JSON.stringify(exportPortfolio(allAttempts), null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob); const link = document.createElement('a'); link.href = url; link.download = 'EducationOS-demo-portfolio-v0.5.0.json'; link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000); setMessage('Demo portfolio exported to this device.');
  }
  function reset() { setAttempts({ [stageId]: newAttempt(stageId) }); setError(null); setMessage('All demonstration notes cleared.'); resetDialog.current?.close(); }
  function textField(key: AnswerKey, label: string, placeholder: string, hint?: string) {
    return <Field key={key} htmlFor={key} label={label} hint={hint}><textarea id={key} className="field-textarea" rows={3} value={attempt.answers[key]} maxLength={1000} placeholder={placeholder} onChange={e => write(key, e.target.value)} aria-describedby={hint ? `${key}-hint` : undefined} aria-invalid={Boolean(error)} /></Field>;
  }

  return <div className={`app-shell ${view === 'guardian' ? 'guardian-view' : ''}`}>
    <a href="#main" className="skip-link">Skip to content</a>
    <aside className="sidebar" aria-label="Workspace navigation">
      <button className="brand" onClick={() => go('dashboard')} aria-label="EducationOS dashboard"><span className="brand-mark"><Box aria-hidden="true" size={24} /></span><span>Education<span className="brand-os">OS</span></span></button>
      <div className="nav-label">Your workspace</div>
      <nav aria-label="Main navigation">{navigation.map(({ id, label, icon: Icon }) => <button key={id} className={`nav-item ${view === id ? 'active' : ''}`} onClick={() => go(id)} aria-current={view === id ? 'page' : undefined}><Icon aria-hidden="true" size={20} /><span>{label}</span>{id === 'lab' && <span className="nav-dot" />}</button>)}</nav>
      <div className="sidebar-bottom"><Card className="side-note"><Compass size={22} aria-hidden="true" /><p>Small questions.<br /><strong>Extraordinary possibilities.</strong></p><span className="muted">A space to think differently.</span></Card><p className="sidebar-version">EducationOS / v0.5.0</p></div>
    </aside>
    <div className="main-column">
      <header className="topbar"><div className="topbar-label"><span>Workspace</span><ChevronRight size={14} aria-hidden="true" /><strong>{navigation.find(n => n.id === view)?.label}</strong></div><div className="heading-actions"><span className="demo-tag"><span />Synthetic demo</span><Button variant="ghost" onClick={() => resetDialog.current?.showModal()} aria-label="Reset demo"><RotateCcw size={16} aria-hidden="true" /><span>Reset demo</span></Button><span className="demo-avatar" aria-label="Fictional learner profile">D</span></div></header>
      <main id="main" className="workspace">
        <div className="scope-banner"><LockKeyhole size={15} aria-hidden="true" /><span>Demonstration only. Use fictional notes. Nothing is saved after refresh.</span></div>
        <div className="page-heading"><div><p className="eyebrow">{view === 'guardian' ? 'A considered foundation' : view === 'dashboard' ? 'Stay curious. Keep creating.' : 'Discover by doing'}</p><h1 className="page-title" tabIndex={-1} ref={headingRef}>{title}</h1><p className="page-intro">{view === 'dashboard' ? 'Follow your curiosity. Make something that makes you think.' : view === 'guardian' ? 'An honest view of evidence, privacy, and what comes next.' : view === 'lab' ? stage.prompt : view === 'skills' ? 'Evidence of practice, without invented mastery scores.' : 'Your ideas, comparisons, and reflections belong together.'}</p></div>{view !== 'guardian' && <Field htmlFor="learning-stage" label="Learning stage"><select id="learning-stage" className="field-select" value={stageId} onChange={e => changeStage(e.target.value as StageId)}>{stages.map(s => <option key={s.id} value={s.id}>{s.name} · Ages {s.ages}</option>)}</select></Field>}</div>

        {view === 'dashboard' && <>
          <div className="dashboard-grid">
            <section className="hero-card" aria-labelledby="mission-hero"><div className="hero-copy"><p className="hero-label"><FlaskConical size={16} aria-hidden="true" />Inventors Lab / Mission 01</p><h2 id="mission-hero" className="hero-title">Strong bridge.<br />Less material.</h2><p className="hero-description">One sheet of paper. A curious mind. How many possibilities can you discover?</p><div className="hero-meta"><span><Layers3 size={15} aria-hidden="true" />7 thinking steps</span><span><Beaker size={15} aria-hidden="true" />Hands-on experiment</span></div><div className="hero-actions"><Button onClick={() => go('lab')}>{isComplete(attempt) ? 'Revisit your mission' : attempt.completedSteps.length ? 'Continue mission' : 'Start your mission'}<ArrowUpRight size={18} aria-hidden="true" /></Button><span>Version 1 · {stage.name}</span></div></div><div className="hero-art"><BridgeIllustration /></div></section>
            <div className="stats-grid"><Card className="stat-card"><span className="stat-label">This mission</span><div className="stat-value">{attempt.completedSteps.length}<span> / 7</span></div><Progress value={progress(attempt)} label="Mission progress" /><p className="muted">Thinking steps completed</p></Card><Card className="stat-card"><span className="stat-label">Your collection</span><div className="stat-value">{completed.length.toString().padStart(2, '0')}</div><p className="muted">Completed demo {completed.length === 1 ? 'mission' : 'missions'}</p><button className="text-link" onClick={() => go('portfolio')}>Open portfolio<ArrowUpRight size={16} aria-hidden="true" /></button></Card></div>
          </div>
          <section aria-labelledby="worlds-heading"><div className="section-heading"><div><p className="eyebrow">Room to grow</p><h2 id="worlds-heading">Find your world.</h2></div><span className="muted">Five stages. A lifetime of curiosity.</span></div><div className="worlds-grid">{stages.map((s, i) => { const Icon = worldIcons[i]; return <button className={`world-card ${s.id === stageId ? 'selected' : ''}`} key={s.id} onClick={() => changeStage(s.id)} aria-pressed={s.id === stageId}><span className="world-icon"><Icon size={24} strokeWidth={1.6} aria-hidden="true" /></span><span className="world-name">{s.world}</span><span className="world-age">{s.name} · {s.ages}</span><span className="world-description">{s.verb}</span>{s.id === stageId && <span className="world-selected"><Check size={13} aria-hidden="true" />Your stage</span>}</button>; })}</div></section>
          <div className="lower-grid"><section><div className="section-heading"><h2>Your next discovery</h2><Badge>Available now</Badge></div><Card className="mission-list"><div className="mission-row"><span className="mission-number">01</span><div className="mission-detail"><h3>The strong & light bridge</h3><p>Resolve a contradiction through structure.</p></div><Button variant="ghost" onClick={() => go('lab')} aria-label="Open strong and light bridge mission"><ArrowUpRight size={20} aria-hidden="true" /></Button></div><div className="mission-row"><span className="mission-number"><LockKeyhole size={18} aria-hidden="true" /></span><div className="mission-detail"><h3>More worlds are taking shape</h3><p>New missions need curriculum and safety review.</p></div></div></Card></section><section><div className="section-heading"><h2>A different way to think</h2><Lightbulb size={20} aria-hidden="true" /></div><Card className="notebook"><p className="eyebrow">The inventor’s question</p><h3>What if we didn’t have to choose?</h3><p>TRIZ starts with a contradiction. Instead of accepting a trade-off, explore a new possibility.</p><button className="text-link" onClick={() => go('lab')}>Try it in the lab<ArrowRight size={16} aria-hidden="true" /></button></Card></section></div>
        </>}

        {view === 'lab' && <>
          <div className="lab-layout"><nav className="step-nav" aria-label="Mission steps"><p className="eyebrow">The strong & light bridge</p><Progress value={progress(attempt)} label="Completed mission steps" />{steps.map((label, i) => <button key={label} className={`step-item ${attempt.step === i ? 'current' : ''} ${attempt.completedSteps.includes(i) ? 'complete' : ''}`} aria-current={attempt.step === i ? 'step' : undefined} disabled={i > Math.max(-1, ...attempt.completedSteps) + 1} onClick={() => moveStep(i)}><span className="step-number">{attempt.completedSteps.includes(i) ? <Check size={15} aria-hidden="true" /> : String(i + 1).padStart(2, '0')}</span><span>{label}</span></button>)}<div className="lab-support"><ShieldCheck size={18} aria-hidden="true" /><p>Adult supervision for paper setup and testing. Use small, identical counters on a low, stable surface. Stop if anything feels unsafe.</p></div></nav>
            <Card className="lab-card"><div className="step-kicker"><Badge>Step {attempt.step + 1} of 7</Badge><span className="muted">TRIZ / {stage.name}</span></div><h2 className="lab-title" tabIndex={-1} ref={labRef}>{steps[attempt.step]}{attempt.step === 0 ? ' the possibility.' : '.'}</h2><p className="lab-description">{stepDescriptions[attempt.step]}</p><p className="age-support">{stage.support}</p>
              {isComplete(attempt) && <div className="completion-note" role="status"><Check size={20} aria-hidden="true" /><div><strong>Mission complete. Keep the curiosity.</strong><p>Your notes are ready to review or export. Editing a step reopens it and the steps after it.</p><Button variant="secondary" onClick={() => go('portfolio')}>Review your portfolio<ArrowRight size={16} aria-hidden="true" /></Button></div></div>}
              <div className="form-grid">
                {attempt.step === 0 && <><div className="question-card"><p className="eyebrow">Your challenge</p><h3>{stage.question}</h3><p>Materials: two equal sheets of paper, two stable supports, and identical lightweight counters. Draw first if that helps. You can also use the fictional example without doing a physical experiment.</p></div>{textField('notice', 'What do you notice?', 'Describe how a flat sheet behaves across a gap.', 'Use a fictional observation. Do not include names or personal information.')}</>}
                {attempt.step === 1 && <>{textField('goal', 'What should improve?', 'I want the bridge to...')}{textField('constraint', 'What must stay the same?', 'But I need to keep...')}<div className="question-card"><p><strong>A TRIZ contradiction</strong></p><p>“Stronger” often means “more material.” What if changing the shape could help us keep both?</p></div></>}
                {attempt.step === 2 && <><div className="idea-grid">{textField('idea1', 'Idea 01 — change the shape', 'What could you fold or curve?')}{textField('idea2', 'Idea 02 — rethink the parts', 'What could you roll or rearrange?')}{textField('idea3', 'Idea 03 — try another direction', 'What is a different possibility?')}</div><p className="muted">Think of distinct approaches. There is no automatic score for creativity.</p></>}
                {attempt.step === 3 && textField('hypothesis', 'Your prediction and reason', 'If I change..., then..., because...')}
                {attempt.step === 4 && <><div className="question-card"><strong>Make it a fair comparison.</strong><p>Use equal paper, the same gap, the same counters, and the same stopping rule. Add one counter at a time. Record the largest count held before the bridge bends to the surface. Counts are manual observations, not sensor measurements.</p></div><div className="comparison-grid">{(['flat', 'folded'] as const).map(key => <Card key={key} className="experiment-card"><p className="eyebrow">Prototype {key === 'flat' ? 'A' : 'B'}</p><h3>{key === 'flat' ? 'Flat paper' : 'Accordion fold'}</h3><Field htmlFor={key} label="Counters held" hint="Whole number, 0–50"><input id={key} className="field-input" type="number" min="0" max="50" step="1" inputMode="numeric" value={attempt.answers[key]} onChange={e => write(key, e.target.value)} aria-describedby={`${key}-hint`} /></Field></Card>)}</div>{textField('observation', 'What happened in your comparison?', 'Describe the result and anything that could have affected it.')}</>}
                {attempt.step === 5 && <>{attempt.answers.flat !== '' && <div className="question-card"><p className="eyebrow">Your recorded comparison</p><p>Flat paper: <strong>{attempt.answers.flat}</strong> counters. Accordion fold: <strong>{attempt.answers.folded}</strong> counters.</p><p>A single comparison is a starting point. Repeated trials would help you check the pattern.</p></div>}{textField('reflection', 'What did you learn from the evidence?', 'Did the result match your prediction? What would you change?')}</>}
                {attempt.step === 6 && textField('transfer', 'Where else could you use this principle?', 'A new situation, the same idea: changing structure instead of adding material.')}
              </div>
              {error && <p className="validation-error" role="alert" tabIndex={-1} ref={errorRef}>{error}</p>}
              <div className="sample-action"><Button variant="ghost" onClick={fillSample}><Sparkles size={16} aria-hidden="true" />Use a fictional example</Button><span className="muted">Sample content. No AI service.</span></div>
              <footer className="lab-footer"><Button variant="secondary" onClick={() => moveStep(attempt.step - 1)} disabled={attempt.step === 0}><ArrowLeft size={16} aria-hidden="true" />Back</Button><Button onClick={nextStep}>{attempt.step === 6 ? 'Complete mission' : 'Save step & continue'}<ArrowRight size={16} aria-hidden="true" /></Button></footer>
            </Card></div>
        </>}

        {view === 'skills' && <><div className="skill-grid">{[
          { title: 'See a contradiction', description: 'Name what should improve and what must be preserved.', at: 1, icon: Compass },
          { title: 'Think in possibilities', description: 'Generate distinct ideas before choosing a direction.', at: 2, icon: Lightbulb },
          { title: 'Reason with evidence', description: 'Compare prototypes and reflect on an observation.', at: 5, icon: Beaker },
          { title: 'Transfer an idea', description: 'Apply a principle to a different situation.', at: 6, icon: ArrowUpRight }
        ].map(({ title, description, at, icon: Icon }) => { const count = allAttempts.filter(a => a.completedSteps.includes(at)).length; return <Card className="skill-card" key={title}><span className="world-icon"><Icon size={24} aria-hidden="true" /></span><h2>{title}</h2><p>{description}</p><Badge>{count ? `${count} demo ${count === 1 ? 'example' : 'examples'}` : 'Ready to explore'}</Badge><p className="muted">{count ? 'Self-recorded practice. Not an assessed level.' : 'Complete the related lab step to collect evidence.'}</p></Card>; })}</div><Card className="notebook"><h2>Practice leaves a trail.</h2><p>This vault links thinking habits to your actual lab notes. It does not infer intelligence, mastery, diagnosis, or readiness from a completed form.</p><Button onClick={() => go('lab')}>Return to your mission<ArrowRight size={16} aria-hidden="true" /></Button></Card></>}

        {view === 'portfolio' && <><div className="portfolio-toolbar"><p className="muted">{started.length} demo {started.length === 1 ? 'mission' : 'missions'} with evidence · Private to this open tab</p><Button onClick={download} disabled={!started.length}><ArrowDownToLine size={16} aria-hidden="true" />Export demo JSON</Button></div>{!started.length ? <EmptyState title="Every discovery starts somewhere." description="Complete a lab step to collect your first piece of demonstration evidence."><Button onClick={() => go('lab')}>Explore the Inventors Lab<ArrowRight size={16} aria-hidden="true" /></Button></EmptyState> : <div className="portfolio-grid">{started.map(a => <Card className="evidence-card" key={a.stage}><div className="section-heading"><Badge>{isComplete(a) ? 'Complete' : 'In progress'}</Badge><span className="muted">Mission v{a.missionVersion}</span></div><h2>The strong & light bridge</h2><p className="muted">{stages.find(s => s.id === a.stage)?.name} · {a.completedSteps.length} / 7 steps</p><dl className="evidence-list">{(['notice', 'goal', 'constraint', 'idea1', 'idea2', 'idea3', 'hypothesis', 'flat', 'folded', 'observation', 'reflection', 'transfer'] as AnswerKey[]).filter(k => a.answers[k]).map(k => <div key={k}><dt>{{ notice: 'Notice', goal: 'Goal', constraint: 'Constraint', idea1: 'Idea 01', idea2: 'Idea 02', idea3: 'Idea 03', hypothesis: 'Prediction', flat: 'Flat paper count', folded: 'Folded paper count', observation: 'Observation', reflection: 'Reflection', transfer: 'Transfer' }[k]}</dt><dd>{a.answers[k]}</dd></div>)}</dl><p className="muted">Source: manual demo notes. Unverified, with no mastery score.</p><Button variant="secondary" onClick={() => { changeStage(a.stage); go('lab'); }}>Revisit mission<ArrowUpRight size={16} aria-hidden="true" /></Button></Card>)}</div>}</>}

        {view === 'guardian' && <><section className="adult-hero"><div><p className="eyebrow">Learning, with perspective</p><h2>More than a finished bridge.<br />A window into how ideas grow.</h2><p>EducationOS is being built to help adults understand the questions, experiments, and reflections behind a learner’s work.</p></div><span className="adult-seal"><ShieldCheck size={64} strokeWidth={1} aria-hidden="true" /></span></section><div className="adult-grid"><Card><p className="eyebrow">Demonstration evidence</p><h2>What this session shows</h2><div className="adult-metric"><strong>{completed.length}</strong><span>completed demo {completed.length === 1 ? 'mission' : 'missions'}</span></div><p>{started.length ? 'Review the recorded ideas, prototype counts, and reflections in the demo portfolio.' : 'No lab evidence yet. Try a fictional mission to see what a future evidence review could include.'}</p><Button variant="secondary" onClick={() => go('portfolio')}>View demonstration portfolio<ArrowUpRight size={16} aria-hidden="true" /></Button></Card><Card><p className="eyebrow">A deliberate boundary</p><h2>Privacy starts with less.</h2><ul className="privacy-list"><li><Check size={16} aria-hidden="true" />No accounts, names, birthdates, photos, or location fields.</li><li><Check size={16} aria-hidden="true" />No advertising, chat, analytics, or external AI requests.</li><li><Check size={16} aria-hidden="true" />Demo notes remain in memory until refresh or reset.</li><li><Check size={16} aria-hidden="true" />Export happens only when you choose to download.</li></ul></Card></div><Card className="readiness-card"><div><Badge>Development preview</Badge><h2>Real enrollment is closed.</h2><p>This release is a foundation for review. Adult identity verification, consent workflows, persistence integration, safeguarding review, and independent security and accessibility assessment are still required before real children use it.</p><p>The Guardian preview uses the same fictional session. It is a visual demonstration and provides no adult authorization.</p></div><LockKeyhole size={32} aria-hidden="true" /></Card></>}
        <p className="workspace-footer">Designed for curiosity. Built with care. <span>EducationOS · Synthetic demonstration</span></p>
      </main>
      <div className="toast" role="status" aria-live="polite" aria-atomic="true">{message}</div>
    </div>
    <nav className="mobile-nav" aria-label="Mobile navigation">{navigation.map(({ id, label, icon: Icon }) => <button key={id} onClick={() => go(id)} className={view === id ? 'active' : ''} aria-label={label} aria-current={view === id ? 'page' : undefined}><Icon size={20} aria-hidden="true" /><span>{id === 'guardian' ? 'Guardian' : id === 'dashboard' ? 'Home' : id === 'lab' ? 'Lab' : id === 'skills' ? 'Skills' : 'Portfolio'}</span></button>)}</nav>
    <dialog ref={resetDialog} className="reset-dialog" aria-labelledby="reset-title"><div className="section-heading"><h2 id="reset-title">Clear this demonstration?</h2><Button variant="ghost" onClick={() => resetDialog.current?.close()} aria-label="Close reset dialog"><X size={20} aria-hidden="true" /></Button></div><p>This removes all fictional lab notes in this tab. Download your demo portfolio first if you want to keep a copy.</p><div className="heading-actions"><Button variant="secondary" onClick={() => resetDialog.current?.close()}>Keep exploring</Button><Button onClick={reset}>Clear all demo notes</Button></div></dialog>
  </div>;
}
