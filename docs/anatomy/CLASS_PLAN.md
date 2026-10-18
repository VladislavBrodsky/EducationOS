# EducationOS Anatomy Class Plan

EducationOS can turn its five subjects into inspectable worlds: children change something, observe, and make a result they can explain. Begin with exact counting, finite code, equal parts, and twelve unit cubes. Add physical simulations when their assumptions and outputs can be checked. Keep the activities inside the learning portal and preserve the separate marketing experience.

This plan targets Anatomy commit [`e9488296a44211c42701ff71705b7901470ec78f`](https://github.com/wheresryan22/anatomy/tree/e9488296a44211c42701ff71705b7901470ec78f). Its SVG figures suit the first lessons; optional WebGL and beta 3D should answer a specific learning question. Use the existing paper, ink, and lime EducationOS language around the models.

## Learning sequence

Use **Predict → Test → Observe → Explain → Transfer** throughout the collection.

1. **Predict:** Ask before operating the model. Accept a selection, drawing, discussion, or short written response.
2. **Test:** Change one identified variable. Show fixed conditions and allow exploratory attempts.
3. **Observe:** Link the change to a count, diagram, event list, or measurement. Keep evidence visible after motion stops.
4. **Explain:** Relate observations to the prediction. Offer a worked explanation when needed.
5. **Transfer:** Present a new arrangement or input. Ask before replaying the model.

The University of Colorado's [PhET activity design guidance](https://phet.colorado.edu/en/teaching-resources/virtual-workshop/science-activity-design) recommends eliciting predictions and prior ideas before simulation use, then comparing them with evidence. Its [small group guidance](https://phet.colorado.edu/en/teaching-resources/teaching-with-phet/small-group) supports focused scaffolding that leaves room for inquiry. These principles inform the lesson sequence; the proposed EducationOS activities still need classroom piloting.

## Fifteen proposed lessons

The ages identify a starting version; readiness, prerequisites, and support determine placement. SVG means interactive vector artwork. Use a flat view wherever it makes comparison clearer.

### Programming

| Hook | Starting age | Model | Change | Learning check | Private artifact |
| --- | --- | --- | --- | --- | --- |
| **Instruction Parade:** Can the same messages tell a different story? | 7–9 | SVG cards arrive in program order | Swap two `print()` statements | Predict and explain a fresh three-message sequence before running it | Three-frame sequence with code and explanation |
| **Pocket Greenhouse:** Can one number change a whole garden? | 7–12 | SVG seed tray and variable ledger | Change the stored seed count, then an addition | Distinguish reading `seeds + 3` from assigning `seeds = seeds + 3` | Before and after garden with value trace |
| **Loop Loom:** Can three lines paint twelve tiles? | 7–12 | SVG loom with an overhead pattern strip | Change repeat count or the two-item body | Predict `n × k` outputs, then create a new target pattern | Pattern, readable code, and count explanation |

Instruction Parade extends `programming-first-message`; Pocket Greenhouse extends `programming-variables`; Loop Loom extends `programming-repeat`. They can use the existing practice language's `print`, assignment, arithmetic, and `repeat`. Mapping printed tokens to visual objects is an additional renderer, not a new code command.

Misconceptions include a program knowing the intended story, a calculated expression updating storage, and repeat count equaling total output. Use traces to expose each distinction. Keep bounded execution and ordinary error feedback. A conditional sorter is a later addition: the runner does not implement `if`, comparison operators, or general Python.

### Mathematics

| Hook | Starting age | Model | Change | Learning check | Private artifact |
| --- | --- | --- | --- | --- | --- |
| **Staircase Detective:** Can you predict the next landing without building it? | 7–12 | SVG steps with a synchronized number strip | Change starting count or the declared addition rule | Apply the stated rule to two unseen terms and explain the difference | Original sequence with its explicit rule |
| **Same Half Different Shape:** Can these different pictures both be half? | 5–9 | Flat equal-area grids beside optional isometric trays | Rearrange selected cells without changing the whole | Identify equal halves in a fresh layout and reject unequal-part counting | Two equivalent fractions with a visual explanation |
| **Unit Cube Builder:** How many cubes are hiding? | 9–12 | A default 3-by-2-by-2 unit-cube block with preset views and flat layer diagrams | Rotate, inspect layers, then choose new dimensions | Count hidden cubes using rows, columns, and layers; distinguish viewing changes from geometry changes | Three-view building card with count equation |

Staircase Detective extends `mathematics-patterns`. State the intended rule because finitely many terms do not identify a unique mathematical sequence. Same Half Different Shape extends `mathematics-fractions`: selected equal units divided by total equal units describes the fraction of the same whole. Include a deliberately uneven partition to challenge counting pieces without comparing their sizes.

Unit Cube Builder extends `mathematics-area` into a **new volume objective**. Preserve the existing garden lesson as the area prerequisite. A 3-by-4 floor contains twelve square units; the default 3-by-2-by-2 solid contains twelve cubic units. Label these units explicitly. The prompt pack specifies presets of `2 × 2 × 2`, `3 × 2 × 2`, `3 × 3 × 2`, and `3 × 3 × 3`, giving 8, 12, 18, and 27 cubes. Changing the preset changes geometry and volume; rotating or isolating a viewing layer does not. Do not mark the area lesson complete merely because the extension was explored.

### Science

| Hook | Starting age | Model | Change | Learning check | Private artifact |
| --- | --- | --- | --- | --- | --- |
| **Bridge Test Detective:** Which change actually answers your question? | 7–12 | SVG paper bridge with labeled supports, gap, paper, and block | Change the comparison plan, then fold in a real experiment | Identify the changed feature and two fixed conditions; record observed results | Test plan, diagram, and trial record |
| **One Lucky Result:** Can a second test change your explanation? | 10–15 | SVG trial ledger beside the bridge | Add another observed trial or inspect clearly labeled sample data | Write a conclusion matching the comparisons and name a reason to repeat | Evidence card separating observation from conclusion |
| **Shadow Switch:** Can a short object make a long shadow? | 7–12 | Flat ray diagram with optional isometric context | Lower or raise the light while object height stays fixed | Predict shadow ordering in a new scene and identify the fixed variable | Two-state diagram with a causal explanation |

Bridge Test Detective extends `science-fair-test` and `science-paper-bridge`; One Lucky Result extends `science-evidence`. Keep the bridge illustration qualitative. Its animation can show folding, labeled dimensions, and the test sequence; it must not generate purported collapse times or load limits from an unvalidated bending model. Learners record the actual low-table experiment with adult support using the existing instructions. Sample data must remain distinguishable from their measurements.

Shadow Switch is a **next-stage lesson**, not existing portal content. For an ideal model with parallel light rays, a vertical object, and flat ground, shadow length is `h / tan(θ)`. Younger learners compare lengths without trigonometry. Validate that geometry before adding numerical readouts; do not interchange it with a nearby point-light model.

### Language and writing

| Hook | Starting age | Model | Change | Learning check | Private artifact |
| --- | --- | --- | --- | --- | --- |
| **Mystery Object Workshop:** Can someone recognize the object from your clues? | 5–12 | Inspectable SVG object with a few distinctive features | Replace vague words with observable details | Include two accurate details and revise after a reader's interpretation | Annotated clue card and revised description |
| **Instruction Repair Shop:** Can a stranger build what you imagined? | 7–12 | Flat tile plan and an SVG construction tray | Revise ambiguous position and action words | A partner follows the directions; compare the result with the target | Target, instructions, and one explained revision |
| **One Event Three Narrators:** How can the same event become three stories? | 10–15 | Deterministic SVG marble sequence and event ledger | Change narrator and interpretation | Preserve three observable events while distinguishing an inference | Paired passages with facts highlighted |

Mystery Object Workshop extends `language-precise-description`. Instruction Repair Shop transfers `language-strong-sentence` into a new functional-writing activity. One Event Three Narrators extends `language-short-story` with a **new viewpoint objective**; retain the original problem, choice, and change criteria when evaluating story structure.

Keep events stable while prose changes. A reader's misunderstanding supplies revision evidence, not a universal literary judgment. Use a partner or adult for open-ended instructions. An automated follower would need a restricted instruction language rather than claiming to understand arbitrary prose.

### Arts and design

| Hook | Starting age | Model | Change | Learning check | Private artifact |
| --- | --- | --- | --- | --- | --- |
| **Stamp Studio:** Can one shape make a whole patterned world? | 5–12 | Flat SVG stamp surface | Translate, rotate, or reflect a stamp | Identify the repeated unit and distinguish a reflection from a rotation | Pattern with a transformation key |
| **Four Ink Sculpture:** Can four shades make a flat drawing look solid? | 7–12 | Fixed isometric object with a limited palette | Change colors while face roles and geometry stay fixed | Explain which faces remain distinguishable and revise a confusing palette | Two palette studies with intended effects |
| **Tiny Museum Sign:** Can a visitor understand your invention at a glance? | 7–15 | SVG object, short label, and sign layout | Change symbol, wording, size, or placement | Ask a reader what the sign means, then revise one choice | Before and after sign with audience rationale |

Stamp Studio extends `arts-patterns` with new transformation tasks. Four Ink Sculpture extends `arts-color-story`; no color has a universally correct mood. Tiny Museum Sign extends `arts-design-brief` and provides a useful destination for the other subjects' models. Evaluate whether the design serves the declared reader, rather than awarding points for visual effects or using a particular palette.

## Three pilot specifications

### Loop Loom

Begin with the prompt pack’s two-instruction Clap/Tap body repeated three times, producing six output lines. Then ask how to change the repeat count to make twelve: six repeats of two instructions. Support run, pause, single step, and reset. Highlight the active statement and the complete repeating unit. The numerical count, event trace, and rendered strip must derive from the same execution result. A successful transfer predicts three items repeated four times, then constructs a different twelve-item pattern. Inspect the code as well as the final image: twelve hard-coded outputs do not demonstrate use of a loop.

### Same Half Different Shape

Use a twelve-cell overhead grid with six selected cells. Rearrange selection while preserving the count, then compare three of six and two of four equal cells within the same-sized whole. Keep its boundary visible. Include unequal regions as a non-example and a fresh arrangement without answer coloring. Isometric decoration must not distort the equal-area comparison. Transfer asks how many of eight equal cells make half and why.

### Unit Cube Builder

Render the default fixture as exactly twelve opaque, distinct 1 cm cubes in a 3-by-2-by-2 cm prism. Use the four dimension presets from the prompt pack for fresh problems, revealing the new count after prediction. Keep placement constrained; free physics, falling cubes, and arbitrary mesh editing are unnecessary. Provide named camera presets, a deliberate yaw control, layer diagrams and an equivalent 2D activity. Ask children to explain hidden cubes before revealing a layer. For a fixed preset, all viewing modes preserve cube identity and total volume; a layer view identifies the displayed subset without subtracting hidden cubes from the object.

Follow with **Mystery Sculpture** when rotation becomes the learning question: choose between two twelve-cube arrangements that share one silhouette but differ from another view. This is a later spatial-reasoning lesson, not a feature required for the first pilot.

## Age adaptations

| Existing band | Interaction and explanation | Independent challenge |
| --- | --- | --- |
| **Explorers 5–6** | Adult-supported pictorial choices, small counts, spoken explanations, modeled first attempt | Match a new arrangement or point to what changed |
| **Builders 7–9** | Visible steps, short instructions, whole-number changes, sentence frames | Predict a small new case before running |
| **Makers 10–12** | Linked diagrams and numbers, simple code, explicit fixed conditions | Compare two cases and explain a misconception |
| **Creators 13–15** | Tables, boundary cases, competing explanations, reduced scaffolding | Test a counterexample and transfer across representations |
| **Launchers 16–17** | Inspect model rules, units, precision, sources, and assumptions | Derive a relationship, stress-test it, and document its limits |

Change the task and support, not merely vocabulary or response length. Keep scaffolding available without deducting rewards. Allow deeper challenges when learners demonstrate the prerequisites.

## Assessment and learner records

The current [portal activity checks](../../src/lib/portal-learning.ts) compare code output, mark a selected option, count writing words, and validate experiment fields. They already state that writing length does not establish quality and completed observation fields do not verify the experiment. Preserve that honesty while adding richer evidence.

Use three distinct records: **attempt recorded**, **stated check satisfied**, and **transfer demonstrated**. Code output alone can match by hard-coding; a correct option may follow guessing; a long explanation can still be incorrect. Combine inspectable work with a fresh problem and a short explanation appropriate to the learner. Do not rename these records “mastery” without a validated assessment design.

Immediate retry should offer explanatory feedback and another example. A later check should change numbers, arrangement, or context while preserving the learning objective. A delayed transfer check can revisit the idea after another lesson; record the actual interval and support used. Science repeats must retain every recorded trial. Deterministic model replays verify execution but do not create new experimental evidence.

Pilot reviews should examine independent transfer, misconception revision, explanation quality, and accessibility barriers. Voluntary retries and exports can help understand usability. Session duration, streaks, animation interactions, and social reach should not become learning goals.

## Artifacts and expansion

Offer an explicit local export of the chosen diagram, settings, code or observations, and selected explanation. Preview its contents. Omit names, faces, voice, location, account details, and unrelated free text by default. Never automatically publish artifacts. Children can show work to trusted readers without public profiles.

Build interest through truthful questions and inspectable surprises. “Can twelve cubes hide some of themselves?” is testable. Virality is not a promised outcome.

After the pilots, consider gear ratios and ripple interference. [NASA Space Math](https://spacemath.gsfc.nasa.gov/weekly/9Page14.pdf) provides an educational reference for gear tooth counts and turn ratios. Anatomy's [pinned ripple model](https://github.com/wheresryan22/anatomy/blob/e9488296a44211c42701ff71705b7901470ec78f/examples/ripple-tank/model.mjs) includes dispersion: changing frequency can change wave speed, so do not attach a constant-speed explanation to that model. Introduce each extension with reviewed model assumptions, a fresh learning objective, and its own transfer check.
