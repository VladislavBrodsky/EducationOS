import { NextRequest, NextResponse } from 'next/server';
import { PORTAL_HOST_HEADER, resolvePortalRoute } from '@/lib/portal-routing';

export function proxy(request: NextRequest) {
  const nonce = Buffer.from(crypto.randomUUID()).toString('base64');
  const dev = process.env.NODE_ENV === 'development';
  const policy = [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${dev ? " 'unsafe-eval'" : ''}`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob:", "font-src 'self'", `connect-src 'self'${dev ? ' ws: wss:' : ''}`,
    "object-src 'none'", "base-uri 'self'", "form-action 'self'", "frame-ancestors 'none'",
  ].join('; ');
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-nonce', nonce);
  requestHeaders.set('Content-Security-Policy', policy);
  const incomingHost = request.headers.get('host') ?? request.nextUrl.host;
  const route = resolvePortalRoute(incomingHost, request.nextUrl.pathname);
  // Never trust a client-supplied value when the layout chooses its link base.
  requestHeaders.set(PORTAL_HOST_HEADER, String(route.portalHost));
  const pathname = request.nextUrl.pathname;
  const marketingLocale = route.portalHost ? 'en' : ['/', '/programs', '/approach', '/trust', '/blog'].includes(pathname) || pathname.startsWith('/blog/')
    ? 'es'
    : pathname === '/ru' || pathname.startsWith('/ru/') ? 'ru' : 'en';
  requestHeaders.set('x-educationos-locale', marketingLocale);
  const options = { request: { headers: requestHeaders } };
  let response: NextResponse;
  if (route.action === 'next') {
    response = NextResponse.next(options);
  } else {
    const destination = new URL(route.destination, request.url);
    destination.search = request.nextUrl.search;
    // Internal rewrites retain the server origin; browser redirects retain the
    // validated incoming host, which can differ behind a reverse proxy.
    if (route.action === 'redirect' && route.destination.startsWith('/') && /^[a-z0-9.-]+(?::\d{1,5})?$/i.test(incomingHost)) {
      destination.port = '';
      destination.host = incomingHost;
    }
    response = route.action === 'rewrite'
      ? NextResponse.rewrite(destination, options)
      : NextResponse.redirect(destination, 308);
  }
  response.headers.set('Content-Security-Policy', policy);
  if (route.noindex || process.env.DEPLOYMENT_ENV !== 'production' || request.nextUrl.pathname.startsWith('/demo')) response.headers.set('X-Robots-Tag', 'noindex, nofollow');
  return response;
}
export const config = { matcher: ['/((?!_next/static|_next/image|favicon.ico|icon.svg).*)'] };
