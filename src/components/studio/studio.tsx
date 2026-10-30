'use client';

import Link from 'next/link';
import { useEffect, useState, type FormEvent } from 'react';
import { ArrowRight, BookOpen, Check, ChevronDown, ChevronRight, ClipboardCheck, FileClock, Layers3, LockKeyhole, LogOut, Plus, ShieldCheck } from 'lucide-react';

type Role = 'educator' | 'reviewer' | 'guardian';
type AdultSession = { adult: { id: string; role: Role; adultAttested: boolean; identityVerified: boolean }; csrfToken: string };
const bands = ['5-6', '7-9', '10-12', '13-15', '16-17'] as const;
const stepNames = ['Notice', 'Contradiction', 'Imagine', 'Hypothesis', 'Experiment', 'Reflect', 'Transfer'];
type Stage = { ageBand: string; challenge: string; steps: string[]; safetyNote: string };
type Content = { title: string; summary: string; trizPrinciple: string; stages: Stage[] };
type Mission = Content & { id: string; status: 'draft' | 'review' | 'published'; version: number; authorId: string; moderationFlags: string[]; createdAt: string; updatedAt: string };
type History = { versions: { version: number; status: string; content: Content; createdAt: string }[]; events: { id: string; action: string; version: number; note: string; createdAt: string }[] };
type Consent = { id: string; purpose: string; policyVersion: string; status: 'pending_verification' | 'revoked'; acknowledgedAt: string; revokedAt: string | null; childProfilesAvailable: false };

const blankContent = (): Content => ({ title: '', summary: '', trizPrinciple: '', stages: bands.map(ageBand => ({ ageBand, challenge: '', steps: stepNames.map(() => ''), safetyNote: '' })) });
function contentOf(mission: Mission): Content { return { title: mission.title, summary: mission.summary, trizPrinciple: mission.trizPrinciple, stages: mission.stages }; }
const date = (value: string) => new Intl.DateTimeFormat('en', { dateStyle: 'medium' }).format(new Date(value));

class WorkspaceError extends Error { constructor(public status: number, message: string) { super(message); } }
async function api<T>(path: string, method = 'GET', data?: unknown, csrf?: string): Promise<T> {
  const response = await fetch(`/api/adult-studio/${path}`, {
    method, credentials: 'same-origin', cache: 'no-store',
    headers: { 'Content-Type': 'application/json', ...(csrf ? { 'X-CSRF-Token': csrf } : {}) },
    ...(method !== 'GET' ? { body: JSON.stringify(data ?? {}) } : {}),
  });
  if (!response.ok) {
    const messages: Record<number, string> = {
      401: 'Sign in with a provisioned adult account to continue.',
      403: 'This account cannot perform that action. Check your role or sign in again.',
      409: 'This mission changed. Reopen it from the list before continuing.',
      413: 'The combined mission is too long. Shorten the stage prompts and try again.',
      422: 'Check the required fields. Use plain text without links, contact details, or markup.',
      429: 'Too many requests. Wait a moment before trying again.',
      503: 'Adult workspace is unavailable. Check the local API or staging connection.',
    };
    throw new WorkspaceError(response.status, messages[response.status] ?? 'The request could not be completed. Try again.');
  }
  return response.json() as Promise<T>;
}

