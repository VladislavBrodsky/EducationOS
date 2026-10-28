# Magic UI adaptations

Source: https://github.com/magicuidesign/magicui and https://magicui.design/docs/components, inspected 25 October 2026. Copyright (c) Magic UI. The MIT license is included in `LICENSE`.

`orbiting-circles.tsx`, `shine-border.tsx`, and `bento-grid.tsx` adapt the official registry component structure. `magic-card.tsx` adapts the pointer-coordinate spotlight pattern. Styles and APIs are changed for EducationOS's ink/lime palette, semantic links, local rendering, reduced motion, and explicit animation pause. Motion and theme-provider dependencies were replaced with scoped CSS and small React interactions. The bento content, paper bridge model, copy, and science artwork belong to EducationOS.

References: [Bento Grid](https://magicui.design/docs/components/bento-grid), [Magic Card](https://magicui.design/docs/components/magic-card), [Orbiting Circles](https://magicui.design/docs/components/orbiting-circles), [Shine Border](https://magicui.design/docs/components/shine-border). The button glint and single-entry transition are custom CSS/browser implementations informed by [Shimmer Button](https://magicui.design/docs/components/shimmer-button) and [Blur Fade](https://magicui.design/docs/components/blur-fade).

No premium templates, reference illustrations, testimonial identities, or reference marketing claims were copied.

`progressive-blur.tsx` adapts the layered backdrop-filter and gradient-mask approach from the [official Progressive Blur registry](https://magicui.design/r/progressive-blur.json), inspected 28 October 2026. It adds horizontal edges, uses five restrained blur layers, and keeps the overlays outside the scroll viewport so they remain fixed and never intercept input. The reusable subject rail adds icons, explicit pause and direction controls, automatic overflow-only scrolling, reduced-motion support, and suspension while the reader hovers, focuses, touches or manually scrolls the list.
