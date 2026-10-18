# EducationOS design system · v0.5.0

## Learner portal addition

The separate `/portal` surface uses `src/components/portal/portal-shell.tsx` and scoped `portal.css`. It retains paper, ink and lime while keeping learner navigation separate from the public site. Today, Subjects, Projects and My progress are primary; the adult overview is a secondary entry. The learner brand returns to the learner home.

The home leads with a real next activity and visible subjects. Lessons share a goal/instruction/activity/feedback/reflection structure, with code, choice, writing and investigation workspaces. At mobile widths, Learn/Activity/Result panels replace side-by-side workspaces. Drafts, counts, feedback and output are real browser-local state; activity completion never implies mastery. Light/dark appearance is scoped to the portal, without changing the marketing theme.

Portal text and form controls prioritize legibility and touch targets. Essential information is immediately readable; theme changes do not animate backgrounds against instantly changing foregrounds. No decorative typing animation delays output. See [PORTAL.md](PORTAL.md) for behaviour and limitations. The remaining sections preserve the original demo's design record.

The learner interface pairs generous space and charcoal typography with lime. Adult views use the same components with soft peach surfaces and an editorial Georgia display style. The system uses locally available system fonts, so the demo does not contact a font provider.

## Tokens

| Role | Value |
| --- | --- |
| Canvas | `#f6f7f4` |
| Surface | `#ffffff` |
| Ink | `#252923` |
| Secondary text | `#646b60` |
| Border | `#e1e5dd` |
| Learner accent | `#d9f778` |
| Adult accent | `#f3dcd1` |
| Focus ring | `#426625` |
| Error text | `#a52d30` |
| Card radius | `20px` |
| Button radius | `9px` |
| Body type | Arial, Helvetica, system sans serif |
| Adult display type | Georgia, Times New Roman, serif |

Use charcoal text on lime. Accent backgrounds carry meaning through text or icons as well as color. Avoid pale secondary text on colored backgrounds. Adult prose remains set in the sans serif body face for legibility; the serif is reserved for larger headings.

## Components

Reusable components live in `src/components/ui.tsx`; tokens and layout rules live in `src/app/globals.css`.

- `Button` accepts standard button properties and `variant="primary" | "secondary" | "ghost" | "danger"`. Its default type is `button`; opt into `type="submit"` when needed. Buttons are at least 44px high. An icon-only button needs an accessible name.
- `Card` accepts standard `div` properties. Select semantic headings and landmarks in the calling view rather than assigning a generic role to every card.
- `Badge` accepts span properties and `variant="default" | "lime" | "peach"`. It presents a state but does not act as a control.
- `Field` accepts `label`, `htmlFor`, optional `hint`, and form-control children. The control must use the matching `id`. When a hint exists, add `aria-describedby="<control-id>-hint"` to the control. Put validation messages in an announced error region and connect a field-specific error with `aria-describedby` when applicable.
- `Progress` accepts a numeric percentage and an accessible `label`. It clamps invalid or out-of-range values and exposes progressbar semantics. It represents recorded workflow completion, not inferred mastery or ability.
- `EmptyState` accepts `title`, `description`, and optional action children. It invites a clear next action without suggesting data exists when it does not.

## Iconography

Frontend content must contain no emojis. Use `lucide-react` for interface icons, generally 16–24px with a 1.5–1.8px stroke. Hide decorative icons from assistive technology with `aria-hidden="true"`; provide text or an accessible name for controls. The brand and science illustration may use original SVG geometry. Icons must remain recognizable at their rendered size. Do not use an icon as the sole means of communicating a warning or success state.

## Accessibility and responsive behavior

- Visible keyboard focus uses a 3px ring with a 4px offset. Never remove focus without an equivalent indicator.
- Touch targets are at least 44px. Mobile form fields use 16px text to avoid automatic viewport zoom.
- Navigation uses text labels and marks the active destination. Step navigation distinguishes current and complete steps with text/semantics as well as appearance.
- Form labels are persistent. Placeholder text supplements the label. Instructions and errors remain readable without hover.
- The sidebar becomes a persistent bottom navigation below 680px. The main document preserves space beneath it, including device safe-area padding.
- Content grids collapse from multiple columns to a single column. Lab navigation uses a compact two-column step grid on mobile so supervision instructions remain visible. The document itself should not require horizontal scrolling at 390px.
- Respect `prefers-reduced-motion`. No essential information depends on motion, hover, or color alone.
- Test keyboard order, focus placement after screen changes, announced validation, screen-reader labels, and 200% text zoom before extending the demo to real users.

## Content boundaries

Demonstration learning evidence is described as recorded work, never as verified ability. Adult views must state the demo's implementation limits clearly. No design element should imply that authentication, safeguarding, consent, or child privacy compliance has been certified. Use fictional examples and avoid requesting real names, contact information, dates of birth, school identities, media, or other child data.
