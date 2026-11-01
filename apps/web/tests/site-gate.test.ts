import { Hono } from 'hono';
import { afterEach, beforeEach, describe, expect, it, onTestFinished, vi } from 'vitest';
import { getEnv } from '../api/lambda/_lib/env';
import {
  GATE_COOKIE,
  GATE_PATH,
  GATE_TTL_SECONDS,
  passwordMatches,
  safeNext,
  signGatePass,
  siteGate,
  verifyGatePass,
} from '../server/site-gate';

const password = 'test-site-password';
const secret = 'test-secret-value';
const now = Date.parse('2026-11-02T09:00:00Z');

describe('gate pass', () => {
  it('accepts a pass it signed, until it expires', () => {
    const { value } = signGatePass(password, secret, now);
    expect(verifyGatePass(value, password, secret, now)).toBe(true);
    expect(verifyGatePass(value, password, secret, now + GATE_TTL_SECONDS * 1000 + 1)).toBe(false);
  });

  it('rejects a tampered expiry or signature, and any pass after the password changes', () => {
    const { value } = signGatePass(password, secret, now);
    const [expiry, signature] = value.split('.');
    expect(verifyGatePass(`${Number(expiry) + 3600}.${signature}`, password, secret, now)).toBe(
      false,
    );
    expect(verifyGatePass(`${expiry}.${signature?.slice(1)}x`, password, secret, now)).toBe(false);
    expect(verifyGatePass(value, 'a-new-site-password', secret, now)).toBe(false);
    expect(verifyGatePass(value, password, 'a-different-secret', now)).toBe(false);
    for (const junk of [undefined, '', 'yes', '1.2.3', `${expiry}.`, `abc.${signature}`]) {
      expect(verifyGatePass(junk, password, secret, now)).toBe(false);
    }
  });

  it('matches only the exact password', () => {
    expect(passwordMatches(password, password)).toBe(true);
    for (const guess of ['', 'test-site-passwor', `${password} `, password.toUpperCase()]) {
      expect(passwordMatches(guess, password)).toBe(false);
    }
  });

  it('sends visitors on only to paths on this site', () => {
    expect(safeNext('/quote?step=2')).toBe('/quote?step=2');
    expect(safeNext('/policies#top')).toBe('/policies');
    for (const next of [
      undefined,
      '',
      'quote',
      'https://evil.example/',
      '//evil.example/',
      '/\\evil.example',
      '/\tevil',
      GATE_PATH,
    ]) {
      expect(safeNext(next)).toBe('/');
    }
  });
});

