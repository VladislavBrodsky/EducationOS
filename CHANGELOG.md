# Component studio and accessible motion — 2026-10-30

- Integrate ordered Animated List method cards, Interactive Hover Button lab actions and a scoped Dot Pattern callout on real localized detail pages
- Keep method text fully opaque during entry motion and remove overlapping reveal animation
- Add mobile/desktop native-scroll, keyboard, three-language accessibility and no-JavaScript checks for real-page integration
- Add a searchable Magic UI catalog with 77 official references across eight categories and 16 working local previews
- Add a localized rolling topic ribbon and rotating words on the homepage, plus a decorative reading-position indicator on journal articles
- Share pause controls and respect reduced motion, keyboard focus, page visibility and static no-JavaScript fallbacks
- Keep one showcase preview active at a time, preserve learner controls and add no runtime dependencies
- Document upstream MIT attribution, local adaptations and reference-only entries; add motion, preview, responsive and accessibility regressions

# UI refinement — 2026-10-30

- Rebuild studio entry hierarchy around a compact hero, visible access status, expandable safety detail, early mobile sign-in and aligned workflow cards
- Correct clipped translated method headings and cramped tablet journal cards; improve detail-page heading measure and illustration captions
- Give learner intro copy its full column and adapt lesson/card grids to readable widths
- Align policy headings with their reading grid and add keyboard-accessible section navigation
- Add focused responsive/keyboard regressions and preserve all learning, auth and consent behavior

# v0.6.0 adult studio — 2026-10-28

- Add operator-provisioned adult accounts with expiring hashed sessions, salted scrypt passwords, cookie CSRF, server-controlled roles and explicit production closure.
- Add educator mission draft/review/published lifecycle, five age adaptations, immutable revision snapshots, safety flags, independent reviewer acknowledgement, atomic audit history and optimistic concurrency.
- Add guardian consent-intent acknowledge/revoke scaffolding without enabling child profiles.
- Add accessible studio interface and restricted same-origin Python API forwarding; preserve existing lab/portfolio.
- Add frozen additive PostgreSQL migration, runtime grants, append-only triggers, real database and UI/auth security tests, audit workflow, staging instructions and release evidence.
- Keep learner-facing AI and real child onboarding closed; no production rollout or DNS changes.

# Changelog

## Portal navigation and resume — 2026-10-18

- Added direct Today links to edited unfinished activities and labs; blank starters stay hidden and completed paths offer Revisit activity.
- Kept mobile navigation reachable during long lessons, with safe-area spacing and Projects selected inside discovery labs.
- Added sticky lab step shortcuts with native heading focus and prediction gates. Existing answers and 2D fallbacks stay available.

## Learner portal and Anatomy discovery labs — 2026-10-18

- Added Loop Loom, Same Half Different Shape, and Hidden Cube Builder to the learner portal, with prediction, manipulation, explanation, and transfer checks.
- Added mobile and keyboard controls, 2D alternatives, no-JavaScript worked examples, and independently checked browser-tab notebook records.
- Integrated pinned MIT-licensed Anatomy SVG geometry and optional rigid 3D turning; kept the marketing site and existing demo separate.
- Added a separate responsive learner portal with Today, Subjects, Projects, My progress, and an adult overview. Preserved the public marketing site and original demo.
- Added 15 starter activities across programming, science, mathematics, writing, and arts/design; local draft recovery, feedback, reflections, work export and confirmed clearing.
- Added an editable, bounded practice-code interpreter for print, variables, arithmetic and repeat, with line-specific errors. No arbitrary JavaScript/Python execution or new server endpoint.
- Added light/dark appearance, mobile Learn/Activity/Result panels and labelled learning paths.
- Deployed separate portal and marketing services at app.educationos.space and educationos.space, with hostname routing, separate metadata/crawler behaviour, verified HTTPS and preserved mail records.
- Verified all three labs after deployment at two mobile viewport sizes, with 12 light/dark accessibility scans reporting no violations. See docs/DEPLOYMENT_STATUS.md for evidence and limits.

## 0.6.0 — 2026-10-18

- Accepted the user's Python-first correction: FastAPI, Pydantic, SQLAlchemy 2/Alembic, PostgreSQL/pgvector and Redis replace the active Node/Prisma backend direction.
- Preserved the polished Next/React frontend and synthetic TRIZ journey; added typed FastAPI curriculum integration with explicit offline state.
- Added Python permission/evidence services, versioned contracts/OpenAPI, tasks, read-only MCP and bounded AI provenance/prompt/evaluation foundation. Enrollment and generative learner AI stay closed.
- Added locked dependencies, safety/contract tests, separate-role Compose, health checks, CI and an educationos.space deployment runbook. Historical Node backend and documentation remain archived.
- Isolated the current source to avoid concurrent-chat edits. The connector write path returns403; authenticated CLI delivery and check results are recorded in the PR. No domain change or deployment claimed. Exact checks and limitations: docs/TESTING.md.

# Version history

All dates use the project date. Earlier versions below describe recovered documents or conversation records, not verified Git tags or deployed releases.

## 0.5.0 — 2026-10-18

Application foundation and reconstruction of the recorded v0.4 demonstration:

- Next.js App Router, React, and TypeScript application shell.
- Shared accessible SVG/Lucide components, a restrained editorial guardian view, and lime learner visuals with a frontend emoji check.
- Five age bands, learner worlds, a seven-step TRIZ Inventors Lab, fair experiment comparisons, session progress, evidence, Skills Vault, JSON portfolio export, and clearing demonstration work.
- Versioned mission and evidence contracts, PostgreSQL migration foundation, and server permission boundaries with negative authorization tests.
- Synthetic-only demonstration with real enrollment disabled and explicit privacy limitations.
- Test commands, browser accessibility checks, CI configuration, baseline provenance, architecture documentation, and milestone gates.

Validation status is recorded in [TESTING.md](docs/TESTING.md). This version is not production-safe for child enrollment and has no independent safety or accessibility certification.

## 0.4.0 — recorded in prior conversation

The conversation describes a standalone interactive frontend with learner dashboard, seven mission steps, five age stages, Skills Vault, evidence comparisons, JSON export, guardian preview, SVG icons, and eleven reported unit tests. It references a 105-file source ZIP and desktop/mobile previews. Those artifacts and test reports were unavailable during this reconstruction, so their implementation and reported results cannot be independently verified here.

## 0.3.1 — recorded in prior conversation

Formalized zero frontend emojis and professional SVG iconography. The conversation reports an updated design-system ZIP and preview, unavailable during this reconstruction.

## 0.3.0 — recorded in prior conversation

Steep/Refero audit, editorial/discovery theme reconciliation, design tokens, age-adaptive flows, and accessible component specifications. The conversation references eleven specifications and two token sets; source artifacts were unavailable during this reconstruction.

## 0.2.0 — private founder material

A private founder playbook was found locally. Its contents are excluded from this public repository and are not an application baseline.

## 0.1.0 — 2026-10-17, recovered public documentation

Architecture and product proposal covering TRIZ learning, five stages, evidence-backed assessment, modular monolith, PostgreSQL, privacy and safeguarding gates, editorial/discovery themes, and version governance. The recovered archive contains 27 files; documents 01–05 referenced by its README are absent. Original archive preserved under `reference/` with a checksum.
