# Baseline provenance and implementation continuity

The v0.5.0 release is built from inspected repository material and the recorded v0.4.0 product requirements. It is not described as a recovered or byte-for-byte port of unavailable source.

## Evidence and limitations

| Source | Recoverable evidence | Limitation |
| --- | --- | --- |
| `VladislavBrodsky/EducationOS` | Local checkout parent commit `92101bdfb69645acb8a4d09f87976de6742b78ff`, titled `Initial commit`, with a minimal EducationOS README | The inspected baseline contained no working application at that commit; repository state can change independently |
| ChatGPT project mirror | Project instructions require all synced `sources/` references to remain read-only | Synced sources must not be edited or treated as the app working tree |
| Referenced conversation “Arquitectura EdTech TRIZ” | Recorded dashboard, seven-step Inventors Lab, five age bands, portfolio, guardian preview and professional SVG/no-emoji direction | Prior attachment names and sandbox links do not prove file availability |
| `EducationOS_Source_v0.4.0.zip` | Artifact name and recorded feature inventory | Source ZIP was not recovered during this session; source-level parity, prior export compatibility and the historical eleven tests are unverified |
| `EducationOS_UIUX_Design_System_v0.3.1.zip` | User-specified design direction | Source design archive was not recovered; this release implements an independent white/black/lime design system |
| Existing local v0.5 work | Next.js contracts, auth/permission scaffolding and documentation were inspected and reused where compatible | Other user chats were concurrently changing the original working directory; a separate `EducationOS-web` checkout snapshot was created to isolate this release |

The isolated release contains one Next.js application and PostgreSQL modular backend. An unrelated concurrently developed Python backend is outside this release. Existing source was reused before adding the missing public site, learner experience, persistence and deployment material. No synced project references were changed.

## Feature mapping

| Recorded v0.4 capability | This foundation |
| --- | --- |
| Learner dashboard | Age-aware mission entry and honest synthetic demonstration progress |
| Inventors Lab | Seven-step TRIZ problem/contradiction/ideas/hypothesis/experiment/reflection/transfer journey with structured evidence |
| Five age stages | Explorers 5–6, Builders 7–9, Makers 10–12, Creators 13–15, Launchers 16–17 |
| Skills Vault and portfolio | Evidence-linked capabilities, manual experiment comparison and JSON export without invented mastery scores |
| Guardian preview | Adult view of evidence and explicit unfinished identity/consent gates |
| Professional iconography | Lucide/original SVG, visible focus and no frontend emojis |
| Responsive experience | Desktop and mobile learning/adult surfaces |

The user also requested a public marketing site, legal/trust pages, a PostgreSQL backend, CI and verified domain handoff, which are new foundation scope. Test results, screenshots and remaining execution limitations belong in [QA.md](QA.md), not in historical claims.

## Repository and deployment status

Earlier conversation context reported GitHub write attempts returning 403. Effective write permission must be established through an actual current operation; permission metadata alone is insufficient. The final handoff must state whether a branch/PR was created, or provide the reproducible archive and exact blocker. This provenance document does not assert that a branch, tag, deployment or DNS change was published.

Public DNS/HTTP observations and their timestamp are recorded in [DOMAIN.md](DOMAIN.md). They showed registrar parking/forwarding and unverified HTTPS at the time checked. A configured domain, valid certificates, hosting promotion and a reviewed real-account service are separate acceptance gates.

## Future reconciliation

If the v0.4.0 source/design archives become available, preserve them unchanged, record checksums, compare the actual mission sequence and export format against this release, and document gaps before importing changes. Do not replace this provenance record with an unsupported statement that historical tests were rerun.
