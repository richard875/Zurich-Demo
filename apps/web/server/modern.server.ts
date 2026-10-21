import { randomUUID } from 'node:crypto';
import { defineServerConfig, type MiddlewareHandler } from '@modern-js/server-runtime';
import { getEnv } from '../api/lambda/_lib/env';
import { logger } from '../api/lambda/_lib/logger';

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

  if (c.req.path.startsWith('/api/') && c.req.path !== '/api/health') {
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

// Validates every env var at startup and stops the server with a clear message if one is wrong.
const env = getEnv();
logger.info({ eventsMode: env.EVENTS_MODE }, 'server config loaded');

export default defineServerConfig({
  middlewares: [
    { name: 'correlation', handler: correlation },
    { name: 'no-index', handler: noIndex },
  ],
});
