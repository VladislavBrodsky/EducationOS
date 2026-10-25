# Marketing experience v2 — audit, architecture, and staged release

This is the first implementation plan for the EducationOS public experience. It extends the existing Python-first application. It does not create new learner accounts, collect child data, or change backend permission policy.

## Audit and design decision

The previous public site already had a complete page hierarchy, four journal stories, a five-stage age model, high-quality original WebP artwork, focus styling, and a working demo. The visual story was fragmented across independent sections and available only in English. The strongest reusable assets were the paper/ink/lime palette, TRIZ mission, and concept artwork. Rebuilding the backend or purchasing another UI stack would not improve the first impression.

The [Magic UI component catalogue](https://magicui.design/docs/components) suggests compact demonstrations framed by strong typography and generous neutral space. Its [Bento Grid](https://magicui.design/docs/components/bento-grid) groups related capabilities; [Magic Card](https://magicui.design/docs/components/magic-card) uses cursor-dependent spotlight borders; [Orbiting Circles](https://magicui.design/docs/components/orbiting-circles) stages objects around a focal point; its [blog template](https://magicui.design/docs/templates/blog) is intentionally minimal. EducationOS adopts the composition principles and builds its own components, copy, science imagery, and motion. Cursor-dependent effects are decorative only, since touch and keyboard users must get the full message. The reference template currently documents Next.js 15 while this repository runs Next.js 16; its code is not imported wholesale.

The new visual system uses an editorial split hero, a single lime 3D-style stage, numbered teaching cards, a dark age-group panel, and image-led journal cards. Motion uses CSS transforms only, respects reduced-motion preferences, and does not gate reading or navigation. The “viral” mechanism is a clear share action on each article and a memorable visual hook; growth claims are not implied.

## Implemented so far

| Surface | Route | Language |
| --- | --- | --- |
| Landing | `/`, `/en`, `/ru` | Spanish default, English, Russian |
| Journal index | `/blog`, `/en/blog`, `/ru/blog` | Spanish default, English, Russian |
| Four articles | `/blog/:slug`, `/en/blog/:slug`, `/ru/blog/:slug` | Spanish default, English, Russian |
| Programs, learning approach, trust center | `/programs`, `/approach`, `/trust` and `/en`, `/ru` equivalents | Spanish default, English, Russian |
| Learner demo, safety, legal and accessibility pages | Existing routes | English for now, visibly disclosed on localized marketing pages |

Content comes from typed dictionaries in `src/lib/marketing-i18n.ts` and `src/lib/marketing-journal.ts`. Language selection uses explicit URLs instead of auto-redirecting browser preferences, so shared links are stable. The proxy sends a trusted locale header to the root document for its `lang` attribute. Pages have locale-specific titles, descriptions, canonicals, `hreflang` alternatives, and sitemap entries. Spanish default URLs are unprefixed. Marketing pages are server components; the only client-side marketing behavior is the small native share action. Journal stories are reviewed files in Git, with no public submission or comment endpoint.

```text
src/app/                       Next.js App Router and route metadata
  [locale]/                    English and Russian marketing routes
  blog/                        Spanish journal routes
  marketing.css                Scoped public visual system
src/components/marketing/      Shared landing, shell, and journal views
src/lib/marketing-i18n.ts      Typed interface copy and route helpers
src/lib/marketing-journal.ts   Reviewed, localized article content
src/components/portal/         Existing learner UI, separate boundary
backend/src/educationos/       Existing FastAPI modular monolith
  auth.py, learning.py          Server-owned identity and evidence policy
  curriculum.py, contracts.py  Versioned lesson data and API contracts
  ai/, observability.py        Bounded AI support and telemetry
backend/alembic/               PostgreSQL schema migrations
tests/                         Unit and browser verification
```

The backend remains Python/FastAPI with Pydantic, SQLAlchemy, Alembic, PostgreSQL, Redis, and OpenAPI-generated TypeScript contracts. Next.js is the presentation layer; it forwards `/api/v1` to Python. Editorial publishing currently requires a reviewed Git change and deployment. A CMS is deferred until the team has a real publishing cadence and approval owner; no child data belongs in the public journal.

## Roadmap and release gates

1. **Stage 0 — audit and baseline (done):** inventory active routes, assets, stack, child-safety boundary, and Magic UI patterns. Record desktop/mobile baseline and real performance after staging deployment.
2. **Stage 1 — first public release (deployed 25 October 2026):** new landing and article experience, three language routes, 3D-style hero, share action, SEO metadata, and accessible reduced-motion behavior. The build, lint, TypeScript, icon policy, browser, route, image, and mobile-overflow checks passed. Editorial review of Spanish and Russian copy remains open in draft PR #3.
3. **Stage 2 — translation completion (in progress):** programs, approach, and trust now have equivalent Spanish, English, and Russian routes, consistent navigation, localized metadata, and explicit labels for English-only destinations. Safety, privacy, terms, accessibility, demo, and guardian preview still need specialist review and translation. Gate: native-speaker editorial review and complete `hreflang` reciprocity across every translated page.
4. **Stage 3 — content operations:** establish a Python content schema/API only if multiple editors need scheduled publication. Add draft/review/publish roles, immutable article revisions, image licensing records, previews, and a separate adult-facing editorial workflow. Public content remains read-only and cacheable. Gate: editorial approval audit and rollback test.
5. **Stage 4 — measured polish:** evaluate whether a lightweight 3D scene adds value over the current layered artwork. Enforce a static fallback, responsive image budgets, and no animation dependency. Add consent-aware aggregate analytics only after privacy review. Gate: WCAG 2.2 AA checks plus field Core Web Vitals targets of LCP ≤2.5 s, INP ≤200 ms, CLS ≤0.1 at the 75th percentile; these are targets, not current measurements.
6. **Stage 5 — production rollout:** use a staging preview, editorial/language sign-off, smoke tests on all locale routes, and a controlled frontend release. Preserve the private Python API and child-data gates. Verify the live URL, HTTPS, redirects, and monitoring after deployment; do not mark a local build as a live release.

## Immediate action plan

Review the live desktop/mobile screenshots and Spanish/Russian copy with native speakers, then merge draft PR #3 after editorial sign-off. Next, complete specialist translation of safety, legal, accessibility, and learner pages; keep the private Python API and child-data gates unchanged. The marketing release evidence is recorded in `docs/DEPLOYMENT_STATUS.md`.
