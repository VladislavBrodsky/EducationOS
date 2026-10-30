# Magic UI catalogue

Checked 30 October 2026 against the [official component index](https://magicui.design/docs/components), [sidebar configuration](https://github.com/magicuidesign/magicui/blob/efe76fc5755eca1142dd4f74c1d6f0ace2887e3c/apps/www/config/docs.ts) and [published registry directory](https://github.com/magicuidesign/magicui/tree/efe76fc5755eca1142dd4f74c1d6f0ace2887e3c/apps/www/public/r). The machine-readable inventory is `src/lib/magic-ui-catalog.ts`: **77 named component references**, with exact documentation and registry links.

| Official group | References | Existing local adaptations at audit |
| --- | ---: | ---: |
| Components | 16 | 3 |
| Special Effects | 9 | 2 |
| Animations | 1 | 0 |
| Text Animations | 18 | 0 |
| Device Mocks | 3 | 0 |
| Buttons | 3 | 0 |
| Backgrounds | 12 | 0 |
| Community | 15 | 0 |
| Total | 77 | 5 |

The five established adaptations are Bento Grid, Orbiting Circles, Progressive Blur, Shine Border and Magic Card. The showcase's live-preview map identifies additional local implementations separately. A catalogue entry with `implementation: reference` links to upstream documentation and does not mean its code or dependencies are installed. Earlier button glints and entry transitions were custom effects informed by Shimmer Button and Blur Fade; they are not counted as established reusable components.

For the requested rolling and scrolling motion, the relevant references are [Marquee](https://magicui.design/docs/components/marquee), [Scroll Based Velocity](https://magicui.design/docs/components/scroll-based-velocity), [Word Rotate](https://magicui.design/docs/components/word-rotate), [Text Reveal](https://magicui.design/docs/components/text-reveal) and [Scroll Progress](https://magicui.design/docs/components/scroll-progress). They cover continuous movement, scroll-driven motion, changing words, reading reveals and page position respectively.

The component repository uses the [MIT license](https://github.com/magicuidesign/magicui/blob/efe76fc5755eca1142dd4f74c1d6f0ace2887e3c/LICENSE.md); retained notices are in `src/components/magicui/LICENSE` and `NOTICE.md`. Pro templates and blocks are a separate offering and are excluded from the 77-component inventory. No paid template assets or demonstration testimonials were copied.

The upstream registry lists optional dependencies such as motion, framer-motion, cobe, react-tweet, shiki, next-themes, canvas-confetti, rough-notation and svg-dotted-map. These are upstream requirements, not an installation instruction. The existing EducationOS adaptations use React, scoped CSS and Lucide without adding those packages. Installing a reference later requires reviewing that component's current registry metadata and its own dependency licenses.


## Implemented in this milestone

The `/components` workbench has 16 local previews: the five established adaptations plus Marquee, Word Rotate, Scroll Progress, Animated List, Blur Fade, Ripple Button, Interactive Hover Button, Terminal, Dot Pattern, Grid Pattern and the existing Shimmer Button treatment. The remaining 61 entries are searchable official references, not mounted demos or installed code. Only one workbench preview runs at a time. On real pages, the localized homepage ribbon uses Marquee and Word Rotate, journal articles use Scroll Progress, and the existing bento, spotlight, orbit, border and blur treatments remain in place. No runtime packages were added.
