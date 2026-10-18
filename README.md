# EducationOS

**v0.5.0 — Next.js presentation foundation and synthetic learner vertical slice.**

EducationOS helps learners notice a problem, frame a contradiction, invent alternatives, test a prediction, and explain what they learned. This handoff delivers the React/TypeScript learner experience and shared design system. **Python/FastAPI is the canonical backend**, with SQLAlchemy and Alembic for PostgreSQL. Backend/API/domain/authentication work belongs to that separate Python workstream; this Next.js application contains no active Node domain or authentication service.

**This release is not approved for use with real children or real child data.** Real enrollment is disabled. The demonstration uses synthetic browser-memory state. Do not enter names, contact information, photos, or other personal information into demonstration fields.

## Run locally

Use Node.js 22 LTS, version 22.13 or newer, and npm. From this repository root:

```sh
npm ci
npm run dev
```

Open [the local application](http://localhost:3000). For the built application, run `npm run build` followed by `npm start`.

```sh
npm run check
npx playwright install chromium
npm run test:e2e
```

See [testing](docs/TESTING.md) for actual results and scope. These commands verify this presentation handoff and its explicitly superseded reference tests; they do not validate the separate Python backend.

## What to explore

- Switch among five age bands to see the learner dashboard and mission scaffolding adapt.
- Complete the seven-step Inventors Lab: notice, contradiction, three ideas, prediction, fair test, reflection, and transfer.
- Compare two manual experiment results and inspect the evidence-linked Skills Vault.
- Export completed demonstration evidence as JSON, revisit a step, or clear all session work.
- Open the editorial guardian preview for an honest summary of evidence and remaining release gates.

All progress reflects actions in the current demonstration session. Refresh clears in-memory work. Age bands guide scaffolding; they do not imply ability or measured mastery. Every frontend icon is SVG/Lucide, with a source check prohibiting emojis. The guardian view shares the fictional session and grants no adult authorization.

## Backend handoff

The active Next.js `/api/v1` handlers are deliberately unavailable shims: HTTP 503, `Cache-Control: no-store`. They accept no real learner records. The UI does not send its notes to those routes.

An earlier TypeScript backend implementation, SQL migration, and security tests are preserved under [superseded reference](reference/typescript-backend/README.md). They are review material for the canonical Python/FastAPI implementation, not a second active backend, production migration path, or proof that Python authorization and persistence are implemented. Presentation schemas remain provisional until aligned with canonical FastAPI OpenAPI contracts.

## Baseline and provenance

The target repository originally contained a one-line README. The v0.4.0 source ZIP from the earlier conversation was unavailable. This handoff **reconstructs its recorded feature inventory** from that conversation and recovered public v0.1.0 specifications. Source-level parity with the unavailable ZIP remains unverified.

See [baseline evidence and architecture correction](docs/BASELINE.md). The public v0.1.0 documentation ZIP is preserved unchanged in [reference/](reference/README.md), with its checksum and missing-file notice. Private founder material is excluded.

## Project records

- [Architecture and canonical Python boundary](docs/ARCHITECTURE.md)
- [Milestone checklist and production gates](docs/MILESTONES.md)
- [Testing and validation record](docs/TESTING.md)
- [Version history](CHANGELOG.md)
- [Security boundary](docs/SECURITY.md)
- [Database handoff](docs/DATABASE.md)
- [API status and contracts](docs/API.md)
- [Design system](docs/DESIGN_SYSTEM.md)

Adult surfaces follow the recorded Steep/Refero editorial direction; learner surfaces use EducationOS lime accents. Proprietary reference fonts and artwork are not redistributed.
