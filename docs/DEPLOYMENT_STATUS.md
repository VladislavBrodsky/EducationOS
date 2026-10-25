# Live EducationOS frontend deployment

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
