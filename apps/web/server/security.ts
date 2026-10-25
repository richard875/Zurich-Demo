import { createHmac } from 'node:crypto';
import type { IncomingMessage } from 'node:http';
import type { Context, MiddlewareHandler } from '@modern-js/server-runtime';
import { bodyLimit } from 'hono/body-limit';
import { compress } from 'hono/compress';
import { getEnv } from '../api/lambda/_lib/env';
import { MULESOFT_AUTH_HEADER, validMulesoftToken } from '../api/lambda/_lib/mulesoft-auth';
import { perVisitor } from './request-limits';

const isStatic = (path: string) => path.startsWith('/static/');
const fingerprintedAsset = /\.[a-f0-9]{8,}\.[a-z0-9]+$/i;
const compressStatic = compress({
  contentTypeFilter: /^(text\/|application\/(javascript|json)|image\/svg\+xml)/i,
});

// Compression is only for public assets, keeping personalised HTML and APIs out of it.
export const responseSecurity: MiddlewareHandler = async (c, next) => {
  // The bundler can still emit its own helper map even when application maps are disabled.
  if (
    process.env.NODE_ENV === 'production' &&
    isStatic(c.req.path) &&
    c.req.path.endsWith('.map')
  ) {
    c.res = c.json({ message: 'Not found.' }, 404);
  } else if (isStatic(c.req.path)) await compressStatic(c, next);
  else await next();

  const cacheable =
    isStatic(c.req.path) &&
    fingerprintedAsset.test(c.req.path) &&
    ['GET', 'HEAD'].includes(c.req.method) &&
    [200, 304].includes(c.res.status) &&
    !c.res.headers.has('set-cookie');
  c.header('Cache-Control', cacheable ? 'public, max-age=31536000, immutable' : 'no-store');
  c.header('X-Content-Type-Options', 'nosniff');
  c.header('X-Frame-Options', 'DENY');
  c.header('Referrer-Policy', 'strict-origin-when-cross-origin');
  c.header('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  if (getEnv().COOKIE_SECURE) c.header('Strict-Transport-Security', 'max-age=31536000');
  if (c.res.headers.get('content-type')?.includes('text/html')) {
    // React's streamed SSR bootstrap and Zurich's embedded styles need inline scripts/styles.
    c.header(
      'Content-Security-Policy',
      "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self' data:; connect-src 'self'; frame-src 'self'; object-src 'none'; base-uri 'none'; frame-ancestors 'none'; form-action 'self'",
    );
  }
  for (const name of ['X-Powered-By', 'X-Processed-By', 'X-Modernjs-Render', 'Server-Timing']) {
    c.res.headers.delete(name);
  }
};

export const internalMulesoft: MiddlewareHandler = async (c, next) => {
  if (
    c.req.path.startsWith('/api/mock-mulesoft/') &&
    !validMulesoftToken(c.req.header(MULESOFT_AUTH_HEADER), getEnv().SESSION_SECRET)
  ) {
    return c.json({ message: 'Not found.' }, 404);
  }
  await next();
};

// An address under /api that no function answers gets Modern.js's HTML 404 page; API callers get the
// same { message } JSON as every other API error instead.
export const apiNotFound: MiddlewareHandler = async (c, next) => {
  await next();
  if (
    c.req.path.startsWith('/api/') &&
    c.res.status === 404 &&
    c.res.headers.get('content-type')?.includes('text/html')
  ) {
    c.res = c.json({ message: 'Not found.' }, 404);
  }
};

const unsafeMethods = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

function originOf(origin: string): string | null {
  try {
    const url = new URL(origin);
    return url.origin === origin ? url.origin : null;
  } catch {
    return null;
  }
}

// A simple CSRF check: browsers always send Origin on these methods, so it must be our own.
// Production trusts only APP_ORIGIN. Locally the dev server's own address counts too, so
// 127.0.0.1 and a bumped port (when 8080 is taken) keep working.
// Mock MuleSoft is skipped because it stands in for an external system the BFF calls
// server-to-server, without a browser Origin.
export const sameOrigin: MiddlewareHandler = async (c, next) => {
  const { method, path } = c.req;
  if (
    unsafeMethods.has(method) &&
    path.startsWith('/api/') &&
    !path.startsWith('/api/mock-mulesoft/')
  ) {
    const origin = originOf(c.req.header('origin') ?? '');
    const host = c.req.header('host');
    const ownOrigin = process.env.NODE_ENV !== 'production' && host ? `http://${host}` : null;
    if (!origin || (origin !== getEnv().APP_ORIGIN && origin !== ownOrigin)) {
      return c.json({ message: 'This request was blocked.' }, 403);
    }
  }
  await next();
};

// All API payloads are small JSON forms. Enforce the bound before BFF validation, including
// chunked requests without Content-Length. Never decompress attacker-controlled request bodies.
const limitBody = bodyLimit({
  maxSize: 16 * 1024,
  onError: (c) => c.json({ message: 'This request is too large.' }, 413),
});
export const requestSize: MiddlewareHandler = async (c, next) => {
  if (!c.req.path.startsWith('/api/')) return next();
  const encoding = c.req.header('content-encoding');
  if (encoding && encoding !== 'identity') {
    return c.json({ message: 'Compressed requests are not supported.' }, 415);
  }
  // With neither header an HTTP/1.1 request has no body (RFC 9112 §6.3), so bodiless calls like
  // sign-out's DELETE skip the limit. Buffering their empty stream anyway crashes on Node 24,
  // which can't copy the proxied Request Modern.js hands us.
  if (!c.req.header('content-length') && !c.req.header('transfer-encoding')) return next();
  return limitBody(c, next);
};

// The load balancer appends the address each request came from to X-Forwarded-For, so the last
// entry is the visitor's own and can't be forged; earlier entries can. Local and CI runs have no
// load balancer and use the socket's address.
export function visitorAddress(c: Context): string {
  const forwarded = c.req.header('x-forwarded-for')?.split(',').at(-1)?.trim();
  if (forwarded) return forwarded;
  const env = c.env as { node?: { req?: IncomingMessage } } | undefined;
  return env?.node?.req?.socket.remoteAddress ?? 'unknown';
}

// Logs name a visitor by a keyed hash of their address: enough to tell visitors apart, without
// writing addresses down.
const visitorTag = (address: string) =>
  createHmac('sha256', getEnv().SESSION_SECRET)
    .update(`zurich-demo:visitor:${address}`)
    .digest('hex')
    .slice(0, 12);

// Each visitor has their own allowance, so one busy script can't use up everyone else's: 900 reads
// with 15 more a second, and 300 writes with 5 more a second.
const allowRead = perVisitor(900, 15);
const allowWrite = perVisitor(300, 5);
export const apiRateLimit: MiddlewareHandler = async (c, next) => {
  const { method, path } = c.req;
  // Internal calls have already authenticated; health checks must stay available under load.
  if (
    !path.startsWith('/api/') ||
    path === '/api/health' ||
    path.startsWith('/api/mock-mulesoft/')
  ) {
    return next();
  }
  const visitor = visitorAddress(c);
  const allow = ['GET', 'HEAD'].includes(method) ? allowRead : allowWrite;
  const { retryAfter, refusalsToLog } = allow(visitor);
  if (retryAfter) {
    if (refusalsToLog) {
      c.get('logger').warn(
        { visitor: visitorTag(visitor), method, path, refusals: refusalsToLog, retryAfter },
        'rate limited',
      );
    }
    c.header('Retry-After', String(retryAfter));
    return c.json({ message: 'Too many requests. Please try again in a moment.' }, 429);
  }
  await next();
};
