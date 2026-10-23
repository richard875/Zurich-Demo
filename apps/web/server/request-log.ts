import { randomUUID } from 'node:crypto';
import { formatWithOptions } from 'node:util';
import type { MiddlewareHandler, MonitorEvent } from '@modern-js/server-runtime';
import type { Logger } from 'pino';

const safeCorrelationId = /^[\w-]{8,64}$/;

// One line per page or API response: info, warn for 4xx, error for 5xx, with the customer once
// they're signed in. Left out: static files and health checks, the session and policy polls when
// they succeed, mock MuleSoft calls (the BFF logs each with its timing and outcome) and
// rate-limited requests (apiRateLimit logs those once a minute per visitor).
export function isLogged(method: string, path: string, status: number): boolean {
  if (path.startsWith('/static/') || path === '/api/health' || status === 429) return false;
  if (path.startsWith('/api/mock-mulesoft/')) return false;
  const poll = method === 'GET' && ['/api/session', '/api/policies'].includes(path);
  return !poll || status >= 400;
}

// Modern.js's error reports attach the request headers. These ones are dropped: they carry the
// session, the mock MuleSoft token or the visitor's address.
const hiddenHeaders = new Set(['authorization', 'cookie', 'x-forwarded-for', 'x-mulesoft-token']);
const withoutHiddenHeaders = (arg: unknown) =>
  arg && typeof arg === 'object' && !(arg instanceof Error)
    ? Object.fromEntries(Object.entries(arg).filter(([key]) => !hiddenHeaders.has(key)))
    : arg;

// Modern.js reports SSR errors, server errors and fallbacks to client rendering through
// per-request monitors. Its own logger is off (modern.config.ts), since it also prints two debug
// lines for every request, so its warnings and errors come here, as one JSON line each.
export const modernMonitor = (log: Logger) => (event: MonitorEvent) => {
  if (event.type !== 'log') return;
  const { level, message, args = [] } = event.payload;
  if (level !== 'warn' && level !== 'error') return;
  const text = formatWithOptions(
    { breakLength: Infinity },
    message,
    ...args.map(withoutHiddenHeaders),
  );
  log[level]({ source: 'modern.js' }, text);
};

// Reuses a caller's x-correlation-id (e.g. the BFF calling mock MuleSoft) or starts a new one, and
// gives the request a logger that stamps it on every line.
export function requestLog(base: Logger): MiddlewareHandler {
  return async (c, next) => {
    const incoming = c.req.header('x-correlation-id');
    const correlationId = incoming && safeCorrelationId.test(incoming) ? incoming : randomUUID();
    const log = base.child({ correlationId });
    c.set('correlationId', correlationId);
    c.set('logger', log);
    c.get('monitors')?.push(modernMonitor(log));

    const started = performance.now();
    await next();
    c.header('x-correlation-id', correlationId);

    const { method, path } = c.req;
    const { status } = c.res;
    if (!isLogged(method, path, status)) return;
    const level = status >= 500 ? 'error' : status >= 400 ? 'warn' : 'info';
    log[level](
      {
        method,
        path,
        status,
        durationMs: Math.round(performance.now() - started),
        customerId: c.get('customerId'),
      },
      'request',
    );
  };
}
