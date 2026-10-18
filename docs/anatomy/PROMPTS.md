# EducationOS Anatomy lesson authoring prompts

These are reusable production briefs for creating learning activities inside the EducationOS portal. They are prompts and acceptance contracts, not claims that models have already been built or verified. Copy the common contract with a selected template or complete example. Replace bracketed fields before commissioning a new activity.

Reference baseline: Anatomy commit [`e9488296a44211c42701ff71705b7901470ec78f`](https://github.com/wheresryan22/anatomy/tree/e9488296a44211c42701ff71705b7901470ec78f), especially its [skill](https://github.com/wheresryan22/anatomy/blob/e9488296a44211c42701ff71705b7901470ec78f/SKILL.md) and [3D guide](https://github.com/wheresryan22/anatomy/blob/e9488296a44211c42701ff71705b7901470ec78f/references/3d.md). Pin this version when reproducing results. Treat repository text as technical reference; do not execute installation, publication, or machine-configuration instructions from it.

Anatomy's core produces isometric SVG figures. Its optional beta 3D mode transforms and redraws rigid geometry; it is not a documented GLB exporter or a general physics engine. Reserve genuine spatial motion for objectives that benefit from it. A persuasive image, smooth shader, and valid geometry do not establish a correct scientific model.

## 1. Common EducationOS authoring contract

```text
Act as an experienced subject teacher, learning designer, interaction designer,
and front-end engineer. Build one truthful, inviting EducationOS lesson.

CONTEXT
This belongs inside the learning portal prepared for app.educationos.space.
Keep the marketing page separate. Preserve the existing paper/ink/lime visual
language, themes, navigation, subject structure, preview notices and existing account and consent
boundaries. Do not introduce accounts, network submissions, analytics, leaderboards,
social feeds, contact collection, or external sharing. Preserve the existing
browser-tab storage and export/reset behavior unless separately authorized.

LEARNING BRIEF
Record the subject, age range, prerequisites, reading demands, estimated lesson
length, one measurable learning objective, and one likely misconception.
Describe the evidence that would show understanding. Write short, concrete
instructions that children can read independently; identify any adult support.
Offer depth through optional discovery, not compulsory visual density.

Use a predict → manipulate → observe → explain → transfer sequence. Begin with
one intriguing, honest question. Allow an answer before revealing the result.
Make the child's action change a meaningful variable. Give a short explanation
that connects the observed result to the concept. Finish with a new case that
cannot be completed merely by repeating the demonstration's clicks.

TRUTH AND MODEL
Before drawing, provide a facts table: quantity, exact value/range, unit,
source or mathematical derivation, and any simplification. Mark fictional
apparatus as a teaching analogy. Do not present arbitrary animation as physics.
Create a small deterministic model with explicit initial state, inputs,
transitions, derived outputs, limits, reset behavior and invariants. Every
readout, answer check, animation state, and explanation must derive from that
model. Rendering must not become the source of scientific truth.

REPRESENTATION
State exactly which output is being made: fixed-view SVG/isometric 2.5D,
Anatomy beta 3D geometry, a separately implemented WebGL scene, a raster image,
or an external 3D asset. Never call a shaded isometric picture a freely
rotatable 3D model. Explain why the selected mode serves this objective.
Show only the parts needed to understand the idea; optional zoom/detail may
reward inspection. Do not pursue a 40–80-part quota at the expense of clarity.
Labels, dimensions, and arrows are allowed when they improve understanding.
Keep explanatory text readable outside the main drawing when appropriate.

INTERACTION AND ACCESS
Start paused. No idle auto-tour, flashing, time pressure, or surprise audio.
Use real buttons and labelled form controls. Every learning action must work
with a keyboard and touch; dragging and hover must have alternatives. Aim for
44×44 CSS-pixel touch targets and 16-pixel body text. Pair color with words or
shapes. Preserve visible focus and readable contrast in both themes.
Respect reduced motion by changing state immediately or using a still view.
Explain the figure in text and expose numerical observations as ordinary HTML.
Announce discrete results politely, never every animation frame. Provide an
equivalent activity if animation, WebGL, or JavaScript is unavailable.

PORTAL INTEGRATION
Inspect the current component and state conventions before editing. Keep
static geometry and factual content server-safe. Avoid importing a giant
client-side art module into the portal's initial route. Load optional motion
only where needed; do not replace the existing lesson shell. Keep model data
minimal and serializable. Reuse the bounded practice-code runner where code
execution is needed; do not add eval, Function, script-string injection,
unsafe HTML, or inline executable script to bypass the portal's CSP.

Use one controlled animation loop per mounted activity. Pause offscreen and
when the document is hidden; resume only when the learner requests it. Cancel
frames, disconnect observers, remove listeners, destroy controllers, and free
GPU resources during cleanup. Geometry updates must not trigger whole-page
React renders on every frame. Reset must restore a reproducible initial state.

ASSESSMENT AND COMPLETION
Check a prediction, an observed relationship, and a transfer explanation.
Assess content rather than time spent, camera rotation, or number of clicks.
Feedback should identify the relevant evidence and offer a useful next step.
Allow hints and retries without humiliation or rewards for speed. Connect
completion to the existing explicit lesson validation; do not mark complete
merely because an animation played. Do not silently change existing gates.

EVIDENCE AND DELIVERY
Deliver the component, pure model, small data fixture, accessible fallback,
integration notes, attribution/license notices for copied code, and a concise
verification report. Use actual subject references where needed. Distinguish
tested facts from design targets and tests that were not run. Report measured
bundle cost, scene size, and frame timings on named test conditions. Never
write “production ready,” “60 fps,” or “audit passed” without the corresponding
evidence. Fix concept errors before polishing effects.
```

## 2. Master prompt: fixed-view 2D/SVG or isometric 2.5D

```text
Apply the common EducationOS authoring contract.

Create [LESSON TITLE] for [AGE RANGE], subject [SUBJECT], lasting [MINUTES].
The child should be able to [OBSERVABLE OBJECTIVE]. They already know
[PREREQUISITES]. Address the misconception [MISCONCEPTION].

REPRESENTATION: [flat SVG / fixed-view isometric SVG]. This is not true 3D.
Use Anatomy commit e9488296a44211c42701ff71705b7901470ec78f as the drawing
reference. Read the appropriate kit, React, motion and verification guides.
Do not install globally or publish anything. Prefer the current portal's
components and rendering conventions over standalone-page scaffolding.

Explain [CONCEPT] through [RECOGNIZABLE APPARATUS OR DIRECT DIAGRAM]. Supply
a short mapping from each essential part to its conceptual role. State where
the analogy stops. Use [EXACT VALUES WITH UNITS]. The initial model is
[STATE]; valid inputs are [RANGES]; a step performs [TRANSITION]. Derive
[READOUTS] from [FORMULAS]. Enforce [INVARIANTS].

Compose one readable mechanism at fixed azimuth [ANGLE] and elevation [ANGLE]
if isometric. Fit it to a responsive viewBox without cropping useful states.
Provide an ordinary HTML code panel, legend, measurements, and explanation
where they are needed. Use purposeful thickness, supports, clear occlusion,
and restrained shading. Emphasize the current cause or operation with one
accent. Essential information must survive grayscale and a phone-width view.

Controls: [STEP], [RUN/PAUSE IF USEFUL], [INPUT], [RESET]. State exactly what
each does, including mid-operation changes. Start paused. Make the SVG read
well as a still image. Avoid shaders unless the represented quantity genuinely
requires them; no decorative particles, glowing borders, or simulated terminals
that pretend to execute code.

Ask [PREDICTION]. After the experiment ask [EVIDENCE QUESTION], then
[TRANSFER QUESTION WITH NEW DATA]. Include the expected answer, acceptable
reasoning, a misconception-specific hint, and a concise explanation. Do not
reveal a prediction answer until submitted or explicitly skipped.

Provide keyboard/touch alternatives, reduced-motion behavior, a text/table
fallback and source attribution. Verify extreme inputs, stepping, pause,
reset, repeated mount/unmount, both themes, 390-pixel layout, 200% text zoom,
and fallback. Inspect screenshots at normal size and close-up. Run applicable
geometry and line checks; report the exact checks and limitations. Keep
learning-model tests independent of visual correctness checks.
```

## 3. Master prompt: procedural 3D learning model

```text
Apply the common EducationOS authoring contract.

Build [TITLE], a genuine spatial model for [AGE], teaching [OBJECTIVE]. The
depth-dependent fact is [WHAT ROTATION/SECTIONING REVEALS]. A fixed picture
would be inadequate because [SPECIFIC LEARNING REASON]. If that reason does
not hold, use the 2D template and explain the decision.

ENGINE AND OUTPUT
Choose explicitly between Anatomy beta 3D rigid geometry and a separately
implemented, approved 3D renderer. For Anatomy, use the pinned commit and read
references/3d.md before authoring. Keep one main spatial subject; do not infer
a full scene graph, physics simulation, mesh export, or GLB support that the
selected runtime does not provide. If another engine is required, state the
dependency and integration cost before substituting it.

Define world axes [X/Y/Z], units [UNIT], origin [POINT], scale [CONVERSION],
and exact primitive bounds [TABLE]. Define parent groups, pivots, joint axes,
allowed ranges and reachable states. Use actual 3D transformations followed
by projection, not a sequence of unrelated illustrations. A pedagogical
cutaway or exploded pose must be labelled as such. Space introduced between
parts is not material volume, distance travelled, energy, or elapsed time.

MODEL
Define [INPUTS], [INITIAL STATE], [PURE TRANSITIONS], [OUTPUT FORMULAS], and
[INVARIANTS]. When claiming physical simulation, name the equations, units,
initial conditions, integration method, timestep and acceptable error. Verify
their limiting cases. When movement is only illustrative, say so and avoid
physical readouts. Derive assessment answers independently of rendering.

CAMERA AND CONTROLS
Use [PROJECTION], azimuth [ANGLE], elevation [ANGLE], target [POINT] and
fitting bounds [BOUNDS]. Define permitted rotation/zoom and its educational
purpose. Offer named preset views, keyboard increments, and reset view.
Provide non-drag controls and an equivalent 2D inspection mode. Prevent
accidental page scroll capture. Start still; changes follow direct input.

QUALITY AND PERFORMANCE
Prefer simple, exact primitives. Target no more than [LIVE PART BUDGET] live
parts; put nonessential scenery in static art. Avoid unnecessary transparent
materials, debris, complex tubes and expensive surface effects. Keep geometry
and model data small. Measure on desktop and at 390×844 with an explicitly
reported CPU profile. Initial targets are p95 render work below 16 ms desktop
and 33 ms under the chosen constrained profile, not guarantees. If missed,
simplify detail, stop secondary motion, or present still preset views while
preserving the learning task. Stop rendering when inactive.

ASSESSMENT AND VERIFICATION
Require [PREDICTION], [OBSERVATION], and [NEW-CASE EXPLANATION]. Test that
rotation, camera changes and representation toggles never change quantities.
Test controls and cleanup, including repeated navigation. For Anatomy run
the full applicable geometry/orbit audit and browser fidelity, order,
continuity, line and timing checks. A quick/partial run is only diagnostic.
Sample every reachable motion, not just the default spin. Record actual
results; if verification cannot run, identify the unverified artifact.
Deliver a still SVG/HTML fallback with the same conceptual content.
```

## 4. Complete prompt: Loop Loom

```text
Apply the common EducationOS authoring contract. Create “Loop Loom: make a
rhythm without copying every instruction,” a Programming activity for ages
8–11, approximately 8 minutes. Prerequisites: read two instructions in order
and count small groups. Objective: explain why repeating a two-instruction
block three times creates six output lines. Misconception: repeat 3 means
three output lines regardless of the block's contents.

Use fixed-view isometric SVG, clearly described as a teaching analogy. A
small rhythm-making loom has two instruction plates, Clap and Tap. A shuttle
visits them in order; two output tickets form one repeated block. The tickets
represent printed text, not sound or a real computer mechanism. No audio is
needed. Do not draw a magical general-purpose computer or claim the loom is
how a processor is physically constructed.

Use this initial EducationOS practice-code program exactly:
repeat 3:
  print("Clap")
  print("Tap")

Label this “EducationOS practice code.” Preserve the two-space indentation.
This bounded learning language is not Python or JavaScript. When the Repeats
control changes n, display repeat {n}: with the same two indented statements,
and validate the corresponding source. Reuse the portal's
existing runPracticeCode for output validation; do not introduce eval or a new
language. If an editor is offered, changes must remain inside that runner's
existing limits. The pictured loom supports the fixed two-instruction example;
do not animate arbitrary edited source as if its semantics had been modelled.

EXACT MODEL
Let n be an integer from 0 through 6, default 3. Let s be the number of output
instructions already executed, initially 0, bounded by 2n. A step when s<2n
appends “Clap” if s is even and “Tap” if s is odd, then increments s by one.
At s=2n further steps have no effect. Derive completed blocks as floor(s/2),
output lines as s, and finished as s=2n. The expected output is the first s
items of [Clap, Tap] repeated n times. For n=0, show zero blocks and empty
output immediately, with “Zero repeats runs neither instruction.”

Changing n pauses and resets s and the output; say “Changing repeats starts
again.” Run executes one instruction every 700 ms. Pause freezes progress.
Animation easing only interpolates the shuttle between model states; it must
never append output or determine correctness. Reset preserves the selected n
and restores s=0. Reset view is unnecessary because the camera is fixed.

Invariants: 0≤s≤2n; output.length=s; completedBlocks=floor(s/2); Clap occurs
ceil(s/2) times and Tap floor(s/2) times; the final output contains exactly
2n lines. The complete default output is Clap, Tap, Clap, Tap, Clap, Tap.
Compare final outputs for every n=0…6 with the existing practice interpreter.

VISUAL AND CONTROLS
Use a 45° azimuth, 30° elevation, and a responsive viewBox. Give the loom a
quiet paper base, supported rails, two clear instruction plates, a shuttle,
and an output tray whose countable slots remain hidden until the prediction
is submitted or Show me is chosen. Keep decorative hardware subtle and static.
Highlight the instruction about to execute; once finished derive the readout
from n and 2n, for example “Block repeated 3 times · 6 lines printed” at n=3.
Use singular/plural wording for 0/1/other values. Use words alongside the
highlight. Keep the code and output as selectable HTML, not tiny SVG text.

Provide Step, Run/Pause, Reset, and a labelled Repeats control with minus/plus
buttons as well as a number field. All work by keyboard and touch. The current
output must remain readable without watching the shuttle. At 390 pixels stack
the visual, code, and output; do not shrink text to preserve a desktop layout.
Start paused. With reduced motion, the shuttle changes position immediately.
With JavaScript unavailable show the default program and prediction question,
then put the six-row output table and explanation inside a native HTML details
control, initially closed. No WebGL is required.

LEARNING SEQUENCE
First ask: “The block has two instructions. If we repeat it three times, how
many lines will appear?” Accept 6. Keep the explanation behind submission or
an explicit “Show me” action. A response of 3 gets: “Count the instructions
inside one block. Then count how many blocks the program repeats.”

Next invite Step twice. Ask what has completed: one block and two output lines.
Let the learner finish, then explain 3 blocks × 2 instructions = 6 lines.
Ask them to compare n=0, n=1 and n=3. Transfer: “Add print("Snap") inside
the block and repeat it four times. Predict the line count before running.”
Accept 12 and reasoning equivalent to four groups of three. A supplementary
question asks the output order of the first block: Clap, Tap, Snap.

Connect the practice submission to existing lesson validation without
changing progress, preview or account-boundary rules. A successful animation is not
an answer. Save only existing supported lesson work; do not add telemetry.

DELIVERY
Provide a small model module, an isolated SVG component, an interactive client
controller, accessible HTML panels, and focused verification. Test n=0 and 6,
every intermediate prefix, Run/Pause equivalence to stepping, changing n
mid-run, reset, no duplicate timers, and remount cleanup. Inspect both themes,
390-pixel layout, keyboard-only operation and reduced motion. Measure the
incremental client bundle and timing instead of asserting a frame rate.
```

## 5. Complete prompt: 12 Unit Cube Builder

```text
Apply the common EducationOS authoring contract. Create an activity internally
named “12 Unit Cube Builder,” with learner-facing title “How many cubes are
hiding?” for Mathematics, ages 9–12, approximately 10
minutes. Prerequisites: count rows and columns and multiply whole numbers.
Objective: explain rectangular-prism volume as cubes per row × rows per
layer × layers. Address counting only visible faces or confusing square and
cubic centimetres.

Use Anatomy beta 3D from the pinned commit. Here spatial depth has a specific
purpose: rotating the object reveals back surfaces while the total number of
unit cubes stays constant. This is a genuine transformed geometric model,
not a raster turntable. Do not add physics, gravity, falling cubes, shaders,
or GLB export. A static layer-grid alternative must teach the same concept.

EXACT GEOMETRY AND DATA
World x is length, y width, z up. A mathematical unit is 1 cm, represented by
32 drawing units. Keep semantic coordinates in cm and convert every point,
pivot and length consistently through one view transform. Default dimensions
are L=3, W=2, H=2 centimetres. For each
integer i=0…L−1, j=0…W−1, k=0…H−1, cube C[i,j,k] occupies exactly
[i,i+1]×[j,j+1]×[k,k+1] cm. There are 12 cubes, each 1 cm³. Do not insert
gaps, rounding, or scaled edges that change the claimed dimensions. Thin
rendered boundary strokes may clarify neighbouring cubes; they are not gaps.

Offer four presets only: 2×2×2=8, 3×2×2=12, 3×3×2=18 and 3×3×3=27.
Those equations are author fixtures. Label the learner's picker with dimensions
only; do not display the derived counts until the related prediction is
submitted or explicitly skipped. Store integer dimensions and stable cube
IDs; derive positions and all counts.
Do not store duplicate “correct answers” that can drift from the dimensions.
Group the cubes under one yaw transform whose vertical axis passes through
(L/2,W/2,0). Their supporting static platform ends at z=0. Scene dressing
stays outside the swept cuboid. Use at most 36 live parts, with 27 cubes the
largest required preset. Avoid a 90-part showcase mechanism.

V=LWH cm³; cubesPerLayer=LW; layerCount=H. The unit-cube set and volume are
invariant under rotation. Changing preset rebuilds deterministically, resets
view and layer selection, and clears only answers tied to the old dimensions.
The renderer must never infer volume from visible surfaces or screen pixels.

CAMERA AND INSPECTION
Use an orthographic-style projection, initial azimuth 45°, elevation 30°,
centred on (L/2,W/2,H/2), fitted to include the entire object and its base.
The subject's initial yaw is 0°. Allow yaw through 0–360°; fixed elevation
is sufficient. No free-flight camera. Provide drag rotation, a labelled yaw
slider, left/right 15° buttons and Starting view/Quarter turn/Half turn/
Three-quarter turn presets at 0/90/180/270°. These are isometric quarter-turn
views, not orthographic front/right elevations. Keyboard controls must be
real controls, not a hidden global key handler. Reset view restores yaw 0°
without resetting the learner's answers.

Add “All layers” and individual layer views. Isolating a layer is a viewing
aid: hide the others without claiming their cubes disappeared. Display
a derived message using selectedLayer, H, L×W and L×W×H. At the default
fixture it reads “Showing layer 1 of 2: 6 cubes shown; complete object: 12
cubes.” Changing the preset must update every value. Never subtract hidden
layers from the total volume. Do not add exploded spacing; the object retains
the selected preset's physical dimensions. Each HTML layer grid has W rows
and L columns of 1 cm² cells. Its caption derives H layers of height 1 cm
and total volume L×W×H cm³. The default shows two rows of three cells in each
of two layers, giving 12 cm³.

Start still. Color can distinguish a selected layer but cannot carry the
only meaning. Keep dimensions and numerical observations as ordinary HTML.
Do not display surface-area equations in this first lesson. Use the words
“length,” “width,” “height,” “one-centimetre cube,” and “cubic centimetres.”

LEARNING SEQUENCE
Hook: “You cannot see every cube. Can you count them without taking the box
apart?” Ask for an initial prediction without announcing 12 in the heading or
readout beforehand; the internal activity ID may still identify this fixture.
Then reveal dimensions, allow rotation and inspect one layer. Ask how many
cubes form a layer: 3×2=6. Ask how many equal layers there are: 2. Ask for
the complete volume with units: 6×2=12 cm³. Explain why turning the view does
not create or remove cubes.

Misconception feedback: visible-face counting gets “A face is a surface of
a cube. Some cubes are hidden behind others. Count a complete layer, then
count the layers.” Adding dimensions gets “3+2+2 combines side lengths;
try counting rows inside one layer first.” A correct number with cm² gets
“These are cubes with length, width and height. Which unit measures space
inside a solid?” Accept clear equivalent reasoning, not exact phrase matching.

Transfer: switch to 3×3×2 and ask for a prediction before displaying its
derived count; expect 18 cm³, using nine cubes per layer and two layers.
Then offer a text-only new case: 4×2×3 cm; expect 24 cm³ and three layers
of eight. Do not mark completion for rotating the camera or exposing every
layer. Use the portal's established assessment pathway and accessible hints.

FALLBACK, LIFECYCLE AND EVIDENCE
If motion is unavailable, show separately generated orthographic front/right/
top diagrams plus numbered layer grids and the same questions. Derive these
diagrams from the dimension data; do not relabel isometric quarter turns as
front/right/top elevations. With JavaScript unavailable, keep worked layer
counts and explanations behind native HTML details controls so the prediction
can be attempted first. If WebGL is unavailable, this SVG-based activity
must remain usable; do not show an empty canvas or block the lesson. Respect
reduced motion with immediate camera changes or still preset views.

Keep all nonessential detail static. Pause when hidden or offscreen and
release the turn controller, listeners and animation callbacks on unmount.
Test 0/90/180/270° and boundaries around ordering changes, all four presets,
all layer selections, rotation without quantity changes, keyboard/touch,
fallback and repeated navigation. Run the applicable complete geometry/orbit
and browser checks, with reachable states included. Check mathematical
invariants separately. Measure p95 render work under named desktop and
constrained-phone conditions, aiming below 16/33 ms respectively. Simplify
if needed and report the actual results, artifact size and unrun checks.
```

## 6. Optional external GLB asset brief

This is for a separate 3D creation tool or artist. It is not an Anatomy capability promise. Prefer procedural primitives for countable cubes, exact mechanisms and assessment-critical geometry. Generated assets can support a story or environment while the learning model remains explicit.

```text
Create [ASSET] for an EducationOS lesson about [CONCEPT], ages [AGE]. Supply
a real .glb plus editable source and a geometry/texture manifest, if your
tool supports them. State unsupported outputs instead of fabricating files.

The asset serves [VISUAL/INSPECTION ROLE]. These quantities are immutable:
[DIMENSIONS, UNITS, COUNTS]. Use metres for exported coordinates; record the
conversion to lesson units. Specify origin [POINT], up axis [AXIS], forward
axis [AXIS], and scale [VALUE]. Name semantic meshes [PART TABLE]. Separate
moving components with correct local origins and pivots [JOINT TABLE]. Do
not bake instructional labels or answer text into textures.

Target [TRIANGLE BUDGET], [MATERIAL COUNT], [MAX TEXTURE SIZE], and
[COMPRESSED FILE BUDGET], agreed for the intended device. Prefer opaque PBR
materials, clean normals, valid UVs where needed, and consistent texel density.
Avoid accidental mirrored winding, missing backfaces, embedded remote URLs,
scripts, hidden trackers, unnecessary transparent shells and extreme roughness.
Do not imply hollow/solid structure that contradicts the lesson. For an
exploded view, define named parts, rest transforms, displacement vectors and
reassembly transforms; keep all parts identifiable in both poses.

Provide an orthographic front/side/top preview, neutral-lit perspective,
wireframe view, dimension manifest, license/provenance information and any
known defects. A text prompt cannot certify normals, buffer validity,
topology, manifoldness, materials, dimensional accuracy or GLB compliance.
Import and inspect the resulting binary in the target renderer; validate it
with an appropriate glTF validator. Compare measured bounds and semantic part
counts with the manifest. Reject or repair a plausible-looking asset that
fails the lesson's exact requirements. Keep educational calculations outside
the mesh and preserve a lightweight accessible fallback.
```

## 7. Optional 2D image brief

```text
Create one illustration for [LESSON], ages [AGE], showing [SCENE]. Preserve
these exact visible facts: [COUNTS/RELATIONSHIPS]. Use a calm, legible style
consistent with EducationOS paper/ink/lime. Composition: [ASPECT RATIO,
FOCAL POINT, EMPTY SPACE FOR SEPARATE HTML TEXT]. Avoid text, tiny details,
misleading scale, frightening imagery, brand logos and decorative equations.
Supply [PNG/WEBP, DIMENSIONS, TRANSPARENCY REQUIREMENT] and a factual alt-text
draft. This is a raster illustration, not an executable model or verified
diagram. Keep all interactive labels, measurements and assessment logic in
the application. A subject reviewer must inspect image accuracy before use.
```

## 8. Reviewer and repair prompt

```text
Review the proposed EducationOS lesson against its authoring brief. Inspect
the actual code, rendered states, model fixtures and test evidence. Do not
assume that a polished screenshot, generated asset or successful build proves
the learning experience. Separate confirmed issues from risks and unknowns.

Score: subject truth 25; learning sequence/assessment 20; interaction and
state correctness 15; accessibility/fallback 15; integration/performance 15;
visual clarity 10. Explain deductions with concrete evidence. A high total
does not override a critical defect: wrong facts, incorrect answers, lost
work, unsafe code execution, a keyboard-blocked task, or a broken fallback.

Check default, smallest and largest inputs; initial, intermediate, finished
and reset states; pause/resume; mid-run input changes; repeated mount/unmount;
both themes; 390-pixel width; enlarged text; reduced motion; no WebGL; and
unavailable storage. Verify that all displayed values and assessed answers
follow the same documented model, with units and analogy limits intact.
Try the prediction before observing and the transfer case after observing.
Check that answers are not inadvertently revealed before prediction.

For 3D, compare actual dimensions and part counts with the manifest. Inspect
several views, occlusion changes and every allowed joint/section state. A
geometry audit does not validate physics or pedagogy. For external assets,
inspect the binary, normals, materials and validation report; do not certify
them from descriptive text. Verify claimed performance under the stated
conditions. List checks that were skipped, partial, blocked or not available.

Produce a prioritized repair list: defect, learner impact, smallest effective
fix, and evidence needed to accept it. Repair critical truth and interaction
errors first. Preserve existing account boundaries, CSP and marketing/portal
separation. Rerun checks affected by each change, then return a concise
release decision: acceptable, acceptable with stated limitations, or needs
repair. Never fabricate an audit result or silently substitute a simpler
representation while continuing to label it true 3D.
```
