import { defineServerConfig, getCookie, type MiddlewareHandler } from '@modern-js/server-runtime';
import { getEnv } from '../api/lambda/_lib/env';
import { logger } from '../api/lambda/_lib/logger';
import { SESSION_COOKIE, verifySession } from '../api/lambda/_lib/session';
import { requestLog } from './request-log';
import {
  apiNotFound,
  apiRateLimit,
  internalMulesoft,
  requestSize,
  responseSecurity,
  sameOrigin,
} from './security';

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
    { name: 'request-log', handler: requestLog(logger) },
    { name: 'no-index', handler: noIndex },
    { name: 'api-not-found', handler: apiNotFound },
    { name: 'internal-mulesoft', handler: internalMulesoft },
    { name: 'same-origin', handler: sameOrigin },
    { name: 'api-rate-limit', handler: apiRateLimit },
    { name: 'request-size', handler: requestSize },
    { name: 'session', handler: session },
  ],
});
