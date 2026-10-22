# Anatomy audit for EducationOS

This is the audit recorded before implementation. The three pilot labs have since been implemented and deployed; see [implementation notes](IMPLEMENTATION.md) and [live deployment status](../DEPLOYMENT_STATUS.md). The accompanying audit evidence preserves the original inspection scope.

Anatomy is a strong candidate for authoring inspectable lesson illustrations. Adopt its SVG and isometric geometry first, then add constrained rotating geometry where depth helps a child understand the idea. Its renderer, examples and geometry checks are useful foundations; EducationOS still needs lesson models, accessible controls, assessment rules and a route-safe integration layer.

The reviewed source is [wheresryan22/anatomy](https://github.com/wheresryan22/anatomy/tree/e9488296a44211c42701ff71705b7901470ec78f), pinned to commit `e9488296a44211c42701ff71705b7901470ec78f`, inspected on 18 October 2026. The attached screenshot identifies the same short revision. Repository instructions were treated as source material for this audit. Suggested changes to agent permissions, global installations and gallery publication are not EducationOS requirements.

## Adoption decision

| Capability | Decision | Reason |
|---|---|---|
| Static vector diagrams and isometric mechanisms | Adopt for selected lessons | Clear, inspectable geometry can connect a learner's action to a visible consequence. |
| Shared model driving a picture and readout | Adopt as an authoring requirement | It prevents the animation, numbers and feedback from disagreeing. |
| Optional WebGL effects | Use after the core lesson works without them | Water or light can justify a shader; most count, fraction and code lessons do not need one. |
| Beta rotating and articulated geometry | Pilot with one small subject | Rotation can reveal hidden cubes or reconcile views. It also adds sorting, performance and lifecycle work. |
| Whole gallery embedded in the portal | Avoid | Standalone pages carry considerable art and runtime payload. Load the current lesson only. |
| Automatic idle tours and maximum visual detail | Adapt | A child needs time to predict and explain. Default to a stable state and reveal details on demand. |
| General-purpose 3D asset generation | Use a separate workflow | Anatomy has no documented mesh export pipeline for GLB, glTF, CAD or printing. |

These decisions are EducationOS product and curriculum judgments. They are not measured claims about learning outcomes or audience growth.

## What the rendering modes actually provide

**2D vector** is a flat diagram or manipulative. Fractions, code traces and transform exercises often benefit from an overhead representation. Plain SVG can be the most appropriate implementation even when the surrounding apparatus uses Anatomy styling.

**Isometric 2.5D** projects world coordinates into shaded SVG. An object can look solid without being a freely orbitable mesh. Translation and regenerated paths support many useful mechanisms at lower complexity.

**SVG with WebGL** puts transparent shader canvases between SVG layers. The effects can share the illustration's camera. This is useful for light or water; it is not a general scene engine.

**Anatomy beta 3D** changes rigid turn, slide, hinge or free-group poses, then projects and shades convex parts into SVG each frame. The active renderer updates SVG; experimental canvas files should not be treated as the established production path. [Active implementation](https://github.com/wheresryan22/anatomy/blob/e9488296a44211c42701ff71705b7901470ec78f/kit/turn.mjs), [authoring API](https://github.com/wheresryan22/anatomy/blob/e9488296a44211c42701ff71705b7901470ec78f/kit/turn-build.mjs)

**A true mesh asset** has vertices, topology, materials and an interchange format such as GLB. An external modelling workflow must produce and inspect that asset. A prompt cannot certify its dimensions, UVs, normals, topology or glTF validity. The repository tree contains no such asset pipeline. [Revision tree](https://api.github.com/repos/wheresryan22/anatomy/git/trees/e9488296a44211c42701ff71705b7901470ec78f?recursive=1)

## Strengths worth carrying into lessons

The kit encourages coherent parts, meaningful motion and numbers derived from a model. Its server/client design can keep static geometry off the interactive client path. The React example separates model, projection, geometry, server art, changing paths and a client controller. Server-built element props need stable keys, including on large streamed pages. [React integration guide](https://github.com/wheresryan22/anatomy/blob/e9488296a44211c42701ff71705b7901470ec78f/references/react.md)

Geometry verification is more substantial than an image-only review. The source checks recorded shape clearance, terminals, support, overlap and painter order, with regression tests for difficult edge cases. Those checks are valuable for a mechanism whose parts must meet correctly. They operate on the recorded representation and sampled poses; their coverage depends on the geometry and states supplied. [Geometry audit](https://github.com/wheresryan22/anatomy/blob/e9488296a44211c42701ff71705b7901470ec78f/kit/audit.mjs), [orbit sampling](https://github.com/wheresryan22/anatomy/blob/e9488296a44211c42701ff71705b7901470ec78f/kit/turn-audit.mjs)

The learning consequence is a separate check: a visually connected gear train can still teach a false ratio, a beautiful bridge can still imply invented material strength, and a correctly rendered fraction can still use unequal units. The prompt pack therefore requires semantic invariants and assessment cases as well as geometry checks.

## Integration work required in the existing portal

| Finding | Consequence | EducationOS implementation requirement |
|---|---|---|
| Standalone page builders emit inline module scripts | Copying the HTML into a route conflicts with the portal's nonce-based script policy | Use bundled React components or reviewed external assets. Preserve the existing policy; do not add `unsafe-eval` or broadly enable inline scripts. |
| Example controllers find a global stage and readout | Two instances or route changes can bind the wrong figure | Initialize from a component root ref; scope IDs, selectors, results and events to that instance. |
| The live controller is only part of the lifecycle | Route changes can leave timers, observers or frames alive | Cancel animation frames, idle timers, observers and input listeners on unmount. Test React Strict Mode and repeated navigation. |
| WebGL wrapper has no complete disposal/context-recovery API | Shader resources and a lost context need explicit handling | Add resource disposal and context-loss behaviour. Keep the same task usable as SVG/text. |
| Rendering order and animation have separate state | A frame can be visually plausible while feedback uses another value | A pure, bounded lesson model must produce geometry state, readout, narration and expected result. |

The relevant sources are the [HTML builder](https://github.com/wheresryan22/anatomy/blob/e9488296a44211c42701ff71705b7901470ec78f/kit/iso-kit.mjs), [standalone controller](https://github.com/wheresryan22/anatomy/blob/e9488296a44211c42701ff71705b7901470ec78f/examples/turning-dial/live.js), and [WebGL wrapper](https://github.com/wheresryan22/anatomy/blob/e9488296a44211c42701ff71705b7901470ec78f/kit/gl.mjs). The current portal's CSP remains in `src/proxy.ts`; the local interpreter and account boundaries remain separate responsibilities.

A suitable layout is `model.ts` for the causal rules, `geometry.ts` for build-time paths, `art.tsx` for server output, `live.tsx` for input and animation, `fallback.tsx` for the equivalent task, and `model.test.ts` for invariants. Lazy-load one interactive figure on its lesson route. Keep the portal's Learn, Activity and Result panels and existing paper/ink/lime tokens. Preserve the separation from the marketing site and `app.educationos.space` routing.

This audit supplies authoring specifications; it does not add a new `simulation` activity type to the portal. That later implementation must extend the lesson union, state validator, notebook/export format and completion rules together. A learner's prediction, settings, observed result and explanation need their own versioned evidence fields. Completion must not become true merely because the child rotated an object or clicked Play.

## Accessibility and child interaction

The React hooks already provide useful visibility, reduced-motion and animation-loop foundations. Some examples demonstrate pointer/touch capture and keyboard controls. Build on them rather than assuming the entire library is inaccessible. [Client hooks](https://github.com/wheresryan22/anatomy/blob/e9488296a44211c42701ff71705b7901470ec78f/kit/react/live.tsx), [input example](https://github.com/wheresryan22/anatomy/blob/e9488296a44211c42701ff71705b7901470ec78f/examples/test-rig/live.tsx)

Several presentation details need adaptation. The React Plate's corner title, hint and readout are marked `aria-hidden`. Essential lesson text and results therefore need separate accessible HTML. Some standalone tours resume automatically after 3.6 seconds; this can change the state while a learner is explaining it. [Figure markup](https://github.com/wheresryan22/anatomy/blob/e9488296a44211c42701ff71705b7901470ec78f/kit/react/draw.tsx), [idle controller](https://github.com/wheresryan22/anatomy/blob/e9488296a44211c42701ff71705b7901470ec78f/examples/turning-dial/live.js)

For EducationOS, provide native labelled controls, a visible current value, explicit Step/Play/Pause/Reset where relevant, and an accessible explanation of the current state. Default to paused. Reduced motion should change state without continuous movement; it must preserve the problem and its feedback. Let children scroll on touch screens without accidental scene manipulation. Do not hide a required action behind hover, colour alone, or tiny engraved lettering.

Local browser inspection of both light-theme examples at 390px found actual contrast failures: title/hint text at approximately 3.23:1 and legend/caption text at approximately 2.98:1, below the scanned 4.5:1 requirement for their text sizes. Both examples fit the viewport, responded to keyboard input and rendered without page exceptions, including with WebGL disabled. The reduced-motion preference was requested during these checks; it is not a certification that all example motion is eliminated. The dial indicator still uses a critically damped settling animation under its reduced-motion branch. These findings support adapting the controls and type palette rather than copying the pages unchanged. Evidence is preserved in `audit-evidence.json` and the recorded browser report.

The source's preference for elaborate mechanisms and label-free imagery is an artistic choice. For children, reveal secondary construction details only when useful. A purposeful label or clear overhead inset can teach more than another decorative screw. Recommended starting layouts use one causal question, one main model, one changing quantity and one short result.

## Performance and payload

The following are measured file sizes from the pinned source, in bytes before compression. They are complete self-contained HTML examples, not the incremental size of a well-split Next.js route.

| Example | Bytes |
|---|---:|
| Dial indicator | 136,489 |
| Desk computer | 237,394 |
| Ripple tank | 505,499 |
| Turning dial | 673,894 |
| Arcade cabinet | 1,007,953 |
| Raptor engine | 1,610,583 |

The size spread is a practical reason to measure each new lesson and avoid loading all examples together. A small interactive model should earn its payload by helping answer a learning question. The full 3D reference is explicitly beta and its dense stress scene is not a target for children's phones. [3D performance guidance](https://github.com/wheresryan22/anatomy/blob/e9488296a44211c42701ff71705b7901470ec78f/references/3d.md)

Proposed pilot budgets are one active subject, no WebGL for the first three pilots, and no more than 36 live primitive parts for the 12-cube model. Those are EducationOS authoring limits, not published guarantees. Test the final route at phone and desktop widths, high device pixel ratio, throttled CPU and on a representative lower-end device. Record frame-time percentiles and interaction latency under named conditions. If the target device struggles, the equivalent 2D interaction must remain available.

The included Node timing tool measures geometry emission and ordering, not DOM updates, SVG paint, shader work or end-to-end browser frames. Its result cannot establish phone frame rate. [Timing implementation](https://github.com/wheresryan22/anatomy/blob/e9488296a44211c42701ff71705b7901470ec78f/scripts/turn-bench.mjs)

In this audit, the 88-part turning-dial reference reported 5.597 ms wall time and 5.104 ms CPU time per generated frame across 360 angles and two rounds in Node 24.12.0 on the local macOS host. This is a limited local geometry benchmark, not a browser frame-rate result. The complete geometry/orbit audit and real-device performance remain distinct checks.

## Science and analogy accuracy

For the bridge lesson, keep recorded observations as observations. Do not invent a material model or generate a believable collapse-time prediction from fold count. A visual fold model can explain shape; the child's real comparison supplies the trial data.

The supplied ripple tank has a particular gravity-capillary dispersion model, with `omega² = (gk + (surfaceTension/density)k³) tanh(k depth)`. Wavelength and phase speed change with the model settings. A lesson that changes frequency while teaching constant water-wave speed would contradict this implementation. Start younger learners with source spacing at fixed frequency; reserve the dispersive relationship and `v = f lambda` for an advanced extension. Projected light patterns must not be described as identical to surface height. [Actual wave model](https://github.com/wheresryan22/anatomy/blob/e9488296a44211c42701ff71705b7901470ec78f/examples/ripple-tank/model.mjs)

Every physical analogy needs a sentence about where it stops. A mechanical loom can represent a loop's repeated instruction but does not show every feature of a programming language. Rotation changes which cubes are visible; it does not change their number. A colour/mood activity should invite an explanation rather than declare one culturally universal correct palette.

## Verification scope

The pinned CI workflow runs regression scripts and rebuilds examples. A successful workflow is useful evidence of that scope. It does not run every full geometry/orbit audit, an accessibility audit, or tests of child comprehension. [Workflow definition](https://github.com/wheresryan22/anatomy/blob/e9488296a44211c42701ff71705b7901470ec78f/.github/workflows/ci.yml)

Local audit commands and results are recorded in `audit-evidence.json`. A verify-enabled build emits data for later checks; it is not itself a full orbit audit. No partial, quick or omitted check should be described as a full geometry pass. An eventual lesson release needs three kinds of evidence: the causal model is correct, the rendered object behaves as specified, and learners can use it to explain or transfer the idea.

The executed subset passed 35 regression tests across six files after browser startup was allowed outside the sandbox. The dial-indicator light build and the turning-dial verify-enabled light build also completed. These are useful reproduction checks at the pinned revision; they are not a rerun of the complete upstream suite or a claim that a new EducationOS model has been implemented.

## License and distribution

The pinned repository uses the MIT license. If EducationOS distributes copied kit code or substantial portions, preserve Ryan's copyright and permission notice in the vendored code and third-party notices, including downloadable source bundles. Keep a commit reference and a record of local changes so fixes can be compared with upstream. This audit and its original prompt briefs do not require copying the complete gallery into the application. [License text](https://github.com/wheresryan22/anatomy/blob/e9488296a44211c42701ff71705b7901470ec78f/LICENSE)

## First three classes

1. **Loop Loom:** Programming and Arts. A finite pattern body and repeat count produce a sequence with an exact length. The learner predicts, runs, traces and repairs the program.
2. **Same Half Different Shape:** Mathematics. Equal-area overhead grids make equivalent fractions comparable, with an unequal-parts counterexample.
3. **Twelve Cubes:** Mathematics and spatial design. Twelve exact unit cubes form a 3 by 2 by 2 block. Rotation and a layer view reveal why hidden does not mean absent.

Together these pilots exercise code, vector comparison and meaningful depth without relying on shaders, simulated breakage or dense machinery. The [class plan](CLASS_PLAN.md) expands the sequence across five subjects. The [prompt pack](PROMPTS.md) specifies the authoring contracts, exact pilot behaviour and independent review.
