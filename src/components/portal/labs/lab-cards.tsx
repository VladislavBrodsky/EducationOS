"use client";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, Box, Clock3, Grid2X2, Repeat2 } from "lucide-react";
import { PORTAL_LABS } from "@/lib/labs/catalog";
import type { PortalSubjectId } from "@/lib/portal-learning";
import { usePortal } from "../portal-provider";
import { usePortalNavigation } from "../portal-shell";
import "./labs.css";

const icons = { "loop-loom": Repeat2, "same-half": Grid2X2, "hidden-cubes": Box };
export function LabCards({ subjectId }: { subjectId?: PortalSubjectId }) {
  const { state } = usePortal();
  const { href } = usePortalNavigation();
  return <div className="lab-card-grid">{PORTAL_LABS.filter(lab => !subjectId || lab.subjectId === subjectId).map(lab => { const Icon = icons[lab.id]; const draft = state.labs[lab.id]; return <article className={`lab-discovery-card lab-card-${lab.id}`} key={lab.id}><div className="lab-card-art" aria-hidden="true"><span className="lab-art-number">{lab.number}</span><Icon size={56} strokeWidth={1.2} /><div className="lab-art-marks">{Array.from({ length: 7 }, (_, i) => <span key={i} />)}</div></div><div className="lab-card-copy"><p className="p-eyebrow">{lab.subjectId === "programming" ? "PROGRAMMING" : "MATHEMATICS"} · DISCOVERY LAB</p><h3><Link href={href(`/labs/${lab.id}`)}>{lab.title}<ArrowUpRight size={18} aria-hidden="true" /></Link></h3><p>{lab.description}</p><div className="lab-card-bottom"><span><Clock3 size={14} aria-hidden="true" />{lab.minutes} min · {draft?.completed ? "Recorded" : draft ? "In progress" : "Explore & try"}</span><Link href={href(`/labs/${lab.id}`)} aria-label={`Open ${lab.title}`}><ArrowRight size={20} aria-hidden="true" /></Link></div></div></article>; })}</div>;
}
export function DiscoveryLabsSection() {
  const { href } = usePortalNavigation();
  return <section aria-labelledby="discovery-labs-heading"><div className="p-section-heading"><div><p className="p-eyebrow">SMALL QUESTIONS. BIG DISCOVERIES.</p><h2 id="discovery-labs-heading">Try a discovery lab.</h2></div><Link className="p-text-link" href={href("/labs")}>All labs<ArrowUpRight size={16} aria-hidden="true" /></Link></div><LabCards /></section>;
}
export function DiscoveryLabsPage() {
  return <><div className="p-heading"><div><p className="p-eyebrow">PREDICT. EXPLORE. EXPLAIN.</p><h1>See an idea from a new side.</h1><p>Make a guess, change a model, and test your thinking with a fresh question. Every lab also works in 2D.</p></div></div><LabCards /><aside className="p-quiet-note lab-collection-note"><Repeat2 size={22} aria-hidden="true" /><div><strong>Changed your mind? That’s part of learning.</strong><p>Your first prediction can be a mistake. Record your work after exploring and explaining a new example.</p></div></aside></>;
}