export function Studio() {
  const [session, setSession] = useState<AdultSession | null>(null);
  const [checking, setChecking] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [missions, setMissions] = useState<Mission[]>([]);
  const [current, setCurrent] = useState<Mission | null>(null);
  const [draft, setDraft] = useState<Content>(blankContent);
  const [editing, setEditing] = useState(false);
  const [history, setHistory] = useState<History | null>(null);
  const [consents, setConsents] = useState<Consent[]>([]);
  const [acknowledged, setAcknowledged] = useState(false);
  const [reviewNote, setReviewNote] = useState('');
  const [safetyReviewed, setSafetyReviewed] = useState(false);

  useEffect(() => {
    let alive = true;
    async function initialize() {
      try {
        const account = await api<AdultSession>('adults/session');
        const list = account.adult.role === 'guardian'
          ? await api<{ items: Consent[] }>('adults/consents')
          : await api<{ items: Mission[] }>('studio/missions');
        if (!alive) return;
        setSession(account);
        if (account.adult.role === 'guardian') setConsents(list.items as Consent[]);
        else setMissions(list.items as Mission[]);
      } catch (failure) {
        if (alive && (!(failure instanceof WorkspaceError) || failure.status !== 401)) setError(failure instanceof Error ? failure.message : 'Workspace is unavailable.');
      } finally { if (alive) setChecking(false); }
    }
    void initialize();
    return () => { alive = false; };
  }, []);

  async function run(action: () => Promise<void>) {
    setBusy(true); setError(''); setNotice('');
    try { await action(); }
    catch (failure) { setError(failure instanceof Error ? failure.message : 'The request could not be completed.'); }
    finally { setBusy(false); }
  }

  async function refreshMissions() { setMissions((await api<{ items: Mission[] }>('studio/missions')).items); }
  async function selectMission(mission: Mission) {
    await run(async () => {
      const latest = await api<Mission>(`studio/missions/${mission.id}`);
      setCurrent(latest); setDraft(contentOf(latest)); setEditing(true); setReviewNote(''); setSafetyReviewed(false);
      setHistory(await api<History>(`studio/missions/${mission.id}/history`));
    });
  }
  function updateStage(index: number, patch: Partial<Stage>) { setDraft(previous => ({ ...previous, stages: previous.stages.map((stage, i) => i === index ? { ...stage, ...patch } : stage) })); }
  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await run(async () => {
      const saved = await api<Mission>(current ? `studio/missions/${current.id}` : 'studio/missions', current ? 'PATCH' : 'POST', { ...draft, ...(current ? { expectedVersion: current.version } : {}) }, session?.csrfToken);
      setCurrent(saved); setDraft(contentOf(saved)); await refreshMissions();
      setHistory(await api<History>(`studio/missions/${saved.id}/history`));
      setNotice(`Draft saved as version ${saved.version}.`);
    });
  }
  async function transition(action: 'submit' | 'approve' | 'reject') {
    if (!current) return;
    await run(async () => {
      const saved = await api<Mission>(`studio/missions/${current.id}/${action === 'submit' ? 'submit' : 'review'}`, 'POST', { expectedVersion: current.version, ...(action === 'submit' ? {} : { decision: action, note: reviewNote, safetyReviewed }) }, session?.csrfToken);
      setCurrent(saved); setDraft(contentOf(saved)); await refreshMissions();
      setHistory(await api<History>(`studio/missions/${saved.id}/history`));
      setReviewNote(''); setSafetyReviewed(false); setNotice(action === 'approve' ? 'This reviewed version is published to the curriculum catalog.' : action === 'reject' ? 'Returned to the educator for revision.' : 'Submitted for an independent review.');
    });
  }

  const role = session?.adult.role;
  const canEdit = role === 'educator' && (!current || current.authorId === session?.adult.id) && current?.status !== 'review';
  const unsavedChanges = current !== null && JSON.stringify(draft) !== JSON.stringify(contentOf(current));
  return <div className="studio-root">
    <header className="studio-topbar">
      <Link href="/" className="studio-brand" aria-label="EducationOS home">
        <span><Layers3 aria-hidden="true" size={19} /></span>Education<span className="studio-os">OS</span>
      </Link>
      <div className="studio-top-right">
        <span className="studio-release">v0.6.0</span>
        {session && <button className="studio-quiet" type="button" disabled={busy} onClick={() => void run(async () => {
          await api('adults/logout', 'POST', {}, session.csrfToken);
          setSession(null); setMissions([]); setConsents([]); setCurrent(null);
          setDraft(blankContent()); setEditing(false); setHistory(null); setNotice('Signed out.');
        })}><LogOut size={16} aria-hidden="true" />Sign out</button>}
      </div>
    </header>
    <main id="main-content" className="studio-main">
      <div className="studio-intro">
        <div>
          <p className="studio-eyebrow">Curriculum studio</p>
          <h1>Ideas become learning</h1>
          <p className="studio-lead">Draft, review, and publish TRIZ missions for five age stages</p>
        </div>
        <div className="studio-access-summary">
          <LockKeyhole size={18} aria-hidden="true" />
          <div><strong>Adult-only development preview</strong><p>Child profiles and unrestricted AI are unavailable</p></div>
        </div>
      </div>
      <details className="studio-boundary">
        <summary>
          <ShieldCheck size={18} aria-hidden="true" />
          <span>Safety & access</span>
          <span className="studio-boundary-context">Adult identity verification pending</span>
          <ChevronDown className="studio-disclosure-arrow" size={16} aria-hidden="true" />
        </summary>
        <div className="studio-boundary-content">
          <p>Adult accounts are attested, not identity verified. Child profiles and unrestricted AI remain unavailable. Published content still requires a qualified safeguarding review before real learner use.</p>
          <p>Guardian acknowledgments are a consent workflow scaffold. They do not establish verified parental consent or enable child services. The Inventors Lab and evidence portfolio remain synthetic demonstrations.</p>
          <Link href="/safety">Read the safety boundaries<ArrowRight size={14} aria-hidden="true" /></Link>
        </div>
      </details>
      {error && <div className="studio-error" role="alert">{error}</div>}
      <div className="studio-live" role="status" aria-live="polite">{checking ? 'Checking adult session…' : notice}</div>
      {!session && !checking && <section className="studio-login-grid" aria-labelledby="studio-sign-in-title">
        <form className="studio-panel studio-login" onSubmit={event => {
          event.preventDefault(); const form = event.currentTarget; const data = new FormData(form);
          void run(async () => {
            const account = await api<AdultSession>('adults/login', 'POST', { email: data.get('email'), password: data.get('password') });
            form.reset(); setSession(account);
            if (account.adult.role === 'guardian') setConsents((await api<{ items: Consent[] }>('adults/consents')).items);
            else await refreshMissions();
            setNotice('Adult session started.');
          });
        }}>
          <div className="studio-form-heading"><span><LockKeyhole size={20} aria-hidden="true" /></span><h2 id="studio-sign-in-title">Adult sign in</h2></div>
          <p>Use an account provisioned by the staging operator. Roles are assigned on the server.</p>
          <label htmlFor="adult-email">Email address</label>
          <input id="adult-email" name="email" type="email" autoComplete="username" required maxLength={254} />
          <label htmlFor="adult-password">Password</label>
          <input id="adult-password" name="password" type="password" autoComplete="current-password" required maxLength={128} />
          <button className="studio-primary" type="submit" disabled={busy}>{busy ? 'Signing in…' : 'Open workspace'}<ArrowRight aria-hidden="true" size={17} /></button>
          <p className="studio-small">Invitation only. No public sign up or learner account is available in this milestone.</p>
        </form>
        <div className="studio-login-copy">
          <h2>A clear path from idea to lesson</h2>
          <p>Educators shape the challenge. Independent reviewers check each version. Guardians can explore consent without creating a child profile.</p>
          <ol className="studio-process" aria-label="How publication works">
            <li><span className="studio-process-icon"><BookOpen size={20} aria-hidden="true" /></span><div><strong>Draft with intention</strong><p>One TRIZ principle, five age stages, seven steps</p></div><span className="studio-process-number" aria-hidden="true">01</span></li>
            <li><span className="studio-process-icon"><ClipboardCheck size={20} aria-hidden="true" /></span><div><strong>Review independently</strong><p>Check suitability and record a safety decision</p></div><span className="studio-process-number" aria-hidden="true">02</span></li>
            <li><span className="studio-process-icon"><FileClock size={20} aria-hidden="true" /></span><div><strong>Publish with a record</strong><p>Keep version snapshots and a clear audit trail</p></div><span className="studio-process-number" aria-hidden="true">03</span></li>
          </ol>
        </div>
      </section>}
      {session && <div className="studio-session-strip"><span><span className="studio-dot" />Signed in as <strong>{role}</strong></span><span>Adult attestation recorded · Identity verification pending</span></div>}
      {session && role === 'guardian' && <section className="studio-guardian-grid" aria-labelledby="consent-title"><div className="studio-panel"><p className="studio-eyebrow">Guardian workspace</p><h2 id="consent-title">Consent, with clear boundaries</h2><p>This workflow records an adult acknowledgment for review. It does not establish verified parental consent or enable child services. Do not enter a child’s name, birth date, or other personal information.</p><form onSubmit={event => { event.preventDefault(); void run(async () => { await api('adults/consents', 'POST', { purpose: 'child_learning', policyVersion: 'scaffold-v1', acknowledged: true }, session.csrfToken); setConsents((await api<{ items: Consent[] }>('adults/consents')).items); setAcknowledged(false); setNotice('Acknowledgment recorded. Verification remains pending.'); }); }}><label className="studio-checkbox"><input type="checkbox" checked={acknowledged} onChange={event => setAcknowledged(event.target.checked)} required /><span>I am an adult guardian and understand this is a consent workflow scaffold. Child services remain closed pending legal and security verification.</span></label><p className="studio-small">Purpose: child learning · Policy: scaffold-v1</p><button className="studio-primary" disabled={busy || !acknowledged || consents.some(item => item.status === 'pending_verification')} type="submit">Record acknowledgment<Check size={17} aria-hidden="true" /></button></form></div><div className="studio-panel"><h2>Consent record</h2>{consents.length === 0 && <p>No acknowledgment has been recorded.</p>}{consents.map(consent => <article className="studio-consent" key={consent.id}><span className="studio-badge">{consent.status === 'revoked' ? 'Revoked' : 'Pending verification'}</span><p>Child learning · {consent.policyVersion}<br />Recorded {date(consent.acknowledgedAt)}</p>{consent.status !== 'revoked' && <button className="studio-secondary" disabled={busy} onClick={() => void run(async () => { await api(`adults/consents/${consent.id}`, 'DELETE', {}, session.csrfToken); setConsents((await api<{ items: Consent[] }>('adults/consents')).items); setNotice('Acknowledgment revoked. Child services remain closed.'); })} type="button">Revoke acknowledgment</button>}</article>)}<div className="studio-locked"><LockKeyhole size={19} aria-hidden="true" /><div><strong>Child profiles unavailable</strong><p>Legal review, adult identity verification, and security validation are required before enrollment.</p></div></div></div></section>}
      {session && role !== 'guardian' && <div className="studio-workspace"><aside className="studio-library" aria-label="Mission library"><div className="studio-library-title"><h2>{role === 'reviewer' ? 'Review library' : 'Mission library'}</h2><span>{missions.length}</span></div>{role === 'educator' && <button className="studio-primary studio-new" disabled={busy} type="button" onClick={() => { setCurrent(null); setDraft(blankContent()); setEditing(true); setHistory(null); setError(''); setNotice('New draft ready. Complete all five age stages.'); }}><Plus size={17} aria-hidden="true" />New draft</button>}{missions.length === 0 && <p className="studio-empty">{role === 'reviewer' ? 'Submitted missions will appear here for review.' : 'Your first challenge begins with a draft.'}</p>}<ul className="studio-mission-list">{missions.map(mission => <li key={mission.id}><button type="button" disabled={busy} aria-current={current?.id === mission.id ? 'true' : undefined} onClick={() => void selectMission(mission)}><span className="studio-mission-top"><span className={`studio-badge studio-badge-${mission.status}`}>{mission.status === 'review' ? 'In review' : mission.status}</span><span>v{mission.version}</span></span><strong>{mission.title}</strong><span className="studio-mission-date">Updated {date(mission.updatedAt)}<ChevronRight size={16} aria-hidden="true" /></span></button></li>)}</ul></aside>
        <section className="studio-editor" aria-labelledby="editor-title">{!editing ? <div className="studio-empty-editor"><BookOpen size={36} strokeWidth={1.25} aria-hidden="true" /><p className="studio-eyebrow">A space for better questions</p><h2 id="editor-title">Make room for a new idea</h2><p>{role === 'educator' ? 'Create a draft or open an existing mission. Every age stage deserves its own challenge, guidance, and safety note.' : 'Open a submitted mission to inspect its age stages, moderation flags, and revision history.'}</p></div> : <>
          <div className="studio-editor-heading"><div><p className="studio-eyebrow">{current ? `Mission / Version ${current.version}` : 'New mission / Unsaved'}</p><h2 id="editor-title">{current?.title ?? 'Shape the next challenge'}</h2></div><span className={`studio-badge studio-badge-${current?.status ?? 'draft'}`}>{current?.status === 'review' ? 'In review' : current?.status ?? 'Draft'}</span></div>
          <ol className="studio-editor-trail" aria-label="Mission lifecycle">
            {([{ status: 'draft', label: 'Draft' }, { status: 'review', label: 'Review' }, { status: 'published', label: 'Published' }] as const).map((step, index) => <li key={step.status} aria-current={(current?.status ?? 'draft') === step.status ? 'step' : undefined}><span aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>{step.label}</li>)}
          </ol>
          {current?.status === 'published' && <p className="studio-callout">This version is published. Saving changes creates a new draft; the previously approved version remains in the catalog.</p>}
          {current?.status === 'review' && role === 'educator' && <p className="studio-callout">This revision is locked while an independent reviewer considers it.</p>}
          <form onSubmit={save}><fieldset disabled={!canEdit || busy} className="studio-fieldset"><legend className="sr-only">Mission content</legend><div className="studio-field"><label htmlFor="mission-title">Mission title</label><input id="mission-title" value={draft.title} onChange={event => setDraft({ ...draft, title: event.target.value })} required minLength={3} maxLength={120} /></div><div className="studio-field"><label htmlFor="mission-summary">Learning intention</label><textarea id="mission-summary" rows={3} value={draft.summary} onChange={event => setDraft({ ...draft, summary: event.target.value })} required minLength={10} maxLength={600} /></div><div className="studio-field"><label htmlFor="mission-principle">TRIZ principle</label><input id="mission-principle" value={draft.trizPrinciple} onChange={event => setDraft({ ...draft, trizPrinciple: event.target.value })} required minLength={3} maxLength={180} /><p className="studio-hint">Describe the inventive thinking principle in plain language</p></div>
            <div className="studio-stage-heading"><h3>Five stages, considered individually</h3><p>Use plain text, no links or contact details. Seven prompts follow the Inventors Lab sequence. Keep the complete mission concise.</p></div>{draft.stages.map((stage, index) => <details className="studio-stage" key={stage.ageBand} open={index === 0 ? true : undefined}><summary><span>Ages {stage.ageBand}</span><span className="studio-stage-count">{stage.steps.filter(Boolean).length} / 7 prompts</span></summary><div className="studio-stage-fields"><label htmlFor={`challenge-${index}`}>Challenge for ages {stage.ageBand}</label><textarea id={`challenge-${index}`} value={stage.challenge} onChange={event => updateStage(index, { challenge: event.target.value })} required minLength={10} maxLength={500} rows={2} />{stepNames.map((name, step) => <div className="studio-field" key={name}><label htmlFor={`stage-${index}-step-${step}`}><span className="studio-step-num">{String(step + 1).padStart(2, '0')}</span>{name} · ages {stage.ageBand}</label><textarea id={`stage-${index}-step-${step}`} value={stage.steps[step]} onChange={event => updateStage(index, { steps: stage.steps.map((value, position) => position === step ? event.target.value : value) })} required minLength={5} maxLength={220} rows={2} /></div>)}<label htmlFor={`safety-${index}`}>Safety and adult guidance · ages {stage.ageBand}</label><textarea id={`safety-${index}`} value={stage.safetyNote} onChange={event => updateStage(index, { safetyNote: event.target.value })} required minLength={10} maxLength={300} rows={2} /></div></details>)}
          </fieldset>{canEdit && <div className="studio-save-row"><p>Save a version before submitting it for review</p><button className="studio-primary" disabled={busy} type="submit">{busy ? 'Saving…' : current?.status === 'published' ? 'Save as new draft' : 'Save draft'}<Check size={17} aria-hidden="true" /></button></div>}</form>
          {current && <div className="studio-review-panel"><div><h3>Review & publication</h3><p>{current.moderationFlags.length ? 'This revision has moderation flags. It cannot be approved until the content is corrected and resubmitted.' : 'Automated checks found no listed flags. A human must still verify age suitability, materials, and safeguarding.'}</p>{current.moderationFlags.length > 0 && <ul className="studio-flags">{current.moderationFlags.map(flag => <li key={flag}>{flag}</li>)}</ul>}</div>{role === 'educator' && current.authorId === session.adult.id && current.status === 'draft' && <><button className="studio-primary" type="button" disabled={busy || unsavedChanges} onClick={() => void transition('submit')}>Submit saved version<ArrowRight size={17} aria-hidden="true" /></button>{unsavedChanges && <p className="studio-hint">Save your changes before submitting this mission.</p>}</>}{role === 'reviewer' && current.status === 'review' && <div className="studio-review-actions"><label htmlFor="review-note">Review decision note</label><textarea id="review-note" rows={3} minLength={10} maxLength={600} value={reviewNote} onChange={event => setReviewNote(event.target.value)} placeholder="Record your suitability and safety review" /><p className="studio-hint">At least 10 characters. Never include learner or personal information.</p><label className="studio-checkbox"><input type="checkbox" checked={safetyReviewed} onChange={event => setSafetyReviewed(event.target.checked)} /><span>I reviewed every age stage and safety guidance</span></label><div><button className="studio-secondary" type="button" disabled={busy || reviewNote.trim().length < 10} onClick={() => void transition('reject')}>Return for revision</button><button className="studio-primary" type="button" disabled={busy || !safetyReviewed || reviewNote.trim().length < 10 || current.moderationFlags.length > 0 || current.authorId === session.adult.id} onClick={() => void transition('approve')}>Approve & publish<Check size={17} aria-hidden="true" /></button></div></div>}</div>}
          {history && <details className="studio-history"><summary><FileClock size={19} aria-hidden="true" />Version history & audit trail<span>{history.versions.length} versions</span></summary><div><ol>{history.events.map(event => <li key={event.id}><strong>{event.action.replaceAll('_', ' ')}</strong><span>v{event.version} · {date(event.createdAt)}</span>{event.note && <p>{event.note}</p>}</li>)}</ol>{history.versions.map(version => <details className="studio-version" key={version.version}><summary>Version {version.version} · {version.status}</summary><h3>{version.content.title}</h3><p>{version.content.summary}</p><p><strong>TRIZ principle:</strong> {version.content.trizPrinciple}</p>{version.content.stages.map(stage => <div key={stage.ageBand}><strong>Ages {stage.ageBand}</strong><p>{stage.challenge}</p><ol>{stage.steps.map((step, index) => <li key={index}>{stepNames[index]}: {step}</li>)}</ol><p>{stage.safetyNote}</p></div>)}</details>)}</div></details>}
        </>}</section>
      </div>}
      <footer className="studio-footer"><span>Made for thoughtful learning</span><nav aria-label="Studio resources"><Link href="/demo/lab">Inventors Lab<ArrowRight size={14} aria-hidden="true" /></Link><Link href="/demo/portfolio">Evidence portfolio<ArrowRight size={14} aria-hidden="true" /></Link><Link href="/safety">Safety boundaries</Link></nav></footer>
    </main>
  </div>;
}
