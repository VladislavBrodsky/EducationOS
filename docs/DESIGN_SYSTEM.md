# EducationOS design system

The shared visual language uses white space, near-black type and a lime science-world accent. Adult pages use restrained editorial structure; the learner demo adds clear cards, progress and age-adapted scaffolding. Layout and graphics are independently implemented; unavailable historical design archives are documented in [BASELINE.md](BASELINE.md).

## Shared tokens

Tokens are defined in `src/app/globals.css` and exposed through Tailwind's theme. Use tokens rather than introducing a competing palette.

| Role | Value |
| --- | --- |
| White surface | `#ffffff` |
| Paper surface | `#f7f8f2` |
| Ink | `#171a16` |
| Muted text | `#62685c` |
| Border | `#e0e3d9` |
| Lime accent | `#d5fc51` |
| Base radius | `16px` |
| Body/display font | Arial, Helvetica, sans-serif |

Use ink on lime and legible dark body text. Color is never the sole signal of completion, error or selected state. The font stack is local and does not require a third-party font request.

## Components and structure

`src/components/site-shell.tsx` provides the public shell and navigation. `src/components/science-art.tsx` provides original science-themed SVG geometry. Learner components live under `src/components/demo`; `DemoShell` and `DemoProvider` manage the shell and synthetic age-band/progress state, with measurement inputs, data actions and original `BridgeArt`. Their styles are scoped with `demo-*` classes in `src/components/demo/demo.css`. Check the actual component interfaces before extending them; there is no parallel general-purpose `ui.tsx` system in this release.

Reusable `.button`, `.pill`, `.notice`, `.program-card` and content-layout styles provide a shared baseline. Render proper semantic headings, landmarks and labels at the call site. Public pages use a spacious editorial grid and collapse to a single reading column on small screens.

## Iconography and accessibility

Frontend content contains no emojis. Use Lucide SVG or original vector geometry, generally 16–24px with restrained stroke weight. Hide decorative icons from assistive technology. Icon-only controls need an accessible name, and status must have readable text.

Keyboard focus is visible with a three-pixel outline and offset. Provide a skip link, persistent field labels, connected help/error text, announced state changes and large touch targets. Keep fields legible on phones and preserve a single reading column without horizontal overflow. Reduced-motion styles disable nonessential transitions and animated scrolling. Inspect forced colors, 200% zoom and screenreader use before any enabled pilot.

The demo uses a sticky 238px sidebar on desktop, a header/horizontal navigation below 760px, stacked hero content below 520px and a horizontal mission stepper below 960px. Forms become one column and buttons retain usable touch targets. Guardian tabs support arrow keys, Home and End. Drafts use per-age-band `sessionStorage`, validate stored input and recover malformed state; export includes only the selected age band and clear removes all demo drafts in that browser session.

The responsive implementation and screenshots are validated in [QA.md](QA.md). Automated checks support review and do not establish full accessibility conformance or child usability.

## Honest learning language

Progress means recorded workflow completion. Evidence means synthetic work entered in the demo, not verified mastery or a learning-efficacy claim. Guardian views explain the unfinished identity, consent and operations gates. No visual element should imply certified safety, verified parental consent, active child enrollment or a live deployment when those controls are unavailable.
