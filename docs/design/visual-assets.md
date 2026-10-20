# EducationOS learning visuals

The user-provided EducationOS slides informed the visual direction: warm white space, black type, lime and blue accents, dimensional objects, cinematic learners in action, and friendly 3D-style mascots. Every shipped character is original generated concept art, not a copy of a reference or a photograph of an actual EducationOS learner. AR-style glasses and holograms illustrate ideas; they do not claim a current headset, robotics kit, or production AI feature.

| Asset | Placement | Stored size |
|---|---|---:|
| `physics-cutout.webp` | Home hero, journal, science portal card | 193 KB |
| `math-cutout.webp` | Programs hero, geometry journal, mathematics portal card | 159 KB |
| `code-cutout.webp` | Programming bento and portal card | 195 KB |
| `flight-cutout.webp` | Approach hero, aerodynamics bento and journal | 183 KB |
| `orbit-mascot.webp` | Science bento, trust hero, portal welcome | 99 KB |
| `geometry-mascot.webp` | Mathematics bento and journal hero | 162 KB |
| `learning-objects.webp` | Secondary portal and lab decoration | 130 KB |
| `curiosity-hero.webp` | Language and arts subject illustration | 58 KB |

These assets have real alpha transparency where the composition requires it. Background colour, depth, orbit strokes, and reduced-motion-safe animation come from CSS rather than baked-in image rectangles. The WebP files are sized for their display areas; `next/image` supplies responsive delivery and lazy loading below the fold. Copy and controls remain native HTML, so the visual art never carries essential instructions.

Marketing and the learner portal share a visual language and optimized static assets while remaining separate production services. The three discovery labs also retain complete 2D mobile activities when 3D effects are unavailable.
