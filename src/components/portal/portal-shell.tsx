"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowUpRight, BookOpen, ChartNoAxesCombined, ChevronDown, FolderOpen, House, Moon, ShieldCheck, Sprout, Sun } from "lucide-react";
import { createContext, useContext, useMemo, useSyncExternalStore, type ReactNode } from "react";
import "./portal.css";
import { usePortal } from "./portal-provider";

type PortalNavigation = { appHost: boolean; href: (path: string) => string };
const NavigationContext = createContext<PortalNavigation | null>(null);

const links = [
  { path: "/", label: "Today", icon: House },
  { path: "/subjects", label: "Subjects", icon: BookOpen },
  { path: "/projects", label: "Projects", icon: FolderOpen },
  { path: "/progress", label: "My progress", icon: ChartNoAxesCombined },
];

const THEME_KEY = "educationos.portal.theme.v1";
const THEME_EVENT = "educationos:portal-theme";
let fallbackTheme: "light" | "dark" = "light";
let themeStorageFailed = false;

function readTheme(): "light" | "dark" {
  if (themeStorageFailed) return fallbackTheme;
  try {
    const value = window.localStorage.getItem(THEME_KEY);
    if (value === "dark" || value === "light") return value;
  } catch {
    // A private browser may disable storage; the current session still works.
    themeStorageFailed = true;
  }
  return fallbackTheme;
}

function subscribeTheme(onChange: () => void) {
  window.addEventListener("storage", onChange);
  window.addEventListener(THEME_EVENT, onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(THEME_EVENT, onChange);
  };
}

function serverTheme(): "light" | "dark" { return "light"; }

export function usePortalNavigation() {
  const value = useContext(NavigationContext);
  if (!value) throw new Error("Portal navigation must be used inside PortalShell.");
  return value;
}

export function PortalShell({ children, appHost }: { children: ReactNode; appHost: boolean }) {
  const { ready, notice } = usePortal();
  const pathname = usePathname();
  const theme = useSyncExternalStore(subscribeTheme, readTheme, serverTheme);
  const navigation = useMemo<PortalNavigation>(() => ({
    appHost,
    href(path) {
      const cleanPath = path === "/portal" ? "/" : path.startsWith("/portal/") ? path.slice(7) : path;
      const normalizedPath = cleanPath.startsWith("/") ? cleanPath : `/${cleanPath}`;
      return appHost ? normalizedPath : normalizedPath === "/" ? "/portal" : `/portal${normalizedPath}`;
    },
  }), [appHost]);
  const currentPath = pathname === "/portal" ? "/" : pathname.replace(/^\/portal(?=\/)/, "");
  const isActive = (path: string) => path === "/" ? currentPath === "/" : currentPath === path || currentPath.startsWith(`${path}/`) || path === "/subjects" && currentPath.startsWith("/learn/");
  const toggleTheme = () => {
    fallbackTheme = theme === "light" ? "dark" : "light";
    try { window.localStorage.setItem(THEME_KEY, fallbackTheme); } catch { themeStorageFailed = true; }
    window.dispatchEvent(new Event(THEME_EVENT));
  };

  return <NavigationContext.Provider value={navigation}>
    <div className="p-portal" data-theme={theme}>
      <aside className="p-sidebar" aria-label="Learning portal">
        <Link href={navigation.href("/")} className="p-brand" aria-label="EducationOS learning home">
          <span className="p-brand-mark"><Sprout size={21} aria-hidden="true" /></span>
          <span>Education<span className="p-brand-os">OS</span></span>
        </Link>
        <p className="p-sidebar-label">A space for curious minds</p>
        <nav className="p-navigation" aria-label="Learner navigation">
          {links.map(({ path, label, icon: Icon }) => <Link key={path} href={navigation.href(path)} className="p-nav-link" aria-current={isActive(path) ? "page" : undefined}>
            <Icon size={20} strokeWidth={1.7} aria-hidden="true" /><span>{label}</span><span className="p-nav-marker" aria-hidden="true" />
          </Link>)}
        </nav>
        <div className="p-sidebar-bottom">
          <div className="p-sidebar-note"><span className="p-orbit-mark" aria-hidden="true"><Sprout size={24} strokeWidth={1.5} /></span><p>Follow a question.<br />Make something yours.</p></div>
          <Link href={navigation.href("/guardian")} className="p-guardian-link" aria-current={currentPath === "/guardian" ? "page" : undefined}><ShieldCheck size={19} strokeWidth={1.7} aria-hidden="true" /><span>For parents & guardians</span></Link>
          <a href="https://educationos.space" className="p-public-link">EducationOS website <ArrowUpRight size={15} aria-hidden="true" /></a>
        </div>
      </aside>
      <div className="p-app">
        <header className="p-topbar">
          <div className="p-topbar-label"><span className="p-status-dot" aria-hidden="true" />Your learning space</div>
          <div className="p-topbar-actions">
            <Link className="p-mobile-guardian" href={navigation.href("/guardian")} aria-label="For parents and guardians"><ShieldCheck size={19} aria-hidden="true" /><span>For adults</span></Link>
            <button type="button" className="p-theme-toggle" onClick={toggleTheme} aria-label={`Switch to ${theme === "light" ? "dark" : "light"} theme`} title={`Switch to ${theme === "light" ? "dark" : "light"} theme`}>
              {theme === "light" ? <Moon size={18} aria-hidden="true" /> : <Sun size={18} aria-hidden="true" />}<span>{theme === "light" ? "Dark" : "Light"}</span>
            </button>
          </div>
        </header>
        <details className="p-preview-note">
          <summary><span><span className="p-preview-dot" aria-hidden="true" />Learning preview · work stays in this tab</span><ChevronDown size={15} aria-hidden="true" /></summary>
          <p>Explore the subjects and try the activities. This preview has no account or enrollment. Work stays in this browser tab until it is closed. Export it from My progress to keep a copy. Use made-up examples and avoid personal details.</p>
        </details>
        <main id="main-content" className="p-content" aria-busy={!ready}>{notice && <p className="p-notice" role="status">{notice}</p>}{children}</main>
        <footer className="p-footer"><span>Small steps. Your own discoveries.</span><nav aria-label="Portal information"><a href="https://educationos.space/privacy">Privacy</a><a href="https://educationos.space/safety">Safety</a><a href="https://educationos.space/accessibility">Accessibility</a></nav></footer>
      </div>
    </div>
  </NavigationContext.Provider>;
}
