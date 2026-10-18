"use client";

import Link from "next/link";
import { ArrowLeft, ArrowRight, Check, Clock3 } from "lucide-react";
import { getPortalLab, PORTAL_LABS } from "@/lib/labs/catalog";
import type { LabId } from "@/lib/labs/types";
import { usePortal } from "../portal-provider";
import { usePortalNavigation } from "../portal-shell";
import { LoopLoom } from "./loop-loom";
import { SameHalf } from "./same-half";
import { HiddenCubes } from "./hidden-cubes";
import "./labs.css";

export function LabWorkspace({ labId }: { labId: LabId }) {
  const { labState, ready, updateLab, recordLab } = usePortal();
  const { href } = usePortalNavigation();
  const lab = getPortalLab(labId)!;
  const record = labState(labId);
  const Component = labId === "loop-loom" ? LoopLoom : labId === "same-half" ? SameHalf : HiddenCubes;
  const next = PORTAL_LABS[(PORTAL_LABS.findIndex(item => item.id === labId) + 1) % PORTAL_LABS.length];
  return <div className="lab-workspace">
    <Link href={href("/labs")} className="p-text-link p-back"><ArrowLeft size={16} aria-hidden="true" />All discovery labs</Link>
    <div className="p-heading"><div><p className="p-eyebrow">DISCOVERY LAB / {lab.number}</p><h1>{lab.title}</h1><p>{lab.question}</p></div><div className="p-meta"><span><Clock3 size={16} aria-hidden="true" />About {lab.minutes} min</span>{record.completed && <span className="p-tag"><Check size={15} aria-hidden="true" />Activity recorded</span>}</div></div>
    <Component record={record} ready={ready} onChange={patch => updateLab(labId, patch)} onRecord={() => recordLab(labId)} />
    <section className="p-card lab-reflection" aria-labelledby="lab-reflection-title"><p className="p-eyebrow">MAKE IT YOURS</p><h2 id="lab-reflection-title">What would you try next?</h2><label className="p-field" htmlFor="lab-reflection"><span>Keep a question or explain your idea. (Optional)</span><textarea id="lab-reflection" rows={3} maxLength={1200} value={record.reflection} disabled={!ready} onChange={event => updateLab(labId, { reflection: event.target.value })} placeholder="I noticed… Next I wonder…" /></label><p className="p-small p-muted">Your work stays in this tab. Export a copy from My progress before closing it.</p><div className="lab-actions"><Link className="p-secondary" href={href("/progress")}>Open my notebook<ArrowRight size={16} aria-hidden="true" /></Link><Link className="p-text-link" href={href(`/labs/${next.id}`)}>Try {next.title}<ArrowRight size={16} aria-hidden="true" /></Link></div></section>
    <p className="lab-credit">Interactive geometry built with <a href="https://github.com/wheresryan22/anatomy" target="_blank" rel="noreferrer">Anatomy</a>. EducationOS learning activities. <Link href={href("/labs")}>Explore the collection</Link>.</p>
  </div>;
}
