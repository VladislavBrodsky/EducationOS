# Learner portal at app.educationos.space

The public website and learner portal share this Next application, with separate navigation, layouts and routes. Deploy the public site at `https://educationos.space` and the portal at `https://app.educationos.space` using the isolated service settings below. This document describes the routing configuration; actual domain and certificate verification belongs in [DOMAIN.md](DOMAIN.md). Deploying the portal does not open enrollment or provision learner accounts.

## Route contract

| Browser URL | Application route | Surface |
|---|---|---|
| `educationos.space/` | `/` | Existing public website |
| `educationos.space/programs` | `/programs` | Existing public website |
| `educationos.space/demo` | `/demo` | Existing Inventors Lab demo |
| `educationos.space/portal/labs/<id>` in public mode | Redirect to `app.educationos.space/labs/<id>` | Dedicated learner portal |
| `localhost:3000/portal` | `/portal` | Local portal preview |
| `app.educationos.space/` | `/portal` internally | Portal Today page |
| `app.educationos.space/subjects` | `/portal/subjects` internally | Subject catalog |
| `app.educationos.space/learn/<id>` | `/portal/learn/<id>` internally | Lesson workspace |
| `app.educationos.space/labs` | `/portal/labs` internally | Discovery lab collection |
| `app.educationos.space/labs/<id>` | `/portal/labs/<id>` internally | Interactive Anatomy class |
| `app.educationos.space/projects` | `/portal/projects` internally | Learner projects |
| `app.educationos.space/progress` | `/portal/progress` internally | Learning progress |
| `app.educationos.space/guardian` | `/portal/guardian` internally | Guardian preview |

The proxy matches `app.educationos.space` exactly, with an optional port for local host testing. It does not use `x-forwarded-host` or hostname suffixes to choose a surface. App URLs containing the internal `/portal` prefix redirect to their clean counterparts. Query strings are preserved.

On the app host, `/privacy`, `/safety`, `/accessibility`, `/terms`, `/approach`, `/programs` and `/trust` redirect to the public origin. Unknown URLs stay inside the portal and show its not-found screen. The public home page cannot be reached by an unknown app path. `/api/v1/*` retains its existing FastAPI forwarding; Next assets and `/robots.txt` keep their handlers.

The proxy overwrites the internal `x-educationos-portal-host` request header with `true` or `false` before the layout chooses a link base. Do not accept this header from an upstream as a substitute for the proxy. Portal routes use a `/portal` link base for local previews and clean paths on the app host.

`skipProxyUrlNormalize: true` keeps internal rewrites on the exact server origin. This avoids Next converting a local `127.0.0.1` origin to `localhost`, treating that rewrite as an external self-request and dropping the trusted portal/nonce headers. Browser redirects use the validated incoming Host, while internal rewrites keep the server origin. The App Router lesson paths and FastAPI rewrite remain unchanged.

## Hosting choices

**One deployment, two hostnames:** attach both `educationos.space` and `app.educationos.space` to the same Next deployment. Keep `EDUCATIONOS_SURFACE=auto` (the default). The exact hostname selects the surface. Provider preview domains show the public site at `/` and the portal at `/portal`.

**Separate public and portal deployments (production configuration):** build this same repository in two services:

| Service | Custom domain | `EDUCATIONOS_SURFACE` |
|---|---|---|
| `educationos-marketing` | `educationos.space` and intentionally supported `www` | `public` |
| `educationos-portal` | `app.educationos.space` | `portal` |

Public mode always selects the marketing layout regardless of the incoming Host. Its `/portal` and `/portal/*` URLs redirect permanently to the absolute app origin with the internal prefix removed, including the incoming query string. Other unknown public paths keep the public not-found handler. This prevents the marketing service from serving learner content through the local preview prefix. Local development can retain `auto` to use `/portal` previews.

Portal mode serves the learner portal on every hostname, including provider preview domains, with clean learner paths. Do not attach `educationos.space` or `www.educationos.space` to that service. Public policy links continue to redirect to the marketing origin.

`EDUCATIONOS_SURFACE` is server-only and should be set consistently at build and runtime. Portal pages and app responses always send `X-Robots-Tag: noindex, nofollow`, including when `DEPLOYMENT_ENV=production`. App `/robots.txt` disallows all crawling and advertises no sitemap. App `/sitemap.xml` stays inside the portal and returns not found. The public sitemap remains unchanged, and public robots rules disallow `/portal`, `/demo` and `/api/`.

## Domain and API handoff

1. Create or select the Next hosting deployment and choose one of the configurations above. Add `app.educationos.space` as a custom domain there.
2. Obtain the exact DNS record issued by the selected hosting provider. Add only its requested `app` record at the DNS provider. Preserve the public apex, `www`, mail and unrelated records. Wait for provider validation and the app certificate.
3. Supply the protected Python service origin through `PYTHON_API_URL` before building Next. The existing `/api/v1/*` rewrite is compiled at build time. A change to this upstream requires a new build. Do not expose its credentials through `NEXT_PUBLIC_*` variables.
4. When a production Python service is connected, include `https://app.educationos.space` in its exact `EDUCATIONOS_ALLOWED_ORIGINS` list alongside any intentionally supported public origin. Use separate staging origins and credentials for previews. Account/session policy and authorization remain Python responsibilities.
5. Keep enrollment, production identity, consent and learner records closed until their existing launch gates in [DEPLOYMENT.md](DEPLOYMENT.md) are met. The portal preview alone does not provide authentication or a production data service.

## Verification before connecting DNS

Run `npm test -- --run tests/portal-routing.test.ts`, `npm run typecheck` and `npm run build`. With the local server running, check both surfaces using an explicit host:

```sh
curl -i -H 'Host: app.educationos.space' http://127.0.0.1:3000/
curl -i -H 'Host: app.educationos.space' http://127.0.0.1:3000/subjects
curl -i -H 'Host: app.educationos.space' http://127.0.0.1:3000/robots.txt
curl -i -H 'Host: app.educationos.space' http://127.0.0.1:3000/privacy
curl -i -H 'Host: app.educationos.space' http://127.0.0.1:3000/sitemap.xml
curl -i -H 'Host: educationos.space' http://127.0.0.1:3000/
```

Expect portal content for the first two requests, all-crawler disallow with no sitemap in app robots, a public-origin redirect for privacy, not found for the app sitemap, and the existing marketing home for the public host. Confirm `X-Robots-Tag: noindex, nofollow` on portal responses. Also test `/portal` locally and navigate through subjects, lessons, projects, progress and the guardian view using the keyboard and a narrow viewport.

After provider validation, repeat the checks over the real HTTPS app domain, including direct lesson links and refreshes. Confirm public HTTPS and canonical redirects still work, and that `/api/v1/*` reaches the expected Python deployment. Record the actual provider, target, certificate and verification results in [DOMAIN.md](DOMAIN.md); do not record a prepared configuration as a completed deployment.

For isolated production services, also verify `https://educationos.space/portal` returns a `308` redirect to `https://app.educationos.space/`, `https://educationos.space/portal/labs/loop-loom?from=home` redirects to the same clean app path and query, and unknown public paths do not show the portal. Check the marketing root still shows its existing public content and the app root shows learner navigation.
