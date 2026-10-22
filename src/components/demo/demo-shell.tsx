"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowUpRight, BookOpen, FlaskConical, FolderOpen, LayoutDashboard, ShieldCheck, Sprout } from "lucide-react";
import type { ReactNode } from "react";
import { AGE_PROGRAMS } from "@/content/missions";
import type { AgeBand } from "@/contracts/learning";
import { DemoProvider, useDemo } from "./demo-provider";

const navigation = [
  { href: "/demo", label: "Your dashboard", icon: LayoutDashboard },
  { href: "/demo/lab", label: "Inventors Lab", icon: FlaskConical },
  { href: "/demo/portfolio", label: "Skills portfolio", icon: FolderOpen },
  { href: "/demo/guardian", label: "Guardian preview", icon: ShieldCheck },
];
function Shell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { session, ready, notice, setAgeBand, curriculumStatus, mission, retryCurriculum } = useDemo();
  const program = AGE_PROGRAMS.find((item) => item.ageBand === session.ageBand)!;
  return <div className="demo-shell">
    <aside className="demo-sidebar" aria-label="Demo navigation">
      <Link href="/" className="demo-brand" aria-label="EducationOS home"><span className="demo-brand-mark" aria-hidden="true"><Sprout size={22} /></span>Education<span>OS</span></Link>
      <div className="demo-sidebar-label">THE LEARNING SPACE</div>
      <nav>{navigation.map(({ href, label, icon: Icon }) => <Link key={href} href={href} className={`demo-nav-link ${pathname === href ? "is-active" : ""}`} aria-current={pathname === href ? "page" : undefined}><Icon size={19} aria-hidden="true" /><span>{label}</span>{pathname === href && <span className="demo-nav-dot" />}</Link>)}</nav>
      <div className="demo-sidebar-bottom"><div className="demo-mini-orbit" aria-hidden="true"><FlaskConical size={24} /></div><strong>Small experiments.<br />Bigger possibilities.</strong><p>One question is a good place to start.</p><Link href="/approach">Our learning approach <ArrowUpRight size={15} aria-hidden="true" /></Link></div>
      <Link className="demo-back-home" href="/">Back to EducationOS <ArrowUpRight size={14} aria-hidden="true" /></Link>
    </aside>
    <div className="demo-workspace">
      <header className="demo-topbar"><div><span className="demo-status-dot" /><span>Interactive demo</span><span className="demo-topbar-divider">/</span><span className="demo-world-label">{program.worldName}</span></div><label className="demo-age-select">Explore an age group<select aria-label="Explore an age group" value={session.ageBand} onChange={(event) => setAgeBand(event.target.value as AgeBand)} disabled={!ready}>{AGE_PROGRAMS.map((item) => <option key={item.ageBand} value={item.ageBand}>{item.name} · ages {item.ageBand.replace("-", "–")}</option>)}</select></label></header>
      <div className="demo-data-note"><ShieldCheck size={16} aria-hidden="true" /><p>Demo notes stay in this browser tab. Use made-up examples only. Do not enter names, contact details, photos, or other personal information.</p><Link href="/demo/guardian">How this works</Link></div>
      <div className={`demo-curriculum-status is-${curriculumStatus}`} role="status" aria-live="polite"><BookOpen size={15} aria-hidden="true" /><p>{curriculumStatus === "loading" ? "Checking lesson availability. Bundled preview is available while we connect." : curriculumStatus === "live" ? `Published lesson ready · Version ${mission.version}. Your notes remain local.` : `Offline lesson preview · Version ${mission.version}. The lesson service is unavailable; your notes remain local.`}</p>{curriculumStatus === "offline" && <button type="button" onClick={retryCurriculum}>Retry connection</button>}</div>
      {notice && <p className="demo-announcement" role="status">{notice}</p>}
      <main id="main-content" className="demo-main" aria-busy={!ready}>{children}</main>
      <footer className="demo-footer"><span>Curiosity is a practice.</span><div><Link href="/privacy">Privacy</Link><Link href="/safety">Safety</Link><Link href="/accessibility">Accessibility</Link></div></footer>
    </div>
  </div>;
}
export function DemoShell({ children }: { children: ReactNode }) { return <DemoProvider><Shell>{children}</Shell></DemoProvider>; }

export function BridgeArt({ compact = false }: { compact?: boolean }) {
  return <svg className={`demo-bridge-art ${compact ? "is-compact" : ""}`} viewBox="0 0 620 390" role="img" aria-label="An accordion-folded paper bridge spanning two book supports, with a lightweight test block in the middle">
    <defs><pattern id={compact ? "demo-dots-small" : "demo-dots"} width="20" height="20" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="1" fill="currentColor" opacity=".14" /></pattern></defs>
    <rect width="620" height="390" fill={`url(#${compact ? "demo-dots-small" : "demo-dots"})`} />
    <ellipse cx="315" cy="306" rx="230" ry="27" fill="#171a16" opacity=".06" />
    <path d="M73 242l112-18 58 32-112 20z" fill="#171a16" /><path d="M73 242v50l58 33v-49z" fill="#b7bdab" /><path d="M131 276l112-20v49l-112 20z" fill="#e8ebdf" stroke="#171a16" strokeWidth="2" />
    <path d="M384 223l111-17 60 32-112 20z" fill="#171a16" /><path d="M384 223v49l59 34v-48z" fill="#b7bdab" /><path d="M443 258l112-20v49l-112 19z" fill="#e8ebdf" stroke="#171a16" strokeWidth="2" />
    <path d="M153 210l28-24 28 17 28-24 28 17 28-24 28 17 28-24 28 17 28-24 28 17 28-24 30 19-28 23-28-17-28 24-28-17-28 24-28-17-28 24-28-17-28 24-28-17-28 24z" fill="#d5fc51" stroke="#171a16" strokeWidth="2.5" strokeLinejoin="round" />
    <path d="M181 186l28 17m28-24 28 17m28-24 28 17m28-24 28 17m28-24 28 17m28-24 30 19" stroke="#171a16" strokeWidth="1.5" />
    <path d="M281 112l48-8 31 18-48 8z" fill="#f7f8f2" stroke="#171a16" strokeWidth="2.5" /><path d="M281 112v45l31 18v-45z" fill="#171a16" /><path d="M312 130l48-8v45l-48 8z" fill="#dce3cd" stroke="#171a16" strokeWidth="2.5" />
    <path d="M320 69v22m-8-8 8 8 8-8" stroke="#171a16" fill="none" strokeWidth="2" />
    <path d="M242 296l137-20m-137 12v16m137-36v16" stroke="#171a16" fill="none" strokeWidth="1.5" />
    <text x="283" y="318" fontSize="12" fill="#50554b" fontFamily="monospace" transform="rotate(-8 283 318)">10 cm gap</text>
    <path d="M424 100h74v39" fill="none" stroke="#8b9380" strokeWidth="1" /><circle cx="424" cy="100" r="3" fill="#171a16" />
    <text x="432" y="87" fontSize="11" fill="#50554b" fontFamily="monospace">CHANGE THE SHAPE</text>
    <circle cx="115" cy="108" r="29" fill="none" stroke="#171a16" strokeWidth="1" /><path d="M103 108h24m-12-12v24" stroke="#171a16" strokeWidth="1.5" />
    <circle cx="512" cy="325" r="4" fill="#171a16" /><circle cx="530" cy="325" r="4" fill="#d5fc51" stroke="#171a16" /><circle cx="548" cy="325" r="4" fill="none" stroke="#171a16" />
  </svg>;
}
