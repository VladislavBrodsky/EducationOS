# educationos.space: observed state and DNS handoff

This is a deployment runbook, not a claim of a live EducationOS deployment. No DNS, hosting, certificate, or email settings were changed by this implementation.

## Public checks performed

Observed on **18 October 2026, 00:26–00:27 America/Mexico_City** (06:26–06:27 UTC). Public DNS queries used resolver `8.8.8.8`. DNS can change and caches can disagree; repeat immediately before changing records.

| Query | Observed result |
| --- | --- |
| `educationos.space A` | `192.64.119.65`, TTL 1800 |
| `educationos.space AAAA` | NOERROR, zero answers |
| `educationos.space NS` | `dns1.registrar-servers.com`, `dns2.registrar-servers.com` |
| `www.educationos.space CNAME` | `parkingpage.namecheap.com`, TTL 1800 |
| `www.educationos.space A` | CNAME chain through `parking.d.parity.domains`; returned `2.59.170.19`, `104.219.250.36` |
| `educationos.space MX` | priority 10: `eforward1`, `eforward2`, `eforward3.registrar-servers.com`; priority 15: `eforward4.registrar-servers.com`; priority 20: `eforward5.registrar-servers.com` |
| `educationos.space TXT` | `v=spf1 include:spf.efwd.registrar-servers.com ~all` |
| `_dmarc.educationos.space TXT` | NXDOMAIN at this resolver |
| DKIM | Not checked: no provider-issued selector is available. DKIM absence cannot be inferred by guessing a selector. |
| `http://educationos.space` | 302 to `http://www.educationos.space/`; `X-Served-By: Namecheap URL Forward`; followed by 200 parking content |
| `https://educationos.space` | Connection timed out after 20 seconds; no HTTPS response verified |
| `https://www.educationos.space` | TLS connection failed: `SSL_ERROR_SYSCALL`; no HTTPS response verified |

The observations indicate registrar forwarding/parking, rather than this application. They do not establish why HTTPS failed. Initial sandboxed DNS requests failed with `Operation not permitted`; the table uses the subsequent successful approved public network check, not those sandbox failures.

## Recommended target and decision

