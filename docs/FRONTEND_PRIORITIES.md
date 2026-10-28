# Frontend improvement plan — 28 October 2026

## Decision and scope

Keep the white, black and lime identity, contextual AR illustrations and working tasks. Prioritize a clear path from discovery to participation: consistent language, useful previews, honest evidence states and less reading before an activity.

Only the two homepage portfolio/code cards are implemented in this release. The remaining items below are a prioritized backlog. Estimates are focused engineering days for one developer; translation, curriculum and legal review need separate reviewers.

## Audit evidence

Captured 59 content routes and four missing-route cases at 390px and 1440px, plus eight representative portal dark-mode views: **63 routes, 134 captures**. Coverage includes ES/EN/RU marketing and four journal stories per language, four policy pages, four demo screens, six portal screens, all 15 lesson routes and all three discovery labs.

Final captures waited for learner storage initialization and demo curriculum status. All content routes returned 200; missing-route cases returned 404. No horizontal overflow, failed visible images or page errors were detected in this set. Representative templates and sections were inspected visually; changed cards were additionally checked at 320, 560, 768 and 1440px in all three languages.

Local evidence: `../../deliverables/frontend-audit-2026-10-28/audit.json`, screenshots and `capture.cjs`. A separate portal viewport screenshot confirmed artwork that a full-page capture omitted after scrolling; do not treat capture artifacts as product defects. The local demo used bundled lessons when its lesson service was unavailable; this does not establish a production outage.

These checks do not certify every activity state, screen reader, physical device or browser. Production Core Web Vitals and user conversion/completion rates were not measured. Recommendations are engineering judgments from the inspected UI and source, not measured growth results.

## Completed first: the two homepage learning cards

The former portfolio teaser showed a completed checkmark without learner work. Staggered rows, an unrelated dark code slab and different code from the real lab weakened the meaning of the previews.

The replacement has consistent icon/category headers, short benefit statements, explicit example labels and aligned actions. The notebook shows a concrete question, comparison and next attempt. Loop Loom uses its own source generator and instructions: three repetitions produce six outputs. Each card is one accessible link to its actual destination. Narrow layouts stack the cards; no preview pretends to run a task.

Validation: all locales at four widths, both destinations, automated card accessibility, lint, types and no-emoji checks, plus visual inspection. Activity completion rules and recorded work are unchanged.

## Public pages and sections

P1 = next delivery; P2 = following delivery; P3 = after usability evidence.

| Page or section | Observed friction and proposed change | Priority / acceptance |
|---|---|---|
| Shared header, mobile menu, language selector, footer | Policy pages switch to an older English shell. Use one public shell and consistent destination labels; preserve language/equivalent routes where supported | P1 — keyboard dismissal/focus, active page, 320px and long RU labels pass; unsupported-language destinations labeled |
| Homepage hero | The new hook, benefits and localized two-step entry give a concrete promise. Keep them; clarify the difference between header full-mission entry and hero mini-challenge | P2 — visitors can explain what is available now; headset art never implies working AR support |
| Homepage method strip | Four practices need a concrete connection to action. Pair each with a miniature bridge example and relevant challenge step | P2 — every claim maps to a real action or observation |
| Homepage age overview | The stage choice needs clearer adult support and guidance differences. Carry an explicit demo-stage selection to the mission | P1 — selected guidance opens without collecting a child's age or identity |
| Homepage bridge challenge | Success/error/edit/reset logic already exists. Refine feedback hierarchy and next-step guidance after adult usability sessions | P2 — invalid/corrected/edited/reset paths stay correct in ES/EN/RU; physical experiment is never marked verified |
| Homepage portfolio and code previews | Replaced misleading completion cue, inconsistent content and action hierarchy in this release | DONE — responsive, labeled examples with real working destinations |
| Homepage visual worlds | All eight AR scenes now have distinct localized browser missions. Keep the distinction between illustrative AR and actual browser controls; deepen examples after curriculum review | P2 — touch/keyboard selection, useful text alternative and honest availability |
| Homepage journal preview, trust summary and final invitation | Repeated entrances lead to different surfaces. Give each a contextual destination and clear activity language; retain privacy-safe sharing | P2 — no unexpected language/surface switch or sharing of learner work |
| Programs: `/programs`, `/en/programs`, `/ru/programs` | Five long illustrated rows all link to the same unselected demo. Add compact age jump links and comparable task/materials/adult-help summaries; pass chosen stage | P1 — all five choices open matching reviewed guidance; focus reaches the task |
| Approach: corresponding `/approach` routes | Seven equally weighted cards include a lone final card and large empty areas. Use one worked bridge example with compact steps and expandable mobile detail | P2 — question → test → evidence → transfer is easy to follow; learning rules stay intact |
| Trust: corresponding `/trust` routes | Six similar cards repeat “read more” and send ES/RU readers into English details. Group by available features, storage, adult help and account limits; use specific link labels | P1 — parents find practical limits in supported languages; no unreviewed compliance badges |
| Journal index: corresponding `/blog` routes | Four stories fit a small collection, while the hero dominates the initial mobile view. Bring the first story closer and clarify subject/activity relationships | P2 — category/time remain scannable; search/filter UI deferred until volume requires it |
| All four articles in each language | Materials and experiment prompts exist, previously every main activity CTA went to the paper bridge. Now all four article CTAs and their header/mobile entrances open their own translated missions; contextual adult-help review remains | IMPLEMENTED — four distinct ES/EN/RU browser missions; see HERO_VISUALS.md |

