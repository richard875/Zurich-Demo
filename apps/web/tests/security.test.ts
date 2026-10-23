import { Hono } from 'hono';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { getEnv } from '../api/lambda/_lib/env';
import { mulesoftToken, validMulesoftToken } from '../api/lambda/_lib/mulesoft-auth';
import { tokenBucket } from '../server/request-limits';
import {
  apiRateLimit,
  internalMulesoft,
  requestSize,
  responseSecurity,
  sameOrigin,
} from '../server/security';

describe('response security', () => {
  const app = new Hono();
  app.use(responseSecurity);
  app.get('/', (c) => c.html('<h1>Demo</h1>'));
  app.get('/api/session', (c) => c.json({ signedIn: true }));
  app.get('/static/js/main.12345678.js', (c) => {
    c.header('Content-Type', 'text/javascript');
    return c.body('const demo = true;'.repeat(200));
  });
  app.get('/static/private.12345678.js', (c) => {
    c.header('Set-Cookie', 'example=value');
    return c.text('private');
  });

  it('does not cache HTML or session data and blocks framing', async () => {
    for (const path of ['/', '/api/session']) {
      const response = await app.request(path);
      expect(response.headers.get('cache-control')).toBe('no-store');
      expect(response.headers.get('x-frame-options')).toBe('DENY');
      expect(response.headers.get('x-content-type-options')).toBe('nosniff');
    }
    const page = await app.request('/');
    expect(page.headers.get('content-security-policy')).toContain("frame-ancestors 'none'");
    expect(page.headers.has('strict-transport-security')).toBe(false);
  });

  it('compresses fingerprinted public assets and caches only successful responses', async () => {
    const response = await app.request('/static/js/main.12345678.js', {
      headers: { 'accept-encoding': 'gzip' },
    });
    expect(response.headers.get('cache-control')).toBe('public, max-age=31536000, immutable');
    expect(response.headers.get('content-encoding')).toBe('gzip');
    expect(response.headers.get('vary')).toContain('Accept-Encoding');
    const stream = response.body?.pipeThrough(new DecompressionStream('gzip'));
    expect(await new Response(stream).text()).toBe('const demo = true;'.repeat(200));
    for (const path of ['/static/missing.12345678.js', '/static/private.12345678.js']) {
      expect((await app.request(path)).headers.get('cache-control')).toBe('no-store');
    }
  });
});

describe('API boundaries', () => {
  const app = new Hono();
  app.use(internalMulesoft);
  app.use(requestSize);
  app.post('/api/mock-mulesoft/rating', (c) => c.json({ ok: true }));
  app.post('/api/quotes', async (c) => c.json(await c.req.json()));

  it('authenticates mock calls without accepting session signatures or a different secret', async () => {
    const token = mulesoftToken('local-dev-only');
    expect(validMulesoftToken(token, 'local-dev-only')).toBe(true);
    expect(validMulesoftToken(token, 'another-secret')).toBe(false);
    expect(validMulesoftToken('short', 'local-dev-only')).toBe(false);
    for (const value of ['', 'a'.repeat(64), `cust_123.${token}`]) {
      const response = await app.request('/api/mock-mulesoft/rating', {
        method: 'POST',
        headers: { 'x-mulesoft-token': value },
      });
      expect(response.status).toBe(404);
    }
    expect(
      (
        await app.request('/api/mock-mulesoft/rating', {
          method: 'POST',
          headers: { 'x-mulesoft-token': token },
        })
      ).status,
    ).toBe(200);
  });

  it('rejects oversized bodies both with Content-Length and when streamed', async () => {
    const body = JSON.stringify({ data: 'x'.repeat(17 * 1024) });
    const sized = await app.request('/api/quotes', {
      method: 'POST',
      body,
      headers: { 'content-length': String(body.length) },
    });
    expect(sized.status).toBe(413);
    const streamed = new ReadableStream<Uint8Array>({
      start(controller) {
        controller.enqueue(new TextEncoder().encode(body));
        controller.close();
      },
    });
    const response = await app.request(
      new Request('http://localhost/api/quotes', {
        method: 'POST',
        body: streamed,
        duplex: 'half',
      } as RequestInit),
    );
    expect(response.status).toBe(413);
  });

  it('accepts the small form payload and rejects request compression', async () => {
    expect(
      (await app.request('/api/quotes', { method: 'POST', body: '{"demo":true}' })).status,
    ).toBe(200);
    expect(
      (
        await app.request('/api/quotes', {
          method: 'POST',
          body: 'compressed',
          headers: { 'content-encoding': 'gzip' },
        })
      ).status,
    ).toBe(415);
  });
});

describe('same-origin check', () => {
  const app = new Hono();
  app.use(sameOrigin);
  app.post('/api/session', (c) => c.json({ ok: true }));
  const post = async (headers: Record<string, string>) =>
    (await app.request('/api/session', { method: 'POST', headers })).status;

  afterEach(() => vi.unstubAllEnvs());

  it("locally, accepts APP_ORIGIN and the dev server's own address on any port", async () => {
    expect(await post({ origin: 'http://localhost:8080', host: 'localhost:8080' })).toBe(200);
    expect(await post({ origin: 'http://127.0.0.1:8081', host: '127.0.0.1:8081' })).toBe(200);
    expect(await post({ origin: 'https://untrusted.example', host: '127.0.0.1:8081' })).toBe(403);
    expect(await post({ host: '127.0.0.1:8081' })).toBe(403);
  });

  it('in production, trusts only APP_ORIGIN whatever the Host header says', async () => {
    // Cache the local values first: production mode would need every variable set.
    getEnv();
    vi.stubEnv('NODE_ENV', 'production');
    expect(await post({ origin: 'http://127.0.0.1:8081', host: '127.0.0.1:8081' })).toBe(403);
    expect(await post({ origin: 'http://localhost:8080', host: 'untrusted.example' })).toBe(200);
  });
});

describe('cost protection', () => {
  it('returns Retry-After when API traffic is excessive, while keeping health checks available', async () => {
    const app = new Hono();
    app.use(apiRateLimit);
    app.get('/api/policies', (c) => c.json({ policies: [] }));
    app.get('/api/health', (c) => c.json({ ok: true }));
    let rejected = false;
    for (let i = 0; i < 185; i += 1) {
      const response = await app.request('/api/policies');
      if (response.status === 429) {
        rejected = true;
        expect(Number(response.headers.get('retry-after'))).toBeGreaterThan(0);
      }
    }
    expect(rejected).toBe(true);
    expect((await app.request('/api/health')).status).toBe(200);
  });

  it('bounds bursts and refills gradually even while rejected requests continue', () => {
    let now = 1000;
    const allow = tokenBucket(2, 1, () => now);
    expect(allow()).toBe(0);
    expect(allow()).toBe(0);
    expect(allow()).toBe(1);
    now += 500;
    expect(allow()).toBe(1);
    now += 500;
    expect(allow()).toBe(0);
    expect(allow()).toBe(1);
    now += 100_000;
    expect(allow()).toBe(0);
    expect(allow()).toBe(0);
    expect(allow()).toBe(1);
  });
});
