import { afterEach, expect, test, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { POST } from '../src/app/api/adult-studio/[...path]/route';

afterEach(() => { vi.unstubAllEnvs(); vi.unstubAllGlobals(); });

function loginRequest(origin: string) {
  return new NextRequest('http://internal-web:3000/api/adult-studio/adults/login', {
    method: 'POST', headers: { Origin: origin, 'Content-Type': 'application/json', 'X-Forwarded-Host': 'untrusted.example' },
    body: JSON.stringify({ email: 'adult@example.test', password: 'synthetic-test-input' }),
  });
}
const context = () => ({ params: Promise.resolve({ path: ['adults', 'login'] }) });

test('explicit public studio origin supports an internal reverse proxy address', async () => {
  vi.stubEnv('EDUCATIONOS_STUDIO_ORIGIN', 'https://staging.example.test');
  const upstream = vi.fn().mockResolvedValue(Response.json({ adult: { role: 'educator' } }));
  vi.stubGlobal('fetch', upstream);
  const response = await POST(loginRequest('https://staging.example.test'), context());
  expect(response.status).toBe(200);
  expect(upstream).toHaveBeenCalledOnce();
  expect((upstream.mock.calls[0][1].headers as Headers).get('Origin')).toBe('https://staging.example.test');
});

test('a forwarded host cannot authorize an unconfigured public origin', async () => {
  vi.stubEnv('EDUCATIONOS_STUDIO_ORIGIN', '');
  const upstream = vi.fn();
  vi.stubGlobal('fetch', upstream);
  const response = await POST(loginRequest('https://untrusted.example'), context());
  expect(response.status).toBe(403);
  expect(upstream).not.toHaveBeenCalled();
});

test('invalid pinned studio origin fails closed before contacting Python', async () => {
  vi.stubEnv('EDUCATIONOS_STUDIO_ORIGIN', 'https://staging.example.test/wrong-path');
  const upstream = vi.fn();
  vi.stubGlobal('fetch', upstream);
  expect((await POST(loginRequest('https://staging.example.test'), context())).status).toBe(503);
  expect(upstream).not.toHaveBeenCalled();
});

test('a mismatched public origin cannot use an otherwise valid pinned deployment', async () => {
  vi.stubEnv('EDUCATIONOS_STUDIO_ORIGIN', 'https://staging.example.test');
  const upstream = vi.fn();
  vi.stubGlobal('fetch', upstream);
  expect((await POST(loginRequest('https://other.example.test'), context())).status).toBe(403);
  expect(upstream).not.toHaveBeenCalled();
});

test('configured non-local studio origin requires HTTPS', async () => {
  vi.stubEnv('EDUCATIONOS_STUDIO_ORIGIN', 'http://staging.example.test');
  const upstream = vi.fn();
  vi.stubGlobal('fetch', upstream);
  expect((await POST(loginRequest('http://staging.example.test'), context())).status).toBe(503);
  expect(upstream).not.toHaveBeenCalled();
});

test('HTTP loopback origin is allowed only outside production', async () => {
  vi.stubEnv('DEPLOYMENT_ENV', 'production');
  vi.stubEnv('EDUCATIONOS_STUDIO_ORIGIN', 'http://127.0.0.1:3000');
  vi.stubEnv('NODE_ENV', 'test');
  const upstream = vi.fn().mockResolvedValue(Response.json({ adult: { role: 'educator' } }));
  vi.stubGlobal('fetch', upstream);
  expect((await POST(loginRequest('http://127.0.0.1:3000'), context())).status).toBe(200);
  vi.stubEnv('NODE_ENV', 'production');
  expect((await POST(loginRequest('http://127.0.0.1:3000'), context())).status).toBe(503);
  expect(upstream).toHaveBeenCalledOnce();
});

test('a production build permits an explicitly marked loopback Compose workspace', async () => {
  vi.stubEnv('NODE_ENV', 'production');
  vi.stubEnv('DEPLOYMENT_ENV', 'development');
  vi.stubEnv('EDUCATIONOS_STUDIO_ORIGIN', 'http://127.0.0.1:3000');
  const upstream = vi.fn().mockResolvedValue(Response.json({ adult: { role: 'educator' } }));
  vi.stubGlobal('fetch', upstream);
  expect((await POST(loginRequest('http://127.0.0.1:3000'), context())).status).toBe(200);
  vi.stubEnv('EDUCATIONOS_STUDIO_ORIGIN', 'http://remote.example.test');
  expect((await POST(loginRequest('http://remote.example.test'), context())).status).toBe(503);
  expect(upstream).toHaveBeenCalledOnce();
});
