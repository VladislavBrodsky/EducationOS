# EducationOS frontend and experience audit

Audited 25 October 2026 against baseline `ecc047c` at `http://127.0.0.1:3100`. This plan updates the frontend priorities in [the marketing roadmap](MARKETING_V2_ROADMAP.md).

## Decision

Keep the white, ink, and lime identity, original learner artwork, editorial headings, responsive cards, and working learning activities. The next release should make the route from curiosity to a completed activity clearer. Prioritize navigation, language continuity, age selection, and the first learning session before adding more decorative motion or a new UI library.

The strongest existing product surface is the learner workspace: it has a real next activity, local resume, visible progress boundaries, keyboard controls, a dark theme, and interactive labs. The public funnel currently leads into a separate, older TRIZ demo. Connecting these experiences is the main product-design task.

## Coverage and limits

- 61 route cases at both 390×900 and 1440×900: 27 localized marketing pages, four policy pages, four demo pages, six portal collection/overview pages, 15 lessons, three discovery labs, and two missing-page cases
- 122 initial-layout checks and screenshots; full-page captures for 32 representative routes at both widths; visual review of the shared templates and their sections
- 28 selected mobile routes scanned with axe against WCAG A/AA tags through WCAG 2.2: no detected violations
- All 59 valid route cases returned 200 at both widths; the two missing-page cases returned 404; no document-level horizontal overflow or uncaught page errors were observed
- Source review of navigation, content dictionaries, route boundaries, state handling, styles, and existing interaction tests

These are Chromium viewport checks on a development server. They do not establish physical-device usability, screen-reader conformance, learning effectiveness, or production Core Web Vitals. Initial route inspection does not cover every input, saved state, or age variant. The existing learning tests cover additional interactions; native-speaker, assistive-technology, and supervised usability review remain separate work.

The compact [route evidence](design/ux-audit-2026-10-25.json) lists every route. Full screenshots and raw measurements are saved locally in `artifacts/ux-audit-2026-10-25/`.

## Prioritized findings

P1 means a journey or meaning is broken. P2 means significant clarity or usability improvement. P3 means measured refinement after the core journey works.

| ID | Priority | Finding and evidence | Action / acceptance |
| --- | --- | --- | --- |
| F01 | P1 | Landing method cards used sequential anchors into a seven-step cycle: Imagine opened contradiction, Experiment opened imagination, Explain opened hypothesis | **Implemented locally:** cards now open observation, imagination, fair experiment, and reflection respectively; destination headings checked in browser tests |
| F02 | P1 | English policy/demo navigation and the portal website link returned readers to unprefixed Spanish pages | **Implemented locally:** English pages link to `/en` and matching English marketing routes; policy cross-links preserve English |
| F03 | P1 | Marketing promotes `/demo`; the broader learner workspace at `app.educationos.space` has no clear entry in the public navigation | Define one “Try learning” journey with a clear choice between the guided Inventors Lab and subject activities; describe each destination and its language before entering |
| F04 | P1 | Spanish is the default public language while all learner activity, guardian, and policy experiences are English | Translate interface and curriculum as separate reviewed layers; preserve the activity, age stage, and local work during language changes; label unavailable translations |
| F05 | P2 | Mobile language controls measured 33×31px; marketing navigation and footer also fell below the project's 44px comfort target | **Implemented locally:** 44px targets, native language accessible names, larger navigation type, and a visible active-page underline; verified at 320, 390, 768, and 1440px |
| F06 | P2 | At 390px, the Spanish programs page was 5,839px long and the first age stage began at y=1,150px | Put a five-stage jump selector beside the introduction, before the illustration; keep all stages reachable without a carousel or forced horizontal swipe |
| F07 | P2 | The expected bundled lesson displays a recurring amber “service unavailable / retry” banner across the older demo | Present the available preview as ready, retain an honest offline disclosure, and move connection details into optional help; one clear next action stays prominent |
| F08 | P2 | Policy pages use an older shell, trailing title periods, and a release label fixed at v0.5.0 | **Partly implemented locally:** titles and stale release label corrected; next consolidate the English public shell and add reviewed translation availability |
| F09 | P2 | Journal index jumped from h1 to story h3; article metadata lacks editorial provenance and reading-time text uses `MIN` in every locale | **Heading fix implemented locally:** index stories use h2; landing previews retain h3. Add localized reading time and only verified author/reviewer/update/source information |
| F10 | P2 | Labs repeat generic header art while their titles wrap into narrow columns; collection pages and notebook become long on mobile | Reserve artwork space at the header level, keep titles readable, add subject/unfinished shortcuts to long collections, and group notebook evidence by activity |
| F11 | P2 | No shared UI primitive layer backs all three shells; the design-system document references a missing `src/components/ui.tsx`; global CSS contains multiple generations of styles | Extract tokens and components when those areas are next touched; update documentation to the real component locations; remove legacy styles only with visual comparison |
| F12 | P3 | No production performance baseline or field interaction data was collected in this audit | Measure representative production templates, establish budgets, then optimize the actual bottleneck; preserve the nonce-based CSP and public/portal routing boundary |

