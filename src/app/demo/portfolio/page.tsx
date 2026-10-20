"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight, Check, FileText, FlaskConical, FolderOpen, Lightbulb, ScanLine } from "lucide-react";
import { evidenceCount, measurementComparison } from "@/lib/demo-state";
import { useDemo } from "@/components/demo/demo-provider";
import { DemoDataActions } from "@/components/demo/data-actions";
import { MeasurementComparison } from "@/components/demo/measurement";

export default function PortfolioPage() {
  const { session, draft } = useDemo();
  const [filter, setFilter] = useState("All evidence");
  const count = evidenceCount(draft);
  const ideas = draft.ideas.filter((idea) => idea.trim());
  const measurements = measurementComparison(draft);
  const entries = [
    { title: "First observation", category: "Observations", text: draft.notice, step: 0, icon: ScanLine },
    { title: "The contradiction", category: "Observations", text: draft.contradiction, step: 1, icon: ScanLine },
    ...ideas.map((idea, index) => ({ title: `Idea 0${index + 1}`, category: "Ideas", text: idea, step: 2, icon: Lightbulb })),
    { title: "A testable prediction", category: "Experiment", text: draft.hypothesis, step: 3, icon: FlaskConical },
    ...(measurements ? [{ title: "Recorded measurements", category: "Experiment", text: `Flat paper: ${measurements.baseline} seconds. Redesign: ${measurements.redesigned} seconds. Trial limit: 60 seconds.`, step: 4, icon: FlaskConical }] : []),
    { title: "Experiment observations", category: "Experiment", text: draft.experiment, step: 4, icon: FlaskConical },
    { title: "Looking at the evidence", category: "Reflections", text: draft.reflect, step: 5, icon: FileText },
    { title: "A principle to take forward", category: "Reflections", text: draft.transfer, step: 6, icon: FileText },
  ].filter((entry) => entry.text.trim());
  const shown = entries.filter((entry) => filter === "All evidence" || entry.category === filter);
  return <>
    <div className="demo-page-heading"><div><p className="demo-eyebrow">SKILLS PORTFOLIO / AGES {session.ageBand.replace("-", "–")}</p><h1>Every idea leaves<br />a little evidence</h1><p>A collection of what you observed, imagined, and tested.</p></div><span className="demo-day-tag"><FolderOpen size={16} aria-hidden="true" /> Your process, made visible</span></div>
    <section className="demo-portfolio-summary"><div><span className="demo-pill"><FlaskConical size={14} aria-hidden="true" /> PAPER BRIDGE / VERSION 1</span><h2>A little paper. A stronger bridge</h2><p>{count === 7 ? "All seven steps have recorded evidence. You can keep refining your work." : `${count} of 7 steps have recorded evidence. Your rough ideas are welcome too.`}</p><progress className="demo-progress" max={7} value={count} aria-label={`${count} of seven steps have evidence`} /><Link className="demo-text-link" href="/demo/lab">{count === 7 ? "Revisit the experiment" : "Continue the experiment"} <ArrowRight size={16} aria-hidden="true" /></Link></div><div className="demo-portfolio-stamp"><span><Check size={22} aria-hidden="true" /></span><strong>{count}<small>/ 7</small></strong><p>steps with evidence</p></div></section>
    <div className="demo-evidence-note"><FileText size={17} aria-hidden="true" /><p>This is self-recorded demo evidence. It is not a verified assessment, an achievement award, or a mastery score.</p></div>
    <div className="demo-section-heading"><h2>Your evidence trail</h2><span>{entries.length} {entries.length === 1 ? "entry" : "entries"} in this age group</span></div>
    <div className="demo-filter-group" aria-label="Filter evidence">{["All evidence", "Observations", "Ideas", "Experiment", "Reflections"].map((label) => <button key={label} type="button" className={filter === label ? "is-active" : ""} aria-pressed={filter === label} onClick={() => setFilter(label)}>{label}</button>)}</div>
    <div className="demo-evidence-grid">{shown.length ? shown.map((entry) => <article className="demo-evidence-card" key={entry.title}><div className="demo-evidence-card-top"><span><entry.icon size={19} aria-hidden="true" /></span><span>STEP 0{entry.step + 1}</span></div><h3>{entry.title}</h3><p>{entry.text}</p><span className="demo-evidence-category">{entry.category}</span></article>) : <div className="demo-empty-state"><FolderOpen size={35} strokeWidth={1.25} aria-hidden="true" /><h3>{entries.length ? "No evidence in this category yet" : "A blank page is a good beginning"}</h3><p>Record a thought or a measurement in Inventors Lab. It will appear here.</p><Link href="/demo/lab" className="demo-text-link">Go to your mission <ArrowRight size={16} aria-hidden="true" /></Link></div>}</div>
    {(filter === "All evidence" || filter === "Experiment") && measurements && <section className="demo-portfolio-comparison"><h2>What happened in your trials?</h2><MeasurementComparison draft={draft} /></section>}
    <section className="demo-export-section"><div><p className="demo-eyebrow">YOUR NOTES, YOUR CONTROL</p><h2>Take it with you. Or start again</h2><p>Export the selected age group’s notes as JSON, or clear every age group’s notes from this tab. Nothing is sent to a server.</p></div><DemoDataActions /></section>
  </>;
}
