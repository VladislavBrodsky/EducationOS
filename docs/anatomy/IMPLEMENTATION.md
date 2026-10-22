# Implemented discovery labs

The learner portal includes the three pilot lessons and is live at [app.educationos.space](https://app.educationos.space). Public marketing routes and the original Inventors Lab demo keep their separate layouts and navigation on [educationos.space](https://educationos.space). See [deployment status](../DEPLOYMENT_STATUS.md) for the separate services, DNS, certificates and post-deployment mobile checks.

| Class | Local route | Core interaction | Recording requirement |
|---|---|---|---|
| Loop Loom | `/portal/labs/loop-loom` | Predict; change 0–6 repeats; Step, Run, Pause and Reset; isometric loom or flat trace | Submitted prediction, correct two-instruction output count, and a fresh three-instruction/four-repeat case with output order |
| Same Half Different Shape | `/portal/labs/same-half` | Select twelve equal cells, rearrange six, compare equal wholes, inspect unequal parts; optional tilted tray | Submitted prediction, six selected cells, equal-area and unequal-parts explanations, and half of eight equal cells with reasoning |
| Hidden Cube Builder | `/portal/labs/hidden-cubes` | Choose four dimension presets, inspect layers, compare flat elevations; optionally turn actual rigid 3D geometry with drag, slider or buttons | Submitted prediction, layer counts, complete volume in cubic centimetres, invariance explanation, and new 4 × 2 × 3 case |

On `app.educationos.space`, remove `/portal` from those paths. The collection is `/labs`. Today, Subjects and Projects link into the labs. My progress counts all 18 activities and includes lab answers/reflections in its notebook, export and clear operations.

## Rendering and inputs

Loop Loom uses the pinned Anatomy typed geometry functions and an original React SVG wrapper. Its output is the prefix of actual results from the portal's bounded interpreter. No submitted JavaScript or Python is evaluated. Automatic playback starts only after an explicit Run action, advances every 700 ms, pauses when hidden/offscreen and cleans up on navigation. Reduced motion leaves manual Step available.

Same Half keeps its accurate area comparisons in a flat grid. Native buttons expose selected state and support keyboard activation. Its optional fixed isometric tray uses Anatomy slabs, with a clear instruction to compare area in the flat view.

Hidden Cube Builder starts in 2D at every viewport. Its enhanced scene and TURN runtime load only when requested. Anatomy reprojects and shades individual unit cubes at the chosen yaw; this is actual rigid 3D projected into SVG, not a CSS rotation. Layers hide a viewing subset while all quantities continue to describe the complete object. Native controls and textual counts support the same investigation without drag, WebGL or motion. The quarter-turn controls are labelled as tilted views; Front/Right/Top are separate orthographic diagrams.

No lesson needs WebGL. Native, initially closed worked examples are server rendered for JavaScript-disabled reading; saving interactive work requires JavaScript. Basic lesson components render synchronously on the server so the paper fallback does not depend on a streamed client boundary. Only the optional cube enhancement is lazy.

## Local work and checks

Version-1 portal state gains a bounded `labs` map while continuing to read earlier records without it. Known lab IDs, settings, answer fields and text lengths are validated. A stored completion flag is rechecked against the current evidence. Settings/answer edits invalidate completion; reflections can be added afterwards. Viewing angle, animation cursor and layer isolation are transient controls and do not count as evidence.

Predictions may be incorrect. Recording requires later observations and the fresh transfer question. Feedback explains the next useful step. These checks do not establish independent mastery or lesson efficacy. Work stays in this browser-tab session and is not sent to an API or made public.

## Source and reproducibility

Anatomy source is pinned to `e9488296a44211c42701ff71705b7901470ec78f` under `src/vendor/anatomy`, with its MIT license and source notice retained. EducationOS models, React controls, assessment and CSS are original adapters. No upstream global installation, inline script page, or external mesh service is used.

Regenerate checked-in cube scenes from the repository root:

```sh
node scripts/build-cube-scenes.mjs
```

The four scenes total about 77 KB of raw JSON and contain 8, 12, 18 and 27 parts. One semantic centimetre maps to 32 drawing units. The builder uses strict separating-plane checks at 73 yaw poses spaced five degrees apart. [Build evidence](cube-build-evidence.json) records the actual reports. This is not the complete upstream orbit/fidelity audit. The default 12-part model was also sampled in desktop Chromium at 720 half-degree positions with no forced ordering or unseparated pairs; [runtime evidence](cube-runtime-evidence.json) gives the environment and timing limits. Full beta 3D certification and mobile hardware performance are not implied.

See [TESTING.md](../TESTING.md) for executed application checks and their limits. Supervised child usability, manual screenreader review, and curriculum review remain follow-up validation; the implemented portal remains the existing local-work preview.