## Demo and guardian screens

| Screen | Observed friction and proposed change | Priority / acceptance |
|---|---|---|
| Demo shell: all `/demo/*` | Mobile navigation, age selector, privacy note and lesson status stack before the task. Condense persistent chrome; retain essential safety and put background explanation in an accessible disclosure; localize the full path | P1 — less scrolling to current task; offline retry, storage notice and adult help remain reachable |
| `/demo` | One available mission competes with two planned worlds; layout differs from the portal. Emphasize start/resume, demote planned content and clarify the purpose of this seven-step experiment | P1 — visitors find the right next action; planned worlds do not look available |
| `/demo/lab`: seven steps, five guidance stages | Text instructions and minimum-length guidance dominate the opening. Add a worked diagram, shorter instructions and optional examples; show specific field-level recovery | P1 — invalid/edit/reset/resume paths work; fair-test conditions remain visible; no invented mastery |
| `/demo/portfolio` | A check icon appears next to 0/7 and export is JSON-oriented. Use neutral empty/in-progress indicators, prioritize missing evidence and add readable print/export alongside JSON | P1 — zero never looks complete; empty/partial/recorded/storage-failure/clear-cancel states are distinct |
| `/demo/guardian` | Three tabs and repeated explanation compete with actual notes and controls. Lead with recorded evidence, a question to ask and current limits; keep detailed readiness information secondary | P2 — adults inspect real demo notes; no implication of authenticated oversight or validated consent |

## Portal screens

| Screen | Observed friction and proposed change | Priority / acceptance |
|---|---|---|
| Portal shell: all `/portal/*` | English-only navigation and differing terminology after localized discovery. Reuse semantic tokens and localize shell, feedback and data controls together; persistent mobile navigation already exists | P1 — locale survives navigation; focused controls and actions stay clear of fixed bars/software keyboard |
| `/portal` | Resume is implemented; changing a subject updates the activity above the grid. Strengthen confirmation and put an “open next activity” action near selection | P2 — keyboard/touch users see what changed and can start/resume without searching above |
| `/portal/subjects` | Five complete paths create a long mobile page. Add subject jump links and clearer current/recorded states with an optional compact overview | P2 — all 15 lessons and three labs remain reachable; completion never implies mastery |
| `/portal/projects` | Buttons open subject paths rather than distinct project workspaces. Explain that relationship, show the first activity and expected take-away; defer a project workspace until its artifact model exists | P2 — action labels describe destinations and progress derives from actual work |
| `/portal/labs` | Three activities share generic decorative object artwork. Give each a compact diagram of its real task, duration and first action | P2 — previews match actual models; no unnecessary filter for three items |
| `/portal/progress` | Five zero counters and repeated decoration precede an empty notebook. Lead with the notebook/start/resume action, condense counters and improve readable export and clear confirmation | P1 — empty/draft/recorded/reload/storage-failure/export/clear-cancel states have useful feedback |
| `/portal/guardian` | General explanation is separate from activity context. Offer practical prompts tied to recorded demo work and align storage/boundary guidance with demo guardian | P2 — no real-profile or verified-assessment implication; adults find a useful next question |

## All lesson and lab templates

| Routes / template | Proposed improvement grounded in current UI | Priority / acceptance |
|---|---|---|
| `programming-first-message`, `programming-variables`, `programming-repeat` | Goal/explanation precede the workspace and mobile Learn/Activity/Result tabs split the workflow. Add an obvious “try it” transition, compact expected-output example and helpful error location; retain practice-language limits | P1 — wrong/corrected/edited code, result focus, saved draft and next activity pass for each |
| `science-fair-test`, `science-paper-bridge`, `science-evidence` | Text-heavy fair-test and recording instructions need diagrams. Distinguish static “things to check” from completed criteria; put field errors beside inputs | P1 — zero/lower-than-predicted results remain valid; recording does not certify an experiment |
| `mathematics-patterns`, `mathematics-fractions`, `mathematics-area` | Connect explanations to visible objects with small manipulable examples or equivalent static diagrams; link relevant labs | P2 — text/keyboard alternatives teach the same concept; answers retain existing checks |
| `language-precise-description`, `language-strong-sentence`, `language-short-story` | Text requirements can feel like word-count tasks. Add short before/after examples and concrete self-review prompts | P2 — feedback distinguishes recording from assessment; instructions/errors localized |
| `arts-patterns`, `arts-color-story`, `arts-design-brief` | Visual subjects rely on written explanation. Add original examples, accessible swatches/patterns and a clear offline-making step | P2 — colour is never the only cue; distinguish saved plan from work made offline |
| `/portal/labs/loop-loom` | Long all-stage page and constrained desktop title. Compact prediction → exploration → explanation; keep source/output beside controls and improve title width | P1 — predict, repeats, step/run/pause, explanation, transfer, error/retry pass; reduced motion retains manual stepping |
| `/portal/labs/same-half` | Strengthen hierarchy between whole, selected area and explanation; improve selection/focus cues and explain which edits reset evidence | P2 — keyboard selection, equivalent arrangements, correction and new-case checks pass |
| `/portal/labs/hidden-cubes` | Keep active layer, dimensions, count prompt and view controls close together on small screens; retain camera guidance and 2D fallback | P2 — keyboard rotation, layers, 2D/3D fallback, hidden-cube reasoning, transfer and edited answers pass |

