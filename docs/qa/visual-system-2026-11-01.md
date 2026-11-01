# Shared visual-system audit

1 November 2026

The initial audit visited61 content routes at390/768/1440px (183 checks), covering localized marketing and articles, policies, studio, component workbench, demo/portfolio and every portal lesson/lab. No document overflow or clipped/off-screen headings were found. Visual review identified weaker structures: absolutely positioned journal art/caption, decoration behind the portal progress explanation, inconsistent Arial/Manrope typography and uneven button/card treatments. Signed-in adult states remain covered by existing UI and full-stack tests rather than operator credentials in this read-only audit.

The refresh uses shared Manrope typography, clearer action/focus styles, layered bento surfaces, a journal hero in document flow, an asymmetric desktop story grid and unobstructed portal progress copy. Border Beam is a native CSS adaptation of the MIT Magic UI concept: one finite4.2-second border pass per visible entry with reduced-motion, offscreen, visibility and shared-pause handling. It never overlays photographic heroes. The catalog now distinguishes17 local previews from60 official references, retaining77 entries. No runtime dependencies or copied Pro assets were added.

Executed local checks: ESLint, TypeScript,144 unit tests, icon policy and production build pass. Eight focused browser checks pass for policy layouts/navigation, translated headings, all17 previews, journal artwork/caption separation, light/dark contrast, keyboard access and finite/reduced motion. The old compact-journal height check now permits the real image/caption flow within a phone viewport instead of relying on overlapping absolute layers. Screenshots are local in ignored `artifacts/visual-system/`.

`node scripts/audit-layout.mjs` repeats the route inventory plus public/portal missing-page states at three widths. It writes its complete report and screenshot evidence under `artifacts/site-audit/`; `AUDIT_BASE_URL`, `AUDIT_OUTPUT` and `PLAYWRIGHT_CHANNEL` select an existing preview and output location. It performs no form submissions, account creation or remote writes. Post-change route and deployment results are recorded separately in the release handoff after completion. Browser emulation and automated contrast scans are not physical-device or independent accessibility certification.

Python authorization, consent, child enrollment and learner AI boundaries are unchanged. The frontend source must be deployed separately to the existing marketing and portal services, retaining their surface settings and domains.
