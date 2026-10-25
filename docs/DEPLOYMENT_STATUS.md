# Live EducationOS frontend deployment

The robot hero illustration now sits on a transparent backdrop: the dark green gradient, glow, dots and animated frame are removed, and labels/caption use contrast suited to the white page. This corrects the previously misidentified paper-card edit, whose original appearance is restored. Verified source `90c2a35`, tag `v0.6.0-preview.12`, marketing deployment `9a17058c-96db-4fa0-a15e-205c402e88ac` (`SUCCESS`): lint/TypeScript and four focused local browser checks passed; two live interaction/motion checks passed, with local mobile and live desktop screenshots confirming the hero backdrop.

The interactive paper-bridge card now has a transparent background with its green gradient and dotted texture removed. This CSS-only follow-up is live from `01a7d9c`, tag `v0.6.0-preview.11`, marketing deployment `cbc049c4-ea54-407d-9310-29648f233730` (`SUCCESS`). The existing paper-model pointer/keyboard test passed locally and over live HTTPS; the published card was visually checked against the white page.

## Compact language dropdown and mobile menu on 25 October 2026

The compact language dropdown and mobile hamburger navigation are live at [educationos.space](https://educationos.space), source `c8441f5`, release `v0.6.0-preview.10`, successful marketing deployment `a4aeedb0-81c4-4aa5-863f-71ddcdcb92b2`. Both controls support keyboard access, Escape and outside dismissal; mobile links close after selection, show the current section, and stay reachable in a short landscape viewport. Native disclosures retain navigation without JavaScript. The frontend-only archive contains 145 files (2,626,116 bytes); the learner portal remains on `9151626c-459c-4006-bc70-818a7ee1b96f`.

Lint, TypeScript, icon policy, production build, 134 frontend unit tests, 39 backend tests and the full-stack smoke test passed. Six focused browser checks passed against live HTTPS, including all three languages, article/detail translation, keyboard recovery, accessibility, 320px layouts, landscape and navigation without JavaScript. The complete browser run passed 68 tests and found one older test assuming always-visible mobile navigation; that journey was updated in `7efbee9` and passed live. Full CI is rerunning with the corrected test; no all-green CI claim is made for this release record. No DNS, API, enrollment or learner-data access changes were made.

## Clearer landing hero on 25 October 2026

The refined hero is live at [educationos.space](https://educationos.space) from source `808e3d3`, tagged `v0.6.0-preview.9`. Marketing deployment `a9388488-8441-4b72-8107-134fbe6e4e25` reports `SUCCESS`. A compact age label, concrete learning description, dominant mission action with paper-bridge/seven-step context, visible English-demo notice, and quieter method link improve the mobile and desktop hierarchy in all three languages. All six GitHub checks passed (134 frontend unit, 68 browser, 39 backend tests and the full-stack smoke test); four focused live browser checks passed for layout, artwork, localized accessibility and the complete mission. The portal remains on `9151626c-459c-4006-bc70-818a7ee1b96f`; HTTPS redirects and portal indexing protection remain verified. [Release evidence](deployment/hero-2026-10-25.json) records the frontend-only archive and scope. No DNS, API, enrollment or learner-data access changes were made.

## Solvable interactive tasks on 25 October 2026

The checked paper-bridge mini-challenge and shared success/error/retry workflow are live on both [the public website](https://educationos.space) and [the learner portal](https://app.educationos.space). Marketing deployment `63047e28-e1fa-4aef-9cc4-b20bd23d4e24` and portal deployment `9151626c-459c-4006-bc70-818a7ee1b96f` report `SUCCESS` from the same frontend-only source `2fe3e17`, tagged `v0.6.0-preview.8`. The source archive has 142 files and excludes backend and environment files.

All six GitHub checks passed: 134 frontend unit tests, 68 browser tests, 39 backend tests, and the full-stack smoke test. Twenty live browser checks passed, including all fifteen lesson recovery flows, the three landing languages, mobile code errors, lab prediction guidance, blocked skipped mission steps, and a complete seven-step mission with export. The public redirect preserves path/query; the portal and demo retain `noindex, nofollow`. Localhost remains available on port 3100.

[Release evidence](deployment/interactive-tasks-2026-10-25.json) records source, deployment IDs, archive details, checks, and limits. [The interactive task contract](INTERACTIVE_TASKS.md) distinguishes objective checks from self-recorded writing and physical observations. Browser checks use Chromium viewports; no physical-device or accessibility certification is claimed. The release changes no DNS, private Python API, enrollment, or learner-data access controls.

## Magic UI visual upgrade on 25 October 2026

The animated science hero, spotlight cards, responsive bento showcase with a working paper model, original age-group artwork, and locally served Manrope typography are live at [educationos.space](https://educationos.space). Railway marketing deployment `53862ae1-7c5a-4074-8113-b24382d30343` reports `SUCCESS` from source `ce44ebc` and release tag `v0.6.0-preview.7`. The frontend-only archive has 138 files. The earlier navigation and accessibility audit fixes are included.

All six GitHub checks passed: 131 frontend unit tests, 49 browser tests, 39 backend tests, and the full-stack smoke test. Six focused live browser tests verified the three marketing languages, journal navigation, paper controls, pause/resume, reduced motion, no-JavaScript content, artwork, and horizontal fit at 320px, 390px, and 1440px. The public `www` redirect preserves path/query; the separate portal remains on deployment `89e503e6-63c0-4ef9-9f33-5e36ca49f950` with `noindex, nofollow`. Localhost remains available at port 3100.

[Release evidence](deployment/magicui-2026-10-25.json) records the exact source archive and checks. [Component decisions and attribution](design/magicui/DESIGN.md) document the adapted Magic UI components and licenses. This release changes the existing marketing service only. The PR remains draft pending native-speaker editorial review; legal, safety, accessibility, and learner activities remain English. Browser checks use Chromium viewports rather than physical devices.

## Marketing polish on 25 October 2026

The corrected age-group and learning-method hero artwork, linked landing cards, localized Open Graph previews, article-specific social images, and SVG favicon are live at [educationos.space](https://educationos.space). Railway marketing deployment `618375a7-5ef3-40e5-a1fe-643984a143ff` reports `SUCCESS` from source commit `e1a2c29` and release tag `v0.6.0-preview.6`. Its exact frontend-only upload contains 125 files and no backend or environment files. All six GitHub checks passed; five focused browser tests passed against live HTTPS.

Live desktop `/programs` and mobile `/ru/approach` returned 200 with loaded hero images and zero horizontal overflow. The portal deployment remained `89e503e6-63c0-4ef9-9f33-5e36ca49f950`. The Python staging API, DNS, and learner enrollment controls were not changed. [Release evidence](deployment/marketing-polish-2026-10-25.json) and [source manifest](deployment/marketing-polish-manifest-2026-10-25.json) record the exact rollout. The PR remains draft pending native-speaker editorial review; legal, safety, accessibility, and learner demo content still uses English.

## Core marketing localization on 25 October 2026

The age-group, learning-method, and trust-center pages now share the editorial marketing design and have equivalent Spanish, English, and Russian routes. Railway marketing deployment `f07552c1-7073-4ab7-934f-30e687994b0d` reports `SUCCESS` from frontend-only source commit `0169680` (release tag `v0.6.0-preview.5`) on `codex/marketing-v2-i18n`. The exact upload has 124 files, excludes backend and environment files, and built with the pinned Node 24 Dockerfile. All six GitHub checks and 15 focused local browser checks passed.

Live HTTPS checks returned 200 for all nine new routes, with matching document languages, localized titles, canonical URLs, and `es`/`en`/`ru`/`x-default` alternates. Desktop Spanish programs, mobile Russian approach, and mobile Spanish trust loaded without browser errors or horizontal overflow. The portal homepage still returned 200 with `noindex, nofollow`; Railway confirms its deployment stayed `89e503e6-63c0-4ef9-9f33-5e36ca49f950`. The new marketing release did not change the private Python staging API, DNS, or learner enrollment controls.

Source inventory: [stage 2 manifest](deployment/marketing-stage2-manifest-2026-10-25.json). Verification record: [stage 2 evidence](deployment/marketing-stage2-2026-10-25.json). The marketing PR remains draft while Spanish and Russian copy awaits native-speaker editorial review. Safety, legal, accessibility, and learner demo pages still use English and are labeled as such in localized navigation.

## Marketing v2 release on 25 October 2026

The Spanish-first landing page and trilingual Curiosity Journal are live at [educationos.space](https://educationos.space). Railway marketing deployment `aab2a994-d81a-4fc5-8fbf-2c3257427bbc` reports `SUCCESS` from a frontend-only snapshot of reviewed source commit `429bf9c` on branch `codex/marketing-v2-i18n`. The snapshot contains 119 files and no backend or environment files. The pinned Node 24 Dockerfile compiled the Next.js application and generated all 39 pages. Automatic GitHub deployment remains disabled; this was an explicit marketing-service upload.

Live HTTPS checks returned 200 for all 18 landing, journal-index, and article routes across Spanish, English, and Russian. The sampled pages had matching document languages, localized titles, canonical URLs, and reciprocal language alternatives. Four homepage images returned 200. `www.educationos.space/blog?source=release-check` returned 308 to the equivalent apex URL. Desktop and mobile browser checks found no page errors or horizontal overflow. The separate learner portal still returned 200 with `noindex, nofollow`, and its Railway deployment remained `89e503e6-63c0-4ef9-9f33-5e36ca49f950`.

The exact upload contents are in the [marketing v2 manifest](deployment/marketing-v2-manifest-2026-10-25.json), and the live checks are summarized in [marketing v2 evidence](deployment/marketing-v2-2026-10-25.json). [Draft PR #3](https://github.com/VladislavBrodsky/EducationOS/pull/3) retains the code review and six passing CI checks. Learner demo, legal, and trust pages remain English pending specialist translation review. The Python API remains private in staging, disconnected from this marketing release.

## Verified release on 25 October 2026

Both production frontend services were explicitly redeployed from the frontend-only contents of Git tag `v0.6.0-preview.3` (commit `da6fa2c`). Railway reports `SUCCESS` for marketing deployment `13b25370-9c83-4a7d-9eb5-0fb0c0c67c11` and portal deployment `89e503e6-63c0-4ef9-9f33-5e36ca49f950`. The tagged frontend files match the previous live frontend; this release aligns the running builds with the reviewed GitHub snapshot. Automated deployment from GitHub remains disabled.

External HTTPS checks returned 200 for the apex homepage and `/programs`, and confirmed that `www` redirects to the apex while preserving `/demo?source=deploy-check`. The portal homepage, `/labs`, and `/subjects` returned 200 with `noindex, nofollow`; its `/privacy` link reached the apex policy page. Both hosts returned HSTS, and the marketing host returned `nosniff`. The Python API remains private in isolated staging and is not connected to these production Next services. No account enrollment or learner-facing AI was enabled.

## Verification on 24 October 2026

Marketing deployment `8f41c993-9ca0-4c8f-bb4e-02b83bc75376` succeeded from reviewed frontend commit `50fe5ca`. The live `/programs` page returned HTTPS 200 at 1440px and 390px. Its age-stage label color is `#52683d` (5.87:1 against its card background); both hosted browser scans found zero automated WCAG A/AA violations and no horizontal overflow. Desktop and mobile screenshots are saved locally under `artifacts/programs-live-*.png`. The portal service was not redeployed. Draft PR #2 passed all six CI jobs on `d473710`, which also adds a closed Python staging mode.

An isolated Railway `staging` environment (`06300c84-ab85-4149-8683-abc3845b5fcc`) runs private PostgreSQL 18.6 with pgvector 0.8.7 and authenticated Redis. Each has a persistent 5 GB volume and a generated credential. PostgreSQL answered a version/extension query and Redis answered an authenticated `PING`. A migration job pinned to reviewed commit `931e5bc` succeeded; the database reports Alembic revision `0001_python_foundation`, forced row security on all five learner-related tables, and active row security under the restricted `educationos_app` role. The API deployment `6cd9d456-9d44-4e72-a56c-1e2d0562fc89` is healthy after setting Railway's healthcheck port to 8000. In-container checks returned 200 for readiness and public curriculum, and 503 for private session and registration. The API, database and Redis have no public domain or TCP proxy. The live frontend remains disconnected from staging; production site, DNS and portal deployments are unchanged.

Verified on 18 October 2026. The original domain cutover is recorded below; the later portal navigation release is summarized here.

| Surface | Live URL | Railway service | Routing mode |
|---|---|---|---|
| Learner portal | https://app.educationos.space | `educationos-portal` | `EDUCATIONOS_SURFACE=portal` |
| Marketing website | https://educationos.space | `educationos-marketing` | `EDUCATIONOS_SURFACE=public` |
| Public www entry | https://www.educationos.space | Marketing service; redirects to apex | Public only |

The services are separate. The marketing deployment redirects `/portal/*` to clean app URLs; it does not serve the learner workspace at those paths. App policy links return to the public website. Unknown app paths remain in the portal. App pages send `noindex, nofollow`; its robots file disallows crawling and its sitemap URL returns 404. Existing marketing content and the original demo remain separate from the learner portal.

## Visual release

The original child-centred learning visuals and 3D object system are live on the separate marketing and learner services. Marketing deployment `5f271a0e-8790-434b-bd13-033aaa91db39` uses source `2629f16`; portal deployment `976032de-3289-4494-b9c2-3036a36d7e67` uses follow-up source `a43f7c8`, which fixes shared static-image routing on the app host. The apex continues to serve marketing pages and `app.educationos.space` continues to serve learner pages. The images are illustrative and do not claim AR hardware, real learner identities or measured outcomes.

After the route correction, six complete live lab journeys passed at 390×844 and 430×932 with twelve light/dark accessibility scans and zero detected violations, browser errors, failed assets, failed requests, remote writes or horizontal overflow. New images loaded on live marketing and portal pages at mobile width. Normal DNS and TLS validation were enabled in the final passing run; earlier transient network-change failures are retained in local evidence. These are browser viewport/touch checks, not physical-device testing. The reviewed source snapshots and deployment IDs are recorded in [visual deployment evidence](deployment/visual-2026-10-18.json).

## Portal navigation update

The portal update from source commit `9ec9eec` is live at `app.educationos.space` as successful deployment `4db90bd2-342d-4be1-96ae-0ab904f8cfb4`. The apex marketing service remained on deployment `dc4d7630-dcd5-469c-a979-864415beaebb`; the two surfaces and their routing were reverified. This update adds persistent mobile navigation, lab step shortcuts and saved unfinished-work resume.

Six full hosted lab journeys passed at 390×844 and 430×932. Twelve light/dark accessibility scans found zero detected violations. Navigation tap targets, focused lab headings, resumed drafts, host separation, assets and horizontal fit passed. Local checks passed with 129 unit and 33 browser tests. These are browser viewport/touch checks, not physical-device tests. Source manifest and exact deployment summary: [UI deployment evidence](deployment/ui-2026-10-18.json) and [UI manifest](deployment/ui-manifest-2026-10-18.json).

The release details below describe the earlier domain cutover and are retained as its historical record.

## Release and hosting

- Railway project: `d08710d0-4df1-4c6a-adc8-361c52e7c572`.
- Portal service: `2e6b7e2f-8ab9-4b7d-9f81-22c9c171c1fa`; successful deployment `ef741957-e7da-482b-9b92-f358031e3743`.
- Marketing service: `bf43668a-197d-4b94-94d2-9b09d92e44f9`; successful deployment `dc4d7630-dcd5-469c-a979-864415beaebb`.
- Build: existing pinned Node 24 Dockerfile and Next standalone runtime, target port 3000.
- Runtime variables: `DEPLOYMENT_ENV=production`, `PORT=3000`, and the service-specific surface mode above.
- Source: a frontend-only snapshot of this working tree based on commit `e96d350`, including `src`, `public`, `shared`, package lock, Next/TypeScript/PostCSS configuration, and Dockerfile. It contains 95 files, 1,221,877 bytes. No local environment files, credentials, backend data, reference archive or browser work was uploaded.
- Release manifest SHA-256: `3e481edf79638f38ee2f025d79ca6009443ddfa69b4e31c3371730670f6fcf66`. The exact manifest is preserved in [frontend-manifest-2026-10-18.json](deployment/frontend-manifest-2026-10-18.json). All 94 application/configuration files match release commit `e08c9a7`; the remaining file is a packaging-only `.dockerignore` in the temporary upload directory, whose exact contents are recorded in the deployment evidence.
- Source and review: release commit `e08c9a7` is published on `codex/python-first-foundation` with explicit user approval, and [pull request #2](https://github.com/VladislavBrodsky/EducationOS/pull/2) contains the prepared review text. All three [GitHub check jobs](https://github.com/VladislavBrodsky/EducationOS/actions/runs/39112744671) passed for that commit. Hosting uses explicit CLI uploads; automatic GitHub deployment is not connected.

`PYTHON_API_URL=http://127.0.0.1:8000` intentionally has no running production backend in these frontend services. The three discovery labs run locally in the browser. Accounts, enrollment, cloud learning records and learner-facing generative AI remain closed. The original demo keeps its labelled offline curriculum fallback when its API cannot be reached.

## DNS and certificates

Namecheap remains authoritative. The previous web configuration was registrar parking/forwarding, not a working HTTPS marketing deployment. It was replaced with the isolated marketing service. Mail forwarding, all five MX entries, SPF, nameservers and DNSSEC settings were preserved.

| Record | Host | Target |
|---|---|---|
| CNAME | `app` | `21i76llp.up.railway.app` |
| ALIAS | `@` | `yx7e3cwb.up.railway.app` |
| CNAME | `www` | `pzh62mvu.up.railway.app` |
| TXT ownership checks | `_railway-verify.app`, `_railway-verify`, `_railway-verify.www` | Exact Railway-issued values saved at the registrar |

Railway reports ownership verified and valid certificates for all three hostnames. DNS was checked at the authoritative server and at 1.1.1.1 and 8.8.8.8. The apex ALIAS flattens to Railway's current A address; do not replace it with a literal root CNAME or a guessed static IP. Railway's literal CNAME status field remains blank/`REQUIRES_UPDATE` for that flattened apex; the actual A response, ownership, valid certificate and HTTPS marketing response were verified. [Railway's documented root-domain configuration](https://github.com/railwayapp/docs/blob/166e6d1b1eb53fa7a2ca551e9b3c1e5097ab72ed/content/docs/networking/domains/working-with-domains.md) supports dynamic ALIAS records.

## Verification after deployment

All three classes passed complete learning journeys at **390×844** and **430×932**, using touch/mobile Chromium emulation: predictions, manipulation, feedback, transfer questions, recording and reload. Tests checked 2D alternatives, all four cube presets, actual Anatomy reprojection and layer isolation. Twelve light/dark WCAG A/AA scans found zero violations, with no horizontal overflow, uncaught browser errors, failed assets or remote writes.

Normal user Chrome separately completed the three classes on the actual app hostname at 390px, including the cube's 3D and 2D views, then confirmed saved records and layouts at 430px. It also opened the actual marketing homepage. No DNS override or certificate exception was used in that browser.

The CLI's system resolver retained old DNS answers. Automated headless runs therefore selected freshly queried public DNS answers inside their Chromium process; normal TLS hostname/certificate validation remained enabled. No system DNS, hosts file or certificate setting changed. The raw mobile report retains an independent marketing timeout from before the apex cutover; the later host-separation report confirms its resolution.

Live HTTPS checks passed for the marketing homepage, `www` path/query redirect, marketing-to-app learner redirect, app-to-public privacy redirect, clean app routes, noindex headers, robots and absent app sitemap. Local validation after the routing change passed TypeScript, lint and **123 unit tests**; both cloud production builds succeeded.

Durable summary: [deployment evidence](deployment/live-2026-10-18.json). Full local evidence and screenshots are in `artifacts/live-portal-custom/` and `artifacts/deployment/`. These are viewport/touch simulations, not tests on physical iOS or Android hardware.

## Later updates

Deploy each service explicitly by its service ID and environment. Keep `portal` and `public` surface settings separate. Build from the reviewed source, including the shared curriculum file; the first upload without that file failed before serving traffic and was corrected. Do not deploy the portal service on apex or `www`.

Before a future DNS change, capture the current zone, retain the provider-issued targets above as the rollback reference, and preserve mail records. Repeat HTTPS and mobile verification after changing either deployed source or domain settings.