Use a Next.js presentation host plus a managed FastAPI/Python API and worker, PostgreSQL/pgvector and private Redis in a compatible region. The Python service deployment is required; Vercel alone does not run this backend. Keep the current authoritative DNS provider; a nameserver change is unnecessary for two web hostnames and would require carefully reproducing mail records. The canonical origin in application metadata is `https://educationos.space`; explicitly configure `www` to redirect to apex. This apex choice is a project decision, while Vercel also supports a `www` canonical configuration. [Vercel domain setup](https://vercel.com/docs/domains/set-up-custom-domain)

Deployment and DNS access have not been established in this session. Required access is a project invitation through the hosting provider and the domain owner's DNS controls. Use provider OAuth or project invitations and secret dashboards. Never paste account passwords, database URLs, API keys, or session tokens into chat.

## Exact provider handoff procedure

1. Export or capture the current DNS zone and forwarding configuration, including MX, SPF and any verification records. Retain a timestamped rollback copy. The records above are observations, not replacement values.
2. Create/import the repository into the selected Vercel team, choose the Next.js framework, select supported Node.js 24 LTS, and deploy the reviewed commit to an isolated Preview environment first. Add production environment variables only in the provider's encrypted settings. Follow [DEPLOYMENT.md](DEPLOYMENT.md).
3. In **Project → Settings → Domains**, add `educationos.space` and `www.educationos.space`. Set `www.educationos.space` to redirect permanently to `https://educationos.space`. Vercel's dashboard or `vercel domains inspect educationos.space` returns the actual required DNS records. [Vercel custom-domain configuration](https://vercel.com/docs/domains/working-with-domains/add-a-domain)
4. At the existing DNS provider, replace the apex parking/URL-forward web configuration with the **exact A record value issued for this project**. Replace the `www` parking CNAME with the **exact CNAME target issued for this project**. If Vercel asks for a TXT ownership check, add its exact host and value. Do not use a generic example IP/CNAME as an assumed project value. Do not create an apex CNAME that conflicts with MX/NS records. [Vercel DNS troubleshooting](https://vercel.com/docs/domains/troubleshooting)
5. Remove conflicting web forwarding records only after the provider-issued replacements are ready. Keep existing MX and SPF unless the mail owner explicitly migrates email. Leave AAAA absent unless the host explicitly supplies an IPv6 value. If CAA restrictions exist at cutover time, use the host's certificate guidance before modifying them.
6. Wait until both names show **Valid Configuration** and the hosting provider confirms certificates are issued for both names. Check external DNS from at least two resolvers; allow for the old 1800-second TTL and any other cached values. Do not claim a fixed propagation time.
7. Verify all four entry URLs: HTTP apex, HTTPS apex, HTTP www, HTTPS www. Each must end at `https://educationos.space/`, retain intended paths and query strings, and avoid loops. HTTPS certificates must cover the requested hostname before redirects can complete. Verify canonical tags and sitemap URLs use the apex HTTPS origin. Keep preview URLs out of indexing.
8. Confirm the actual EducationOS home page, demo mission flow, health/version response, legal pages and security headers. Only then record a verified production URL with release commit and check time. A 200 response from parking is insufficient.

Read-only checks, after installing Node.js 24 LTS:

```sh
node scripts/domain-check.mjs educationos.space --output=domain-report.json
DNS_RESOLVER=1.1.1.1 node scripts/domain-check.mjs educationos.space --assert-canonical
DNS_RESOLVER=8.8.8.8 node scripts/domain-check.mjs educationos.space --assert-canonical
curl -IL 'https://www.educationos.space/demo?source=verify'
curl -I https://educationos.space
```

`--assert-canonical` checks the root URL's transport and redirect outcome. Separately inspect path/query preservation, app identity and certificates. DNS lookup errors in the JSON report may be local network restrictions; preserve the error and retry from an authorized network rather than declaring the domain absent.

## Transactional email preparation

No email sending is implemented in this release. Choose a provider after adult authentication and consent flows have been reviewed. Resend is a suitable proposed provider; create a sending subdomain such as `account.educationos.space` in its dashboard to separate transactional reputation. The subdomain is a proposal, not an existing configuration. Resend requires domain verification before sending and supports disabling open/click tracking for transactional mail. [Resend verified domains](https://resend.com/docs/dashboard/domains/introduction)

| Record | Exact handoff source | Action |
| --- | --- | --- |
| SPF / sending return-path records | Provider's domain-verification screen | Copy its exact hostname, type, priority and value. Preserve forwarding at the apex. Do not publish two SPF policies at the same hostname; consolidate only after checking every legitimate sender. |
| DKIM | Provider's screen, including actual selector | Copy the full selector and public-key TXT or CNAME target exactly. Do not invent the selector or key. |
| DMARC | A reviewed policy and a real reporting mailbox | Configure `_dmarc` for the chosen sending domain. Begin with monitored policy, inspect legitimate mail authentication/alignment, then tighten after delivery verification. Do not invent a reporting inbox. |
| Existing MX | Current DNS zone | Keep receiving/forwarding records until the mail owner approves a receiving-provider migration. Sending-domain verification does not require removing apex mail forwarding. |

Confirm provider verification, send a test only to a controlled adult mailbox, and inspect `Authentication-Results` for SPF, DKIM and DMARC alignment before enabling account email. DMARC policy must account for all legitimate senders. [Resend DMARC guidance](https://resend.com/docs/dashboard/domains/dmarc)

To query an actual issued DKIM selector:

```sh
DKIM_SELECTOR=actual_provider_selector node scripts/domain-check.mjs account.educationos.space
```

The script never edits DNS or sends email. Store any future email API key on the server, scoped by environment; disable message-body and address logging, open tracking and click tracking for account mail.
