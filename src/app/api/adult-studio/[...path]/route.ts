import { NextRequest } from 'next/server';

export const dynamic = 'force-dynamic';
const UUID = '[0-9a-fA-F-]{36}';
const routes: [RegExp, string[]][] = [
  [/^adults\/login$/, ['POST']],
  [/^adults\/session$/, ['GET']],
  [/^adults\/logout$/, ['POST']],
  [/^adults\/consents$/, ['GET', 'POST']],
  [new RegExp(`^adults/consents/${UUID}$`), ['DELETE']],
  [/^studio\/missions$/, ['GET', 'POST']],
  [new RegExp(`^studio/missions/${UUID}$`), ['GET', 'PATCH']],
  [new RegExp(`^studio/missions/${UUID}/history$`), ['GET']],
  [new RegExp(`^studio/missions/${UUID}/(submit|review)$`), ['POST']],
];

const failure = (status: number, message: string) => Response.json(
  { error: { message } }, { status, headers: { 'Cache-Control': 'no-store' } },
);

async function forward(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  const { path } = await context.params;
  const destination = path.join('/');
  if (!routes.some(([pattern, methods]) => pattern.test(destination) && methods.includes(request.method))) {
    return failure(404, 'This workspace endpoint is unavailable.');
  }
  // This endpoint is a narrow transport. Python authenticates and authorizes every operation.
  if (request.nextUrl.search) return failure(400, 'Query parameters are not supported.');
  const origin = request.headers.get('origin');
  if (request.method !== 'GET') {
    // Managed ingress may expose an HTTPS site while Next sees an internal HTTP
    // origin. Pin the public origin explicitly; never trust forwarded host input.
    let workspaceOrigin = new URL(request.url).origin;
    if (process.env.EDUCATIONOS_STUDIO_ORIGIN) {
      try {
        const configured = new URL(process.env.EDUCATIONOS_STUDIO_ORIGIN);
        if (!['http:', 'https:'].includes(configured.protocol) || configured.username || configured.password || configured.pathname !== '/' || configured.search || configured.hash) {
          return failure(503, 'Adult workspace origin is unavailable.');
        }
        // A production build also runs in loopback-only Compose development.
        const localDevelopment = (process.env.NODE_ENV !== 'production' || process.env.DEPLOYMENT_ENV === 'development')
          && ['localhost', '127.0.0.1', '[::1]'].includes(configured.hostname);
        if (configured.protocol !== 'https:' && !localDevelopment) return failure(503, 'Adult workspace origin requires HTTPS.');
        workspaceOrigin = configured.origin;
      } catch { return failure(503, 'Adult workspace origin is unavailable.'); }
    }
    if (!origin || workspaceOrigin !== origin) return failure(403, 'Use the workspace on its own origin.');
    if (request.headers.get('content-type')?.split(';')[0] !== 'application/json' && request.method !== 'DELETE') {
      return failure(415, 'Use application/json.');
    }
  }
  let body: Uint8Array | undefined;
  if (request.method !== 'GET') {
    const reader = request.body?.getReader();
    const chunks: Uint8Array[] = [];
    let length = 0;
    if (reader) {
      for (;;) {
        const chunk = await reader.read();
        if (chunk.done) break;
        length += chunk.value.length;
        if (length > 16_384) {
          await reader.cancel();
          return failure(413, 'This request is too large.');
        }
        chunks.push(chunk.value);
      }
    }
    body = new Uint8Array(length);
    let offset = 0;
    for (const chunk of chunks) { body.set(chunk, offset); offset += chunk.length; }
  }
  try {
    const upstream = new URL(process.env.EDUCATIONOS_API_INTERNAL_URL ?? process.env.PYTHON_API_URL ?? 'http://127.0.0.1:8000');
    if (!['http:', 'https:'].includes(upstream.protocol) || upstream.username || upstream.password || upstream.pathname !== '/' || upstream.search || upstream.hash) {
      return failure(503, 'Adult workspace connection is unavailable.');
    }
    const headers = new Headers({ 'Content-Type': 'application/json' });
    const cookie = request.cookies.get('eos_adult')?.value;
    if (cookie && /^[A-Za-z0-9_-]{43}$/.test(cookie)) headers.set('Cookie', `eos_adult=${cookie}`);
    const csrf = request.headers.get('x-csrf-token');
    if (csrf && /^[A-Za-z0-9_-]{1,128}$/.test(csrf)) headers.set('X-CSRF-Token', csrf);
    if (origin) headers.set('Origin', origin);
    const response = await fetch(new URL(`/api/v1/${destination}`, upstream), {
      method: request.method, headers, body: body ? Buffer.from(body) : undefined,
      cache: 'no-store', redirect: 'error', signal: AbortSignal.timeout(10_000),
    });
    const safeHeaders = new Headers({ 'Content-Type': 'application/json', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' });
    for (const value of response.headers.getSetCookie()) {
      if (value.startsWith('eos_adult=')) safeHeaders.append('Set-Cookie', value);
    }
    return new Response(response.body, { status: response.status, headers: safeHeaders });
  } catch {
    return failure(503, 'Adult workspace connection is unavailable.');
  }
}

export { forward as GET, forward as POST, forward as PATCH, forward as DELETE };
