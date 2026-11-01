# Hero media audit and correction

Verified 1 November 2026

The reported Method illustration combined a static border with an animated Shine Border. Its square image was contained in a separately sized box with10px image padding, leaving a hard rectangular tabletop edge inside the rounded frame. A decorative orbit and pause control added layers over a static illustration. The shared Programs and Safety hero used the same structure.

The shared detail hero now uses one neutral rounded frame at the assets' natural1:1 ratio, with no image padding, background orbit or overlaid control. Original WebP assets and the visible AR concept disclaimer are preserved. The journal and homepage use separate media layouts and were not changed. The follow-up audit also restored method card colors and bottom spacing lost when sections moved into semantic list items.

Executed validation: ESLint, TypeScript,144 unit tests, icon policy and production build passed. Four focused browser tests passed against that production build. The hero check covers all three affected pages at320/390/768/1440px, decoded image/frame alignment, captions below the image, no document overflow and translated hero accessibility. Existing real-page checks cover six method-page accessibility scans, keyboard/native scrolling and no-JavaScript content. Saved phone/desktop figures for all three pages were visually inspected in `artifacts/hero-fix/` (local, ignored).

Reproduce with `npx playwright test tests/e2e/hero-media.spec.ts tests/e2e/live-page-motion.spec.ts` after a production build and browser installation. This is viewport/browser testing, not physical-device or independent accessibility certification. Deployment status and post-deployment checks are reported separately at handoff; local passes do not imply a live rollout.
