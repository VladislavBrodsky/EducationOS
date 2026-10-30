import { PORTAL_URL, SITE_URL } from './site';

export const PORTAL_HOST_HEADER = 'x-educationos-portal-host';

const publicPaths = new Set(['/privacy', '/safety', '/accessibility', '/terms', '/approach', '/programs', '/trust']);
const portalHostname = new URL(PORTAL_URL).hostname;

/** An explicit portal deployment also supports provider-issued preview domains. */
export function isPortalHost(host: string, surface = process.env.EDUCATIONOS_SURFACE): boolean {
  if (surface === 'public') return false;
  if (surface === 'portal') return true;
  // Match the host itself, never a suffix or a forwarded-host header. A port is
  // allowed so the production hostname can be checked against a local server.
  if (!/^[a-z0-9.-]+(?::\d{1,5})?$/i.test(host)) return false;
  return host.toLowerCase().split(':')[0] === portalHostname;
}

export function isPortalPath(pathname: string): boolean {
  return pathname === '/portal' || pathname.startsWith('/portal/');
}

type PortalRoute = {
  portalHost: boolean;
  noindex: boolean;
} & ({ action: 'next' } | { action: 'rewrite' | 'redirect'; destination: string });

/** Pure routing policy; proxy.ts preserves the incoming query on every move. */
export function resolvePortalRoute(host: string, pathname: string, surface = process.env.EDUCATIONOS_SURFACE): PortalRoute {
  const portalHost = isPortalHost(host, surface);
  const studioPath = pathname === '/studio' || pathname.startsWith('/studio/');
  const context = { portalHost, noindex: portalHost || isPortalPath(pathname) || studioPath };
  if (studioPath || pathname === '/components') return { ...context, noindex: true, action: 'next' };
  if (surface === 'public' && isPortalPath(pathname)) {
    const cleanPath = pathname.slice('/portal'.length).replace(/^\/+/, '/') || '/';
    return { ...context, action: 'redirect', destination: `${PORTAL_URL}${cleanPath}` };
  }
  if (!portalHost) return { ...context, action: 'next' };

  // Shared assets, the dynamic robots route, and FastAPI forwarding keep their
  // existing Next handlers. The app host never serves the public sitemap.
  if (pathname === '/robots.txt' || pathname === '/favicon.ico' || pathname === '/icon.svg'
    || pathname === '/images' || pathname.startsWith('/images/')
    || pathname === '/api' || pathname.startsWith('/api/')
    || pathname === '/_next' || pathname.startsWith('/_next/')) {
    return { ...context, action: 'next' };
  }
  const normalizedPath = pathname.replace(/\/$/, '') || '/';
  if (publicPaths.has(normalizedPath) || normalizedPath === '/blog' || normalizedPath.startsWith('/blog/')) {
    return { ...context, action: 'redirect', destination: `${SITE_URL}${pathname}` };
  }
  if (isPortalPath(pathname)) {
    return { ...context, action: 'redirect', destination: pathname.slice('/portal'.length).replace(/^\/+/, '/') || '/' };
  }
  // Unknown app URLs also stay in the portal, where its own not-found page can
  // explain the missing learning activity instead of showing marketing content.
  return { ...context, action: 'rewrite', destination: pathname === '/' ? '/portal' : `/portal${pathname}` };
}
