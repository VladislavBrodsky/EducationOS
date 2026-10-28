import type { NextConfig } from 'next';
const config: NextConfig = {
  output: 'standalone',
  poweredByHeader: false,
  reactStrictMode: true,
  // The development badge otherwise covers the mobile Today navigation target.
  devIndicators: false,
  // Keep same-server rewrites on the original origin. Next otherwise turns
  // 127.0.0.1 into localhost and treats the rewrite as an external request,
  // which reruns the proxy and loses its trusted portal/nonce headers.
  skipProxyUrlNormalize: true,
  async rewrites() {
    // Internal upstream is never exposed to browser JavaScript. All product API
    // and permission decisions belong to FastAPI; Next only forwards requests.
    const upstream = new URL(process.env.PYTHON_API_URL ?? 'http://127.0.0.1:8000');
    if (!['http:', 'https:'].includes(upstream.protocol) || upstream.username || upstream.password || upstream.search || upstream.hash || upstream.pathname !== '/') {
      throw new Error('PYTHON_API_URL must be an HTTP(S) origin without credentials, path, or query.');
    }
    return [{ source: '/api/v1/:path*', destination: `${upstream.origin}/api/v1/:path*` }];
  },
  async redirects() {
    return [{ source: '/:path*', has: [{ type: 'host', value: 'www.educationos.space' }], destination: 'https://educationos.space/:path*', permanent: true }];
  },
  async headers() {
    return [{ source: '/:path*', headers: [
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      { key: 'X-Frame-Options', value: 'DENY' },
      { key: 'Referrer-Policy', value: 'no-referrer' },
      { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
      { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
      ...(process.env.NODE_ENV === 'production' ? [{ key: 'Strict-Transport-Security', value: 'max-age=31536000' }] : [])
    ] }];
  }
};
export default config;
