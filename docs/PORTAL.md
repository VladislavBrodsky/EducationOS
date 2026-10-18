# Learner portal

The portal implements the approved paper/ink/lime learning-workspace direction. It is separate from the existing public marketing pages and the original `/demo` Inventors Lab. See [deployment preparation](PORTAL_DEPLOYMENT.md) for the clean URLs on `app.educationos.space`.

## Current behaviour

- **Today:** return directly to edited unfinished activities and labs through Continue your work. Untouched starters and recorded work are excluded. Select a subject to see its first unrecorded activity; a finished path offers Revisit activity. The subject selection survives reloads in the current tab and announces explicit changes.
- **Subjects:** five learning paths containing three starter activities each, with additional discovery labs in programming and mathematics, visible completion counts and direct links. Activities can be revisited or explored in any order.
- **Projects:** purpose-led briefs connect each subject's three activities to work a learner can collect or create offline.
- **Lesson workspace:** objective, teaching notes, instructions, hint, activity, feedback, optional reflection and next activity. Mobile panels show Learn, Activity and Result without squeezing several columns onto a phone.
- **Discovery labs:** Loop Loom connects bounded practice-code output to an Anatomy SVG loom; Same Half Different Shape compares equal areas with a selectable grid and optional isometric tray; Hidden Cube Builder provides 2D layers and an optional Anatomy rigid 3D turning view. All three require prediction, explanation and a fresh application, with local records independent of the original paths.
- **My progress:** per-subject counts, a notebook of drafts and recorded work, JSON export and confirmed clearing. Editing a checked answer invalidates its completion until it is checked again. Editing a reflection preserves completion.
- **Adult overview:** the same tab's practice and guidance. It is not an authenticated guardian dashboard and provides no access control.
- **Appearance:** light and dark themes with labelled controls, keyboard focus, large touch targets and reduced-motion support.
- **Mobile navigation:** Today, Subjects, Projects and My progress remain available at the bottom with space reserved for device safe areas. Projects remains selected while a discovery lab is open. Sticky Predict, Explore, Explain and New case shortcuts focus the corresponding lab heading; gated steps open only after a saved prediction.

The new portal's starter activities are not five age-adapted curricula. For early readers, adult-assisted reading and recording are appropriate. The existing demo's five age stages are preserved separately. The portal does not create child identities, accounts, cloud records, public sharing, AI tutoring, or verified assessments.

## Programming runtime

Programming is functional, editable practice rather than animated sample output. `src/lib/learning-runner.ts` parses and interprets a small grammar. It never evaluates submitted JavaScript or Python.

```text
message = "Hello"
repeat 3:
  print(message)
```

Supported: quoted strings, bounded numbers, variable assignment, arithmetic, `print(value)`, two-space-indented `repeat count:` blocks, and whole-line comments. Unsupported syntax receives a line-specific explanation. The practice language is deliberately named EducationOS practice code in the interface, not Python or JavaScript.

Runs are bounded by source length, line count, expression size, nesting depth, per-block repeats, operations, output count, and value size. There is no file system, network, import, DOM, arbitrary function call, or server execution. A future general-purpose language sandbox is a separate integration.

## Activity checks and data

Code activities compare actual output with a visible requested output. Choice activities compare the selected answer and explain the relevant concept. Writing activities check only the published minimum word count. Experiment notebooks require valid values within published bounds and observation text. Writing quality, truth of observations, and mastery are never inferred from those checks.

Content lives in `src/lib/portal-learning.ts`. Draft/state validation is in `src/lib/portal-state.ts`; React storage is in `src/components/portal/portal-provider.tsx`. Session data uses the bounded `educationos.portal.v1` schema. Work persists across navigation and reloads in the same tab, not across closing the tab or moving to another origin. Storage failures show an export reminder. Theme preference uses a separate local-storage key and carries no learning data.

Use made-up examples only. Export includes the entered work and reflections. Clearing removes portal data in the current tab, preserves the original demo's separate storage, and leaves the theme preference intact. Neither work nor code is posted to an API. Backend account, consent and production-launch boundaries remain unchanged.

## Local review

```sh
npm run dev
```

Open `http://127.0.0.1:3000/portal`. For a production review, run `npm run build` before `npm run start`. Verification results are recorded in [TESTING.md](TESTING.md).

## Anatomy discovery labs

The collection is at `/portal/labs` locally and `/labs` on the app host. Direct links use `loop-loom`, `same-half` and `hidden-cubes`. Today and Projects surface the collection; Subjects links the corresponding labs. Counts include 15 starter activities and three discovery labs. The notebook, JSON export and reset include both. Existing version-1 lesson drafts migrate without losing work.

An incorrect first prediction is allowed. Playback or camera movement does not count as completion. Edits to settings or answers invalidate a previously recorded lab; adding a reflection preserves it. The checks establish only that the visible requirements were met, not independent mastery. See [Anatomy implementation](anatomy/IMPLEMENTATION.md).