## Policy and recovery pages

| Page | Next change | Priority / acceptance |
|---|---|---|
| `/privacy` | English-only older shell and long reading flow: add storage/data/control summary, section links and reviewed localized detail | P1 — text matches deployed behavior; owner confirms operator/contact/retention facts |
| `/safety` | Translate essential adult/material guidance first and link it beside relevant task controls | P1 — limits understood before starting; specialist review still required |
| `/terms` | Shared policy layout, plain-language demo scope summary and section navigation | P2 — purchase/account availability accurate; no invented legal assurance |
| `/accessibility` | Make supported controls, current limitations and test scope scannable; add reporting route only once an owner/channel is confirmed | P2 — distinguish automated checks from assistive-technology testing; contact verified |
| Public/portal 404, unknown lesson/lab; loading/error boundaries | Recovery already returns correct 404s. Add locale/context-aware return or resume links and consistent loading/error components | P2 — correct status, usable focus, no host surprise and no draft loss |

## Shared frontend and visual rules

- Consolidate semantic button/field/card/feedback/focus/spacing/colour tokens while touching each template. Preserve surface-specific composition; remove obsolete overrides in that scope rather than rewrite all CSS.
- Keep the icon rail, finite entrances, pause and reduced-motion path. Magic UI documents progressive blur for scrollable content. Retain it at overflow edges; our recommendation is to avoid blur over instructions, errors and model controls. [Component reference](https://magicui.design/docs/components/progressive-blur).
- Use examples for previews and reserve completion checks for actual validated/recorded work. Every activity needs empty, invalid, corrected, successful, edited and reset/resume states.
- Keep 44px primary controls as a product target. WCAG 2.2 AA sets a 24×24 CSS-pixel minimum with exceptions; 44px is not a blanket AA requirement. Verify focus, zoom, reflow, translations and fixed navigation. [W3C target guidance](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html).
- Baseline production image/JavaScript/blur/3D costs before adding effects. Where field data exists, target LCP ≤2.5s, INP ≤200ms and CLS ≤0.1 at the 75th percentile. Lab diagnostics are not field proof. [Web Vitals guidance](https://web.dev/articles/vitals).
- Keep contextual AR concepts, original task diagrams and white/transparent compositions. Inspect hands/tools, cutout edges and mobile crops. No emojis, fake testimonials, unsupported hardware claims or decorative mastery scores.

## Delivery roadmap

| Stage | Scope / owners | Focused effort | Gate |
|---|---|---|---|
| 0 — current | Frontend: two homepage preview cards | Completed implementation | CI, live card/link check and final screenshots |
| 1 — entry friction | Frontend: selected-age handoff, relevant article destinations, compact demo chrome, neutral empty-state indicators and mobile activity entry | 3–5 days | Start/resume/error/correction/record/edit and mobile keyboard paths |
| 2 — complete language journey | Frontend + native editors: shell, mission, essential safety, guardian, errors, exports/recovery; extend lessons/labs in small reviewed batches | 5–8 engineering days plus editorial review | Complete ES/EN/RU path for each batch, including success and errors |
| 3 — page clarity | Frontend + curriculum owner: programs comparison, compact approach, trust/policy summaries, project-path clarity, subject jumps and contextual art | 4–6 days | Adult usability review, curriculum/safety review |
| 4 — activity templates | Frontend + curriculum owner: code/science first, then maths/writing/art and labs; shared evidence-state components | 5–8 days | Synthetic full journeys, keyboard/2D fallback and draft recovery |
| 5 — verify and reprioritize | Frontend + product: production performance, physical-device/screen-reader checks and moderated adult usability | 2–3 days plus session availability | Observed failures resolved before more effects; data collection separately reviewed |

**Recommended next implementation:** selected-age mission handoff, contextual article links, then compact mobile demo chrome and honest empty-state indicators. Begin translation infrastructure alongside this, releasing only reviewed translations.

For every batch, inspect screenshots after initialization, exercise an error and recovery, verify focus and long translations, run relevant existing tests and deploy only the changed surface. Enrollment and unrestricted AI remain closed. This backlog requires no new backend, analytics service, child profiles or payment flow.
