# Baseline provenance and reconstruction

## Evidence inspected

On 2026-10-18 the linked repository, local project mirror, available local artifact paths, and referenced ChatGPT conversation were inspected.

| Source | Recoverable evidence | Limitation |
|---|---|---|
| `VladislavBrodsky/EducationOS` | `main` commit `92101bdfb69645acb8a4d09f87976de6742b78ff`, one 13-byte README containing `# EducationOS` | No application or downloadable releases were present at inspection |
| Local ChatGPT project mirror | Project instructions in `AGENTS.md` | No synced application source was present |
| Conversation `6ad3de4c-4fd4-83e8-8798-01a671f4c125`, “Arquitectura EdTech TRIZ” | Recorded feature inventory, design direction, source artifact names, and milestone recommendation | Returned attachment list was empty; sandbox artifact links were not available as local files |
| `EducationOS_Documentation_v0.1.0.zip` | Original public architecture documentation, preserved in `reference/` | Contains 27 files; the archive README references missing documents 01–05 |
| `EducationOS_Private_Founder_Playbook_v0.2.0.zip` | Existence observed locally | Private material excluded from this repository |

The missing baseline artifact is `EducationOS_Source_v0.4.0.zip`. Related unavailable files include `EducationOS_InventorsLab_Standalone_v0.4.0.html`, v0.4 desktop/mobile screenshots, and v0.3 design-system ZIPs/previews. No claim is made that the prior source, styling, stored data format, or reported eleven tests have been recovered.

The public documentation archive has SHA256:

```text
712faf9b90c33d12b98e58c14a3e04fce1702f52f71c2ef059c19a9a64aaa681
```

## GitHub delivery status

Repository metadata reported push/admin permission, but connector branch creation returned HTTP 403. A later network-enabled check verified working GitHub CLI authentication, providing an alternative delivery path. Metadata alone does not establish effective connector write access. Draft PR creation remains a separate concrete delivery step; no PR is claimed from these permission checks alone.

## Later architecture correction

The user's later architecture decision establishes **Python/FastAPI as the canonical backend/API/domain/authentication layer, with SQLAlchemy and Alembic for PostgreSQL**. Next.js/React/TypeScript is the presentation layer. This supersedes the earlier TypeScript backend proposal in the recovered public specifications.

The completed TypeScript backend, SQL migration, and security tests are retained under [superseded reference](../reference/typescript-backend/README.md). They are reviewable requirements examples, not the active architecture or canonical database migration path. Active Next.js API routes are unconditional no-store HTTP 503 shims while the separate Python implementation proceeds. Presentation schemas require alignment with canonical FastAPI OpenAPI contracts.

## Recorded v0.4 feature mapping

The acceptance target is the observable feature inventory from the conversation. This is a reconstruction, so source-level parity remains unverified.

| Recorded v0.4 feature | v0.5 acceptance target |
|---|---|
| Learner dashboard | Responsive navigation, stage-aware worlds, mission entry, honest demonstration progress |
| Seven-step Inventors Lab | Problem framing, contradiction, divergent ideas, prediction, fair experiment, reflection, transfer |
| Five age stages | Explorers 5–6, Builders 7–9, Makers 10–12, Creators 13–15, Launchers 16–17 |
| Skills Vault | Evidence-linked capabilities without invented mastery percentages |
| Portfolio | Session evidence, manual experiment comparisons, JSON export |
| Guardian preview | Adult editorial view explaining learning evidence and unfinished safety requirements |
| Professional iconography | SVG/Lucide only; no frontend emojis; visible keyboard focus |
| Responsive experience | Learner mission and adult surfaces usable on phone and desktop |

Acceptance and test results are recorded in [MILESTONES.md](MILESTONES.md) and [TESTING.md](TESTING.md), rather than inferred from this target table.

## Design continuity

The conversation identifies [the Refero reference](https://styles.refero.design/style/75fdb89f-ca64-41b3-af36-7a78bd09448e) as Steep. The recorded direction is editorial, restrained adult surfaces and energetic lime learner surfaces, sharing consistent spacing, shape, focus, and iconography. EducationOS uses an independent implementation and available font fallbacks; proprietary fonts, illustrations, and screenshots are not bundled.

Recovered proposed learner tokens are white canvas, near-black ink, accessible dark muted text, lime accent, pale surfaces, 4px spacing, and rounded cards. Lime is primarily a background/accent; body text must remain legible. Reduced motion, forced colors, keyboard access, and touch targets are part of the implementation target. Automated checks do not establish conformance or child usability.

## Future reconciliation

If the v0.4 ZIP is recovered, verify its checksum, import it into a separate reference directory, compare its actual features and export format with this reconstruction, and document any gaps. Keep historical artifacts unchanged. Do not silently rewrite the provenance record or assert that unavailable historical test results ran against v0.5.
