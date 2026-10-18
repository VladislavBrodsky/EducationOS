import { Resolver } from 'node:dns/promises';
import { writeFile } from 'node:fs/promises';

// Read-only checks. DKIM records cannot be enumerated; supply the actual selector
// issued by the chosen sending service, never a guessed selector.
const args = process.argv.slice(2);
const domain = args.find((arg) => !arg.startsWith('--')) ?? 'educationos.space';
if (!/^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/i.test(domain)) {
  throw new Error('Supply a DNS hostname, without a protocol or path.');
}
const output = args.find((arg) => arg.startsWith('--output='))?.slice(9);
const selector = process.env.DKIM_SELECTOR;
if (selector && !/^[a-z0-9_-]{1,63}$/i.test(selector)) throw new Error('Invalid DKIM_SELECTOR.');
const resolver = new Resolver({ timeout: 5000, tries: 1 });
if (process.env.DNS_RESOLVER) resolver.setServers([process.env.DNS_RESOLVER]);
const query = async (hostname, type) => {
  try { return { hostname, type, records: await resolver.resolve(hostname, type) }; }
  catch (error) { return { hostname, type, records: [], error: error.code ?? 'DNS_ERROR' }; }
};
const requests = [
  [domain, 'A'], [domain, 'AAAA'], [domain, 'NS'], [domain, 'MX'], [domain, 'TXT'],
  [`www.${domain}`, 'CNAME'], [`www.${domain}`, 'A'], [`_dmarc.${domain}`, 'TXT'],
];
if (selector) requests.push([`${selector}._domainkey.${domain}`, 'TXT']);

async function inspectHttp(start) {
  const chain = [];
  let current = new URL(start).href;
  try {
    for (let hop = 0; hop < 8; hop += 1) {
      const response = await fetch(current, { method: 'HEAD', redirect: 'manual', signal: AbortSignal.timeout(10000) });
      const location = response.headers.get('location');
      chain.push({ url: current, status: response.status, location });
      if (response.status < 300 || response.status > 399 || !location) return { start, chain };
      const target = new URL(location, current);
      if (!['https:', 'http:'].includes(target.protocol)) throw new Error('Unsupported redirect protocol.');
      current = target.href;
    }
    return { start, chain, error: 'TOO_MANY_REDIRECTS' };
  } catch (error) {
    return { start, chain, error: error.cause?.code ?? error.code ?? error.name ?? 'HTTP_ERROR' };
  }
}
const [dns, http] = await Promise.all([
  Promise.all(requests.map(([hostname, type]) => query(hostname, type))),
  Promise.all([`http://${domain}`, `https://${domain}`, `http://www.${domain}`, `https://www.${domain}`].map(inspectHttp)),
]);
const isCanonical = (result) => !result.error && result.chain.at(-1)?.url === `https://${domain}/` && result.chain.at(-1)?.status === 200;
const report = {
  checkedAt: new Date().toISOString(), domain, resolver: process.env.DNS_RESOLVER ?? 'system', dns, http,
  dkim: selector ? `Queried the supplied selector: ${selector}` : 'Not checked: no provider-issued DKIM_SELECTOR supplied.',
  canonicalApexChecksPass: http.every(isCanonical),
  note: 'Successful transport checks alone do not prove this is an EducationOS deployment. Check the release version, app content, API and provider configuration separately.',
};
const json = `${JSON.stringify(report, null, 2)}\n`;
if (output) await writeFile(output, json, { mode: 0o600 });
process.stdout.write(json);
if (args.includes('--assert-canonical') && !report.canonicalApexChecksPass) process.exitCode = 1;
