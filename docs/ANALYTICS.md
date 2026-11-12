# Website analytics (Google Analytics 4)

GA4 measures the **public marketing website only**, and only after the visitor accepts.

| | |
|---|---|
| Property | EducationOS — `564165927` (account `416201188`) |
| Web stream | `https://educationos.space` — stream `16331331245` |
| Measurement ID | `G-P5EBK61FRJ` (set as `GA_MEASUREMENT_ID` on the marketing Railway service only) |

## How it works

- `src/components/analytics.tsx` shows a localized consent banner (es/en/ru) with two equal choices. Nothing from Google loads before “Allow analytics” (Consent Mode v2, basic mode). The choice is stored in `localStorage` (`educationos.analytics-consent`) and asked again after 12 months. The privacy notice has a “Change analytics choice” button; declining later deletes the `_ga` cookies.
- The tag is rendered only when `DEPLOYMENT_ENV=production`, `GA_MEASUREMENT_ID` is a valid `G-` id, and the request is **not** on the learner portal host.
- `src/lib/analytics.ts` `isAnalyticsPath()` excludes `/demo`, `/portal`, `/studio`, `/components` and `/api`. Page views are sent by the component (not by GA's automatic history tracking), and `ga-disable-<id>` is set on excluded routes, so client-side navigation into the demo is never measured.
- Consent defaults: `analytics_storage` granted after opt-in; `ad_storage`, `ad_user_data`, `ad_personalization`, `functionality_storage`, `personalization_storage` denied; Google signals and ad personalization off; `ads_data_redaction` on.
- `src/proxy.ts` adds Google's documented CSP hosts (`*.googletagmanager.com`, `*.google-analytics.com`, `*.analytics.google.com`) only on the marketing host in production when the ID is set.

## Events

| Event | When | Key event |
|---|---|---|
| `page_view` | Each marketing route | — |
| `demo_start` | Click on any link into `/demo…` from a marketing page (`link_url`, `link_text`, `cta_location`) | Yes |
| `share` | Journal story shared or link copied (`method`, `content_type`, `item_id`) | — |
| Enhanced measurement | Scrolls, outbound clicks, file downloads, site search | — |

Use `trackEvent(name, params)` from `@/lib/analytics` for new events; it is a no-op without consent or on excluded routes. Do not send names, emails, ages or any learner data as parameters.

## GA4 admin settings (applied 2026-11-12)

Data retention 14 months; Google signals off; ads personalization off; enhanced measurement “page changes based on browser history events” off (the site sends page views itself); industry category Jobs & Education. Pending: star `demo_start` as a key event in Admin → Events once GA lists it (it first arrived 2026-11-12).

## Testing locally

```bash
npm run build && DEPLOYMENT_ENV=production GA_MEASUREMENT_ID=G-TEST0000000 npx next start -p 3417
```

Use a fake ID like `G-TEST0000000` so local testing never reaches the real property. `tests/analytics.test.ts` covers route gating, ID validation and stored consent.
