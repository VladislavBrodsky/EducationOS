# v0.5.0 release procedure

The version is a source release identifier, not a statement that hosting, consent verification or production operations have been configured. Actual child registration is unavailable in this milestone. See [PLAN.md](PLAN.md) for rollout gates.

## What the release contains

- One Next.js App Router/React/TypeScript application, responsive marketing and trust pages, shared white/black/lime design tokens, SVG icons and accessible UI.
- A synthetic learner dashboard, five age bands, seven-step TRIZ Inventors Lab, evidence-based portfolio interaction and guardian preview.
- PostgreSQL schema, Prisma 6 migration history, parameterized repository operations, guarded APIs, secure-session primitives, consent-aware isolation, auditability, input validation, safe errors and abuse limits.
- Reproducible dependency lockfile, local/container setup, automated checks and a domain/provider handoff. Identity issuance and verified-consent integration are intentionally incomplete; a controlled account pilot requires the documented gates.

## Pre-release checklist

1. Review [PROVENANCE.md](PROVENANCE.md) if supplied by the implementing session, the source diff and schema migration. Confirm prior artifacts were reused where available and list unavailable historical sources explicitly.
2. Use Node.js 22 with the committed lockfile. Run `npm ci`, `npx prisma validate`, `npx prisma generate`, `npm run check`, `npx playwright install chromium`, and `npm run test:e2e`.
3. Replay committed migrations on clean PostgreSQL and run the synthetic seed. Inspect database constraints, integration behavior and migration status. CI's PostgreSQL service performs the schema replay; in-process PostgreSQL tests exercise repository behavior.
4. Inspect desktop and mobile screenshots and test keyboard navigation, labels/focus/error announcements, contrast, reduced-motion behavior, age-band changes, mission progression and portfolio export/reset. Confirm no frontend emoji code points are introduced.
5. Verify no real secrets, child fixtures, personal analytics, open AI/chat, payment collection or unsupported efficacy/compliance claims are shipped. Confirm registration and default protected account access remain unavailable.
6. Record exact command outcomes and tool/network limitations in the release handoff. A failed or unavailable check must not be relabeled as passing. A locally successful build does not prove a hosted deployment.

The helper performs an inspection by default and never deploys, pushes tags or alters DNS:

```sh
node scripts/release.mjs
node scripts/release.mjs --check
```

After review and commit, create an annotated local version tag. `--tag` reruns quality/browser checks, requires a clean working tree and refuses to overwrite an existing tag:

```sh
node scripts/release.mjs --tag
git push origin v0.5.0
```

Only push when repository permissions and release approval are established. Tag the exact reviewed release commit. Do not retag a published version; use a new patch version for corrections. A GitHub release should include the source archive, commit, checks, known limitations and the observed deployment status. Attach any created pull request to the working chat using the app tooling.

## Staging-to-production promotion

Complete the staging migration/restore and browser checks in [DEPLOYMENT.md](DEPLOYMENT.md). Promote the exact reviewed deployment, not a fresh untested rebuild with changed dependencies. Verify custom-domain certificates, canonical origin, redirects, app identity and headers using [DOMAIN.md](DOMAIN.md). Record the deployed commit and time only after an external check succeeds. If DNS/hosting control is unavailable, deliver the reproducible source archive and this handoff; do not invent a deployed URL.

## Current known limits

Provider adult authentication/session issuance, external guardian-consent verification, live account provisioning, a reviewed erasure worker and actual support operations require subsequent work. Email sending, payment collection and unrestricted AI/chat are absent. Managed backup schedules, distributed edge limits, external alerts, deployment/domain ownership and legal review require operator/provider setup. This release does not verify learning efficacy or regulatory certification.
