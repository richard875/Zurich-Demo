import type { Monitors } from '@modern-js/server-runtime';
import { Hono } from 'hono';
import pino from 'pino';
import { describe, expect, it } from 'vitest';
import { isLogged, modernMonitor, requestLog } from '../server/request-log';

function captureLogs() {
  const lines: Record<string, unknown>[] = [];
  const log = pino({ level: 'info' }, { write: (line: string) => lines.push(JSON.parse(line)) });
  return { log, lines };
}

describe('request log', () => {
  it('logs pages and API calls, leaving out assets, health checks, good polls and mock calls', () => {
    expect(isLogged('GET', '/', 200)).toBe(true);
    expect(isLogged('GET', '/quote', 200)).toBe(true);
    expect(isLogged('POST', '/api/quotes', 200)).toBe(true);
    expect(isLogged('GET', '/api/policies', 500)).toBe(true);
    expect(isLogged('GET', '/static/js/index.12345678.js', 200)).toBe(false);
    expect(isLogged('GET', '/api/health', 200)).toBe(false);
    expect(isLogged('GET', '/api/session', 200)).toBe(false);
    expect(isLogged('GET', '/api/policies', 200)).toBe(false);
    expect(isLogged('POST', '/api/mock-mulesoft/rating', 503)).toBe(false);
    expect(isLogged('POST', '/api/quotes', 429)).toBe(false);
  });

  it('writes one line per response at a level that matches its status, with the customer', async () => {
    const { log, lines } = captureLogs();
    const app = new Hono();
    app.use(requestLog(log));
    app.use(async (c, next) => {
      c.set('customerId', 'cust_0123456789abcdef');
      await next();
    });
    app.get('/', (c) => c.html('<h1>Demo</h1>'));
    app.post('/api/quotes', (c) => c.json({ message: 'Broken' }, 500));
    app.get('/static/js/index.12345678.js', (c) => c.text('asset'));

    const page = await app.request('/');
    expect(page.headers.get('x-correlation-id')).toMatch(/^[\w-]{8,64}$/);
    await app.request('/api/quotes', { method: 'POST' });
    await app.request('/nope');
    await app.request('/static/js/index.12345678.js');

    expect(
      lines.map(({ level, method, path, status }) => ({ level, method, path, status })),
    ).toEqual([
      { level: 30, method: 'GET', path: '/', status: 200 },
      { level: 50, method: 'POST', path: '/api/quotes', status: 500 },
      { level: 40, method: 'GET', path: '/nope', status: 404 },
    ]);
    expect(lines[0]).toMatchObject({
      msg: 'request',
      customerId: 'cust_0123456789abcdef',
      correlationId: page.headers.get('x-correlation-id'),
      durationMs: expect.any(Number),
    });
  });

  it("listens to Modern.js's monitors for the request", async () => {
    const pushed: unknown[] = [];
    const app = new Hono();
    app.use(async (c, next) => {
      c.set('monitors', {
        push: (monitor: unknown) => void pushed.push(monitor),
      } as Partial<Monitors> as Monitors);
      await next();
    });
    app.use(requestLog(captureLogs().log));
    app.get('/', (c) => c.text('ok'));
    await app.request('/');
    expect(pushed).toHaveLength(1);
  });

  it("turns Modern.js's warnings and errors into single lines, without private headers", () => {
    const { log, lines } = captureLogs();
    const monitor = modernMonitor(log);
    monitor({
      type: 'log',
      payload: {
        level: 'error',
        message: 'SSR Error - Error, error = %s, req.url = %s, req.headers = %o',
        args: [
          'Error: boom\n    at render (page.tsx:1:1)',
          '/quote',
          {
            cookie: 'zld_session=secret',
            'x-forwarded-for': '198.51.100.1',
            'x-mulesoft-token': 'a'.repeat(64),
            'user-agent': 'Demo/1.0',
          },
        ],
      },
    });
    monitor({ type: 'log', payload: { level: 'info', message: 'chatter' } });
    monitor({ type: 'timing', payload: { name: 'server-handle-request', dur: 5 } });

    expect(lines).toHaveLength(1);
    expect(lines[0]).toMatchObject({ level: 50, source: 'modern.js' });
    const message = String(lines[0]?.msg);
    expect(message).toContain('SSR Error - Error, error = Error: boom');
    expect(message).toContain('req.url = /quote');
    expect(message).toContain("'user-agent': 'Demo/1.0'");
    for (const hidden of ['zld_session', '198.51.100.1', 'a'.repeat(64)]) {
      expect(message).not.toContain(hidden);
    }
  });
});
