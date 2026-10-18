import { afterEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { headers } from 'next/headers';
import { isPortalHost, isPortalPath, PORTAL_HOST_HEADER, resolvePortalRoute } from '../src/lib/portal-routing';
import { proxy } from '../src/proxy';
import robots from '../src/app/robots';
import nextConfig from '../next.config';

vi.mock('next/headers', () => ({ headers: vi.fn() }));

afterEach(() => vi.unstubAllEnvs());

describe('portal and public host separation', () => {
  it('matches only the exact app host, including an optional local port', () => {
    expect(isPortalHost('app.educationos.space', 'auto')).toBe(true);
    expect(isPortalHost('APP.educationos.space:3000', 'auto')).toBe(true);
    for (const host of ['educationos.space', 'www.educationos.space', 'localhost:3000', 'app.educationos.space.example.com', 'app.educationos.space@elsewhere.test', 'app.educationos.space.']) {
      expect(isPortalHost(host, 'auto')).toBe(false);
    }
  });

  it('supports explicitly isolated portal deployments on preview domains', () => {
    expect(resolvePortalRoute('educationos-preview.example', '/', 'portal')).toMatchObject({ action: 'rewrite', destination: '/portal', portalHost: true, noindex: true });
    expect(resolvePortalRoute('educationos-preview.example', '/', 'auto')).toMatchObject({ action: 'next', portalHost: false });
  });

  it('keeps an explicitly public deployment public regardless of the incoming host', () => {
    for (const host of ['educationos.space', 'marketing-preview.example', 'app.educationos.space']) {
      expect(isPortalHost(host, 'public')).toBe(false);
      expect(resolvePortalRoute(host, '/', 'public')).toEqual({ action: 'next', portalHost: false, noindex: false });
    }
  });

  it.each([
    ['/portal', '/'],
    ['/portal/', '/'],
    ['/portal/labs/loop-loom', '/labs/loop-loom'],
    ['/portal//elsewhere.example', '/elsewhere.example'],
  ])('sends public deployment path %s to the dedicated portal', (pathname, cleanPath) => {
    expect(resolvePortalRoute('educationos.space', pathname, 'public')).toEqual({
      action: 'redirect', destination: `https://app.educationos.space${cleanPath}`, portalHost: false, noindex: true,
    });
  });

  it('leaves unknown public paths with the public handler rather than rewriting them into the portal', () => {
    for (const pathname of ['/missing-page', '/labs/loop-loom', '/portals']) {
      expect(resolvePortalRoute('educationos.space', pathname, 'public')).toEqual({ action: 'next', portalHost: false, noindex: false });
    }
  });

  it.each(['/', '/subjects', '/subjects/programming', '/learn/first-program', '/projects', '/progress', '/guardian', '/missing-page', '/sitemap.xml'])('keeps %s inside the app surface', (pathname) => {
    expect(resolvePortalRoute('app.educationos.space', pathname, 'auto')).toEqual({
      action: 'rewrite', destination: pathname === '/' ? '/portal' : `/portal${pathname}`, portalHost: true, noindex: true,
    });
  });

  it('keeps the public root and existing demo routes unchanged', () => {
    for (const pathname of ['/', '/programs', '/demo', '/demo/lab']) {
      expect(resolvePortalRoute('educationos.space', pathname, 'auto')).toMatchObject({ action: 'next', portalHost: false, noindex: false });
    }
  });

  it('supports local portal preview without treating similar paths as portal', () => {
    expect(resolvePortalRoute('localhost:3000', '/portal/learn/first-program', 'auto')).toEqual({ action: 'next', portalHost: false, noindex: true });
    expect(isPortalPath('/portal')).toBe(true);
    expect(isPortalPath('/portals')).toBe(false);
  });

  it.each(['/privacy', '/safety', '/accessibility', '/terms', '/approach', '/programs', '/trust'])('sends the public %s page to the marketing origin', (pathname) => {
    expect(resolvePortalRoute('app.educationos.space', pathname, 'auto')).toMatchObject({ action: 'redirect', destination: `https://educationos.space${pathname}`, noindex: true });
  });

  it('canonicalizes internal portal URLs on the app host', () => {
    expect(resolvePortalRoute('app.educationos.space', '/portal', 'auto')).toMatchObject({ action: 'redirect', destination: '/' });
    expect(resolvePortalRoute('app.educationos.space', '/portal/learn/first-program', 'auto')).toMatchObject({ action: 'redirect', destination: '/learn/first-program' });
    expect(resolvePortalRoute('app.educationos.space', '/portal//elsewhere.example', 'auto')).toMatchObject({ action: 'redirect', destination: '/elsewhere.example' });
  });

  it.each(['/robots.txt', '/api/v1/missions', '/_next/static/chunk.js'])('preserves the shared handler for %s', (pathname) => {
    expect(resolvePortalRoute('app.educationos.space', pathname, 'auto')).toMatchObject({ action: 'next', portalHost: true, noindex: true });
  });
});

describe('host-specific crawler policy', () => {
  it('disallows the app host without advertising the public sitemap in production', async () => {
    vi.stubEnv('DEPLOYMENT_ENV', 'production');
    vi.mocked(headers).mockResolvedValue(new Headers({ [PORTAL_HOST_HEADER]: 'true' }));
    expect(await robots()).toEqual({ rules: { userAgent: '*', disallow: '/' } });
  });

  it('keeps the public sitemap and excludes the local portal preview', async () => {
    vi.stubEnv('DEPLOYMENT_ENV', 'production');
    vi.mocked(headers).mockResolvedValue(new Headers({ [PORTAL_HOST_HEADER]: 'false' }));
    expect(await robots()).toEqual({
      rules: { userAgent: '*', allow: '/', disallow: ['/portal', '/demo', '/api/'] },
      sitemap: 'https://educationos.space/sitemap.xml',
    });
  });
});

describe('portal proxy response', () => {
  it('redirects public portal links to the absolute app origin with queries preserved', () => {
    vi.stubEnv('EDUCATIONOS_SURFACE', 'public');
    const response = proxy(new NextRequest('https://educationos.space/portal/labs/hidden-cubes?from=home', {
      headers: { host: 'educationos.space', [PORTAL_HOST_HEADER]: 'true', 'x-forwarded-host': 'app.educationos.space' },
    }));
    expect(response.status).toBe(308);
    expect(response.headers.get('location')).toBe('https://app.educationos.space/labs/hidden-cubes?from=home');
    expect(response.headers.get('x-middleware-rewrite')).toBeNull();
    expect(response.headers.get('x-robots-tag')).toBe('noindex, nofollow');
  });

  it('does not select the portal on a public deployment even with an app Host', () => {
    vi.stubEnv('EDUCATIONOS_SURFACE', 'public');
    const response = proxy(new NextRequest('https://app.educationos.space/', {
      headers: { host: 'app.educationos.space', [PORTAL_HOST_HEADER]: 'true' },
    }));
    expect(response.headers.get('x-middleware-rewrite')).toBeNull();
    expect(response.headers.get(`x-middleware-request-${PORTAL_HOST_HEADER}`)).toBe('false');
  });

  it('keeps loopback rewrites internal when the public Host differs from the server URL', () => {
    expect(nextConfig.skipProxyUrlNormalize).toBe(true);
    // This is the flag Next sets from skipProxyUrlNormalize. Without it NextURL
    // changes 127.0.0.1 to localhost, creating an external self-fetch that runs
    // the proxy again with the wrong host and discards the trusted marker.
    vi.stubEnv('__NEXT_NO_MIDDLEWARE_URL_NORMALIZE', '1');
    vi.stubEnv('EDUCATIONOS_SURFACE', 'auto');
    const response = proxy(new NextRequest('http://127.0.0.1:3100/?subject=programming', {
      headers: { host: 'app.educationos.space' },
    }));
    expect(response.headers.get('x-middleware-rewrite')).toBe('http://127.0.0.1:3100/portal?subject=programming');
    expect(response.headers.get(`x-middleware-request-${PORTAL_HOST_HEADER}`)).toBe('true');
  });

  it('uses the incoming app host for clean redirects instead of its internal server origin', () => {
    vi.stubEnv('__NEXT_NO_MIDDLEWARE_URL_NORMALIZE', '1');
    vi.stubEnv('EDUCATIONOS_SURFACE', 'auto');
    const response = proxy(new NextRequest('http://127.0.0.1:3100/portal/subjects?from=home', {
      headers: { host: 'app.educationos.space' },
    }));
    expect(response.headers.get('location')).toBe('http://app.educationos.space/subjects?from=home');
  });

  it('rewrites the app root with its query, trusted header and nonce policy', () => {
    vi.stubEnv('EDUCATIONOS_SURFACE', 'auto');
    vi.stubEnv('DEPLOYMENT_ENV', 'production');
    const response = proxy(new NextRequest('https://app.educationos.space/?subject=programming', {
      headers: { host: 'app.educationos.space', [PORTAL_HOST_HEADER]: 'false' },
    }));
    expect(response.headers.get('x-middleware-rewrite')).toBe('https://app.educationos.space/portal?subject=programming');
    expect(response.headers.get(`x-middleware-request-${PORTAL_HOST_HEADER}`)).toBe('true');
    expect(response.headers.get('x-robots-tag')).toBe('noindex, nofollow');
    const nonce = response.headers.get('x-middleware-request-x-nonce');
    expect(nonce).toBeTruthy();
    expect(response.headers.get('content-security-policy')).toContain(`'nonce-${nonce}'`);
  });

  it('overwrites spoofed portal and forwarded-host headers on public requests', () => {
    vi.stubEnv('EDUCATIONOS_SURFACE', 'auto');
    vi.stubEnv('DEPLOYMENT_ENV', 'production');
    const response = proxy(new NextRequest('https://educationos.space/', {
      headers: { host: 'educationos.space', [PORTAL_HOST_HEADER]: 'true', 'x-forwarded-host': 'app.educationos.space' },
    }));
    expect(response.headers.get('x-middleware-rewrite')).toBeNull();
    expect(response.headers.get(`x-middleware-request-${PORTAL_HOST_HEADER}`)).toBe('false');
    expect(response.headers.get('x-robots-tag')).toBeNull();
  });

  it('preserves queries when sending app policy links to the public origin', () => {
    const response = proxy(new NextRequest('https://app.educationos.space/privacy?from=guardian', { headers: { host: 'app.educationos.space' } }));
    expect(response.status).toBe(308);
    expect(response.headers.get('location')).toBe('https://educationos.space/privacy?from=guardian');
    expect(response.headers.get('x-robots-tag')).toBe('noindex, nofollow');
  });
});