describe('site gate', () => {
  const app = new Hono();
  app.use(siteGate);
  app.get('/', (c) => c.html('<h1>Zurich Direct</h1>'));
  app.get('/quote', (c) => c.html('<h1>About you</h1>'));
  app.get('/static/js/index.12345678.js', (c) => c.text('app code'));
  app.get('/api/session', (c) => c.json({ signedIn: false }));
  app.post('/api/quotes', (c) => c.json({ ok: true }));
  app.get('/api/health', (c) => c.json({ ok: true }));
  app.post('/api/mock-mulesoft/rating', (c) => c.json({ ok: true }));

  const origin = 'http://localhost:8080';
  const enter = (fields: Record<string, string>, headers: Record<string, string> = { origin }) => {
    const body = new URLSearchParams(fields).toString();
    return app.request(GATE_PATH, {
      method: 'POST',
      headers: {
        'content-type': 'application/x-www-form-urlencoded',
        'content-length': String(body.length),
        // A different visitor each time, so the attempt limit doesn't carry between tests.
        'cloudfront-viewer-address': `198.51.100.${Math.floor(Math.random() * 250)}:5000`,
        ...headers,
      },
      body,
    });
  };
  const withPass = (value = signGatePass(password, getEnv().SESSION_SECRET).value) => ({
    headers: { cookie: `${GATE_COOKIE}=${value}` },
  });

  // Turn the gate on in the cached settings, the way the Lambda's environment would.
  beforeEach(() => {
    const env = getEnv();
    env.SITE_PASSWORD = password;
    onTestFinished(() => {
      env.SITE_PASSWORD = undefined;
    });
  });

  it('is off without a password, as in local development', async () => {
    getEnv().SITE_PASSWORD = undefined;
    expect((await app.request('/')).status).toBe(200);
  });

  it('shows the gate page, without the Zurich logo or favicon, for every page', async () => {
    for (const path of ['/', '/quote', '/anything']) {
      const response = await app.request(path);
      expect(response.status).toBe(401);
      expect(response.headers.get('x-robots-tag')).toBe('noindex, nofollow');
      const html = await response.text();
      expect(html).toContain('<title>Private demo</title>');
      expect(html).toContain('type="password"');
      expect(html).toContain(`action="${GATE_PATH}"`);
      expect(html).not.toMatch(/zurich-favicon|z-logo|<script/i);
      expect(html).toContain('href="data:image/svg+xml,');
    }
    expect(await (await app.request('/quote?step=2')).text()).toContain(
      'name="next" value="/quote?step=2"',
    );
  });

  it('refuses APIs and static files, including the app code', async () => {
    expect((await app.request('/api/session')).status).toBe(401);
    expect((await app.request('/api/quotes', { method: 'POST' })).status).toBe(401);
    const asset = await app.request('/static/js/index.12345678.js');
    expect(asset.status).toBe(401);
    expect(await asset.text()).not.toContain('app code');
  });

  it('keeps the health check and internal mock MuleSoft calls open', async () => {
    expect((await app.request('/api/health')).status).toBe(200);
    expect((await app.request('/api/mock-mulesoft/rating', { method: 'POST' })).status).toBe(200);
  });

  it('turns away forged, tampered and stale passes', async () => {
    for (const value of ['1', 'true', `9999999999.${'a'.repeat(43)}`]) {
      expect((await app.request('/', withPass(value))).status).toBe(401);
    }
    const stale = signGatePass('an-old-site-password', getEnv().SESSION_SECRET).value;
    expect((await app.request('/', withPass(stale))).status).toBe(401);
  });

  it('with a valid pass, serves pages, APIs and static files', async () => {
    expect((await app.request('/', withPass())).status).toBe(200);
    expect((await app.request('/api/session', withPass())).status).toBe(200);
    expect((await app.request('/static/js/index.12345678.js', withPass())).status).toBe(200);
  });

  it('with the right password, sets an HttpOnly pass and goes back to the page asked for', async () => {
    const response = await enter({ password, next: '/quote?step=2' });
    expect(response.status).toBe(303);
    expect(response.headers.get('location')).toBe('/quote?step=2');
    const cookie = response.headers.get('set-cookie') ?? '';
    expect(cookie).toMatch(new RegExp(`^${GATE_COOKIE}=\\d+\\.[\\w-]+;`));
    expect(cookie).toContain('HttpOnly');
    expect(cookie).toContain('SameSite=Lax');
    expect(cookie).toContain(`Max-Age=${GATE_TTL_SECONDS}`);
    const value = cookie.slice(GATE_COOKIE.length + 1, cookie.indexOf(';'));
    expect((await app.request('/quote', withPass(value))).status).toBe(200);
  });

  it('never sends a visitor to another site', async () => {
    const response = await enter({ password, next: '//evil.example/' });
    expect(response.headers.get('location')).toBe('/');
  });

  it('with the wrong password, shows the gate again with an error and no pass', async () => {
    const response = await enter({ password: 'not-the-password', next: '/quote' });
    expect(response.status).toBe(401);
    expect(response.headers.has('set-cookie')).toBe(false);
    const html = await response.text();
    expect(html).toContain('That password isn&#39;t right.');
    expect(html).toContain('aria-invalid="true"');
    expect(html).toContain('name="next" value="/quote"');
  });

  it('refuses posts from other sites, oversized posts and anything but a post', async () => {
    expect((await enter({ password }, { origin: 'https://evil.example' })).status).toBe(403);
    expect((await enter({ password }, { origin: '' })).status).toBe(403);
    expect((await enter({ password: 'x'.repeat(3000) })).status).toBe(413);
    const get = await app.request(GATE_PATH);
    expect(get.status).toBe(303);
    expect(get.headers.get('location')).toBe('/');
  });

  describe('attempt limit', () => {
    beforeEach(() => vi.useFakeTimers({ toFake: ['Date'] }));
    afterEach(() => vi.useRealTimers());

    it('allows ten tries per visitor, then asks them to wait, even with the right password', async () => {
      const visitor = { origin, 'cloudfront-viewer-address': '203.0.113.9:5000' };
      for (let i = 0; i < 10; i += 1) {
        expect((await enter({ password: 'wrong-guess' }, visitor)).status).toBe(401);
      }
      const limited = await enter({ password }, visitor);
      expect(limited.status).toBe(429);
      expect(limited.headers.get('retry-after')).toBe('10');
      expect(limited.headers.has('set-cookie')).toBe(false);
      expect((await enter({ password })).status).toBe(303);
    });
  });
});