The 44px size is EducationOS's comfort target and matches WCAG's enhanced target-size criterion. WCAG 2.2 AA uses 24px with defined exceptions; the smaller original controls are not, by size alone, proof of an AA failure. See [W3C minimum target size](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum) and [enhanced target size](https://www.w3.org/WAI/WCAG22/Understanding/target-size-enhanced).

## Landing page — section decisions

The same structure was inspected at `/`, `/en`, and `/ru`. The Spanish page measured 6,528px high on the mobile baseline; Russian measured 6,709px. These are layout measurements, not proof that users abandon the page.

| Section | Keep | Next improvement |
| --- | --- | --- |
| Header / language | Explicit locale URLs and active states | Comfortable targets are implemented; next retain a discoverable learning action at tablet/mobile widths, where the header CTA currently disappears |
| Hero | Strong type, clear mission action, illustrative objects, English-demo disclosure | Shorten repeated supporting text; use one small functional paper-fold comparison if user testing supports it; keep a static fallback |
| Four principles ribbon | Fast statement of the method | Treat it as supporting content; reduce its vertical footprint on narrow screens |
| Method cards | Numbering and one action per card | Corrected destinations are implemented; show a compact real observation/example inside one card rather than adding four independent animations |
| Five age stages | Clear ranges and distinct visual shapes | Make age selection the start of a journey that carries the chosen stage into the mission |
| Paper bridge mission | Concrete materials, question, and evidence outcome | Add materials, adult support, language, and approximate duration beside the action; link into the selected stage |
| Journal preview | Image-led stories and actual article links | Keep two or three varied topics; add truthful editorial provenance; no search/filter interface is needed for four stories |
| Care section | Honest boundary around enrollment and data | Link directly to the most relevant adult explanation; keep the summary understandable without legal terminology |
| Closing CTA / footer | Consistent lime close and policy access | Avoid another new proposition; repeat the same primary learning action and make language availability explicit |

## Core pages, editorial, and policy

The localized route families below include Spanish, English, and Russian equivalents. All four articles were inspected in all three languages.

| Pages | Section-level improvement |
| --- | --- |
| `/programs` | Hero → visible stage selector; stage rows → compare age, autonomy, example task, and adult role in the same order; activity panels → carry stage into the demo; closing CTA → repeat the chosen stage |
| `/approach` | Hero → shorter promise; seven-step grid → one worked bridge example threaded through the stages; evidence notice → plain-language explanation; CTA → start the example being described |
| `/trust` | Summary → current release status first; six cards → distinguish what works today from future requirements; English policy links → clear language label; boundary note → retain before any account-related action |
| `/blog` | Hero → keep the editorial introduction; four stories → h2 semantics now fixed; add verified topic/source metadata before investing in categories or pagination |
| `see-the-invisible` | Introduction → define the observation; image → remain illustrative; prose → add reviewed sources for scientific statements; challenge → clear adult/material guidance; next story → preserve locale |
| `math-you-can-move` | Keep geometry as a manipulable idea; connect the challenge to a real geometry activity; retain article language on the route into learning |
| `paper-glider-experiment` | Make fair comparison and adult guidance easy to scan; show a tiny record-sheet example; connect to evidence rather than distance rankings |
| `program-a-paper-robot` | Show an accessible text sequence beside any diagram; connect to Loop Loom or a relevant first code activity; preserve language availability |
| All article share blocks | Keep native sharing; offer a selectable/copyable URL if sharing or clipboard access fails; localize reading-time units; add only verified Article structured data |
| `/privacy` | Update the notice through an accountable review process; separate TRIZ demo storage from portal storage; put export/clear actions beside the relevant explanation |
| `/safety` | Give adults a short materials/setup checklist before the full policy; retain experiment stop conditions and the honest support-channel status |
| `/terms` | Preserve review-draft status; supply reviewed operator/contact/version information before enrollment; use the shared public shell |
| `/accessibility` | State tested scope and known limitations by surface; add a real support contact once available; keep a clear keyboard and reduced-motion guide |

## Demo and learner workspace

| Page / section | Recommended improvement |
| --- | --- |
| `/demo` — status, age selector, mission, progress, planned worlds | Reduce status noise; give the age selector a comfortable target; lead directly into the mission; keep planned worlds visually secondary; add an explicit route to the broader subject workspace |
| `/demo/lab` — setup, seven steps, measurement, feedback | Carry the selected stage from marketing; keep materials and supervision near setup; use one primary action per step; confirm where a note was saved and move focus to the new step |
| `/demo/portfolio` — summary, filters, evidence, export | Keep evidence labels; add a readable print/export summary alongside JSON; make an empty filtered category distinct from a completely empty notebook |
| `/demo/guardian` — evidence, safety, future access | Keep current evidence first; move future infrastructure requirements into a secondary adult disclosure; avoid implying consent has been verified |
| `/portal` — resume, next activity, subjects | Keep the working resume and next activity; introduce subject choice before defaulting every new visitor to programming; show the active language |
| `/portal/subjects` — five learning paths | Add in-page subject shortcuts and a compact unfinished-work view; enlarge individual lesson link hit areas; preserve the full ordered curriculum |
| `/portal/projects` — project cards and labs | Explain what a project produces versus what a practice lesson records; use an actual example of output; keep links to the real activity |
| `/portal/labs` — three discovery cards | Show “predict → explore → explain” as the shared pattern; provide duration and interaction requirements before entering |
| `/portal/progress` — summary, evidence, export/clear | Group entries by activity/subject; prioritize unfinished work; provide a printable evidence summary; keep destructive actions separate and confirmed |
| `/portal/guardian` — support, preview boundaries, records | Show a small actual-work summary and useful conversation prompts before long explanations; make it visually distinct from the learner workspace |
| `loop-loom` | Widen the title column; keep predicted and actual output adjacent; ensure the next action remains clear after each trace step |
| `same-half` | Put the current comparison and selected amount together; retain textual amount feedback and keyboard alternatives alongside the shapes |
| `hidden-cubes` | Retain the 2D alternative and explicit optional 3D control; simplify surrounding instructions; verify gestures, zoom, and battery/performance on real mobile hardware |
| Public and portal 404 pages | English recovery now preserves English; next localize the public recovery shell and offer a second relevant destination |
| Route/global errors | Review recovery when storage is blocked or the server fails; keep retry and a safe exit; global-error styling and language need a dedicated failure-state preview |

### All 15 lesson pages

Every `/portal/learn/<id>` below returned 200 and fit both audited widths. Improvements should be made in the shared lesson workspace, then checked against each activity type.

| Lesson IDs | Activity type | Specific next improvement |
| --- | --- | --- |
| `programming-first-message`, `programming-variables`, `programming-repeat` | Code | Keep examples, input, output, and feedback visually separate; support keyboard editing and a deliberate reset; explain why output differs |
| `science-fair-test`, `science-evidence` | Choice | Keep the selected answer visible beside explanation; make retry and next activity distinct |
| `science-paper-bridge` | Physical experiment | Keep setup/adult guidance next to measurements; preserve honest zero results; clarify observation versus conclusion |
| `mathematics-patterns`, `mathematics-fractions`, `mathematics-area` | Choice | Add accessible visual representations that support the concept; keep the written reasoning available |
| `language-precise-description`, `language-short-story` | Writing | Show the minimum requirement before typing, readable live word count, and clear saved-state feedback; avoid implying word count measures quality |
| `language-strong-sentence` | Choice | Compare the original and revised sentence side by side with a clear explanation |
| `arts-patterns` | Choice | Pair the text pattern with shapes while retaining an equivalent text sequence |
| `arts-color-story`, `arts-design-brief` | Writing / design reflection | Add optional examples and a clear purpose; preserve open-ended responses rather than inventing quality scores |

## Implementation stages

Estimates are focused engineering effort for one engineer using the current assets and stack. Translation, editorial, legal, and supervised user reviews depend on appropriate reviewers and are not included in elapsed delivery dates.

| Stage | Effort | Deliverable and release gate |
| --- | --- | --- |
| 0 — correct navigation and ergonomics | Implemented locally | F01/F02/F05, journal heading hierarchy, policy-title cleanup; 320–1440px layout, actual destination, and language-continuity tests |
| 1 — one coherent first session | 2–3 days | A clear mission/subject entry, stage selection carried into TRIZ, quieter available-preview status, materials/language/duration beside the CTA; a new visitor can start and resume without guessing |
| 2 — language and editorial continuity | 3–5 engineering days plus review | Shared public shell; reviewed Spanish demo interface and curriculum first, English parity, then Russian; policy translation review; preserve URL, stage, activity, and local work |
| 3 — learner and evidence polish | 2–4 days | Wider lab headings, collection shortcuts, consistent feedback, grouped notebook, readable export; keyboard and light/dark checks plus real iOS/Android review |
| 4 — measured frontend foundation | 2–3 days | Shared tokens/primitives, removal of proven unused styles, realistic navigation/loading states, production asset/bundle baseline; optimize measured regressions and verify rollback |

Start the next sprint with Stage 1. Avoid a component-library migration, CMS, authentication rollout, or a heavy WebGL hero during this pass. Those changes do not resolve the confirmed first-session problems.

## Frontend architecture and release standards

Keep Next.js App Router, React/TypeScript, Tailwind v4, scoped CSS, Lucide, and the Python API boundary. Introduce only the files needed by the next component being changed:

```text
src/styles/tokens.css                  semantic color, type, spacing, motion, focus tokens
src/components/ui/                     Button, Field, Notice, Progress, Dialog, EmptyState
src/components/marketing/              LanguageSwitch, StageNavigator, MissionPreview
src/components/portal/                 existing learner shell and workspaces
src/content/locales/{es,en,ru}/        typed UI messages, separate from curriculum
src/content/curriculum/                reviewed age and locale variants with stable IDs
tests/e2e/                            journey, keyboard, locale, overflow and failure checks
```

Use progressive extraction from the existing dictionaries and styles; do not duplicate them into a second active implementation. Preserve route URLs, stable evidence IDs, explicit locale links, and server-owned permissions. Keep public pages predominantly server rendered. Add a loading boundary where actual waiting needs feedback; the installed Next.js navigation guide explains dynamic-route behavior. Preserve image dimensions/sizes and lazy loading; check the installed Image guide before changing asset loading. Do not turn off the CSP nonce simply to obtain static pages.

Use 44px as the control comfort target; test keyboard focus against sticky headers and mobile navigation, as described by [W3C Focus Not Obscured](https://www.w3.org/WAI/WCAG22/Understanding/focus-not-obscured-minimum). Motion should support feedback and respect reduced motion. Keep professional SVG icons and the strict no-emoji rule.

Measure production before claiming speed gains. Target p75 LCP ≤2.5s, INP ≤200ms, and CLS ≤0.1 by mobile/desktop cohort, following [Google's Web Vitals guidance](https://web.dev/articles/vitals). No field values or Lighthouse score is claimed here. Validate the chosen first-session flow with a small supervised set of adults and appropriate learners; use task completion, wrong turns, and comprehension as research observations before setting conversion goals.

## First-slice verification

The implementation adds regression checks for meaningful destinations, English continuity, comfortable targets without crowding at four widths, journal heading hierarchy, and policy title punctuation. Validation passed: lint, TypeScript, strict no-emoji check, 131 unit tests, and 16 browser tests across `display-design.spec.ts` and `learning.spec.ts`. These include locale/share behavior, mobile fit, automated accessibility, all seven TRIZ steps, five age variants, and local evidence. The changes and screenshots describe the localhost preview; no production deployment of this audit slice is claimed.
