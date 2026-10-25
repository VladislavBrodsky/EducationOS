# EducationOS × Magic UI visual system

Captured 25 October 2026 from [the component catalogue](https://magicui.design/docs/components) and the linked component pages. Firecrawl scrape `01a17403-ab0b-72fc-9896-7bf4e5db7053` returned branding, text, and a full-page capture. A separate native-browser screenshot of Bento Grid was inspected at 1280×720. Component registry source and the MIT license were read before adaptation.

## Reference evidence

The captured documentation uses Geist, a white canvas (`#FFFFFF`), near-black text (`#0A0A0A`), neutral rules, compact navigation, and generous separation around previews. Firecrawl reported 14px body text, 36px h1, 4px spacing unit, and 8px button radius. These describe the captured documentation, not every component. The preview cards show softer corners and subtle inset/drop shadows; their exact spacing was not extracted. The catalogue's purple promotional accent is not used as the EducationOS accent.

![Inspected reference capture](https://storage.googleapis.com/firecrawl-scrape-media/screenshot-fb9c0225-64c1-4ecf-8b52-bfdab28f12d2.png?GoogleAccessId=scrape-bucket-accessor%40firecrawl.iam.gserviceaccount.com&Expires=1793552564&Signature=QUVrqjkpI9qiQg2dgvt2XGTVMxX8rR%2FNEP5h76ENZ4SBy607vhfZepkMeJXJkAolI2ORBGh7FR7fYW5atQ4%2B5fSmuYEBv3hAMrxC0a6N6wRtvIO%2FZhMy3U6SNZm8lp6p%2FQt9Uy4n709Yu5Car8R8qY2fgGzzN2XWptMgGpzboxHOjATcdEEl1GDz83kI70XVFrpM2lzzNLqed0sBsxaYuWb%2FUosfPzjQDx%2FADEBbF0gDZTBtROTaFLfKausGapMICqX2T14Jwqd4kwqg%2BLwgK7Ejdz7sQXyD%2F%2FzvZIS%2FYqIsNoEUY6WqsJ9sMCKzVlBUuXG2JjUIV%2B9OiEeoVSaKxg%3D%3D)

The hosted screenshot is a temporary research capture. The live reference URLs remain the durable source; reference artwork is not shipped in the application.

## Selected components and adaptations

| Reference | EducationOS use |
| --- | --- |
| [Orbiting Circles](https://magicui.design/docs/components/orbiting-circles) | Four science icons orbit the hero artwork; responsive radius, decorative semantics, explicit pause, and static reduced-motion positions |
| [Shine Border](https://magicui.design/docs/components/shine-border) | A thin lime highlight around the hero and detail-page artwork; ordinary borders remain as a fallback |
| [Magic Card](https://magicui.design/docs/components/magic-card) | Cursor-position spotlight on method, age, journal, and showcase links; keyboard focus and touch access remain fully usable |
| [Bento Grid](https://magicui.design/docs/components/bento-grid) | A working paper-shape model, evidence preview, and Loop Loom entry in a responsive asymmetric composition |
| [Shimmer Button](https://magicui.design/docs/components/shimmer-button) | Custom one-pass hover/focus glint on primary actions; link labels are always visible |
| [Blur Fade](https://magicui.design/docs/components/blur-fade) | Custom single-entry movement using the browser animation API; text opacity stays unchanged for legibility |
| Dot/grid backgrounds | Static CSS patterns add depth without per-dot rendering or a canvas loop |

The source-based adapters are in `src/components/magicui/`; copyright, license, and changes are recorded in its NOTICE. The official motion/theme dependencies were replaced by scoped CSS and small React islands. No animation runtime or theme provider was added. The font is the pinned, locally served Manrope Variable 5.3.0 package, including Cyrillic and Latin subsets; its OFL and Magic UI's MIT license are also available in `public/licenses/`.

## EducationOS choices

Preserve paper white, ink `#171a16`, and lime `#d5fc51`. Use a forest/ink hero stage, translucent neutral panels, 20–27px showcase corners, soft shadows, Manrope headings/body with the existing Georgia italic accent, and professional Lucide icons. These are proposed EducationOS choices rather than extracted Magic UI values. Existing transparent science/learner artwork is reused; no reference logos or illustrations are copied.

All new visible copy has Spanish, English, and Russian variants. The paper model demonstrates shape only and explicitly invites a real experiment; it invents no strength measurements. English activity destinations are labelled. The Loop Loom card connects the public experience to the existing learning workspace.

## Behavior and verification

Content and links render in server HTML. JavaScript adds pointer lighting, one-time section movement, and the paper-shape switch. Motion has a visible pause button and respects device reduced-motion settings; no essential content depends on hover or animation. Responsive checks cover 320, 390, 768, and 1440px. Browser verification covers paper controls, pause/resume, reduced motion, no-JavaScript content, locale routes, accessibility, and existing learning journeys. Screenshots are reviewed locally before a release is described as live.

