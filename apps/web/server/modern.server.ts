import { randomUUID } from 'node:crypto';
import { defineServerConfig, getCookie, type MiddlewareHandler } from '@modern-js/server-runtime';
import { getEnv } from '../api/lambda/_lib/env';
import { logger } from '../api/lambda/_lib/logger';
import { SESSION_COOKIE, verifySession } from '../api/lambda/_lib/session';
import {
  apiRateLimit,
  internalMulesoft,
  requestSize,
  responseSecurity,
  sameOrigin,
} from './security';

const safeCorrelationId = /^[\w-]{8,64}$/;

// Reuses a caller's x-correlation-id (e.g. the BFF calling mock MuleSoft) or starts a new one,
// and gives the request a logger that stamps it on every line.
const correlation: MiddlewareHandler = async (c, next) => {
  const incoming = c.req.header('x-correlation-id');
  const correlationId = incoming && safeCorrelationId.test(incoming) ? incoming : randomUUID();
  const log = logger.child({ correlationId });
  c.set('correlationId', correlationId);
  c.set('logger', log);

  const started = performance.now();
  await next();
  c.header('x-correlation-id', correlationId);

  const quietRead =
    c.req.method === 'GET' && ['/api/session', '/api/policies'].includes(c.req.path) && c.res.ok;
  if (
    c.req.path.startsWith('/api/') &&
    c.req.path !== '/api/health' &&
    !quietRead &&
    c.res.status !== 429
  ) {
    log.info(
      {
        method: c.req.method,
        path: c.req.path,
        status: c.res.status,
        durationMs: Math.round(performance.now() - started),
      },
      'request',
    );
  }
};

// Pairs with the robots meta tag so no page or API response gets indexed.
const noIndex: MiddlewareHandler = async (c, next) => {
  await next();
  c.header('X-Robots-Tag', 'noindex, nofollow');
};

const protectedPaths = ['/api/applications', '/api/policies'];

const session: MiddlewareHandler = async (c, next) => {
  const customerId = verifySession(getCookie(c, SESSION_COOKIE), getEnv().SESSION_SECRET);
  c.set('customerId', customerId ?? undefined);

  const isProtected = protectedPaths.some(
    (p) => c.req.path === p || c.req.path.startsWith(`${p}/`),
  );
  if (isProtected && !customerId) {
    return c.json({ message: 'Please sign in to continue.' }, 401);
  }
  await next();
};

// Validates every env var at startup and stops the server with a clear message if one is wrong.
const env = getEnv();
logger.info({ eventsMode: env.EVENTS_MODE }, 'server config loaded');

export default defineServerConfig({
  middlewares: [
    // Static serving can finish before ordinary middleware; this must wrap it too.
    { name: 'response-security', order: 'pre', handler: responseSecurity },
    { name: 'correlation', handler: correlation },
    { name: 'no-index', handler: noIndex },
    { name: 'internal-mulesoft', handler: internalMulesoft },
    { name: 'same-origin', handler: sameOrigin },
    { name: 'api-rate-limit', handler: apiRateLimit },
    { name: 'request-size', handler: requestSize },
    { name: 'session', handler: session },
  ],
});
