// The site's front gate. Until a visitor enters SITE_PASSWORD, the server answers every page with
// the gate page and every API call and static file with 401, so none of the app, its scripts
// included, reaches the browser. The pass is an HttpOnly cookie signed on the server, so nothing in
// the browser can forge or extend it.
import { createHmac, timingSafeEqual } from 'node:crypto';
import {
  getCookie,
  setCookie,
  type Context,
  type MiddlewareHandler,
} from '@modern-js/server-runtime';
import { getEnv } from '../api/lambda/_lib/env';
import { logger } from '../api/lambda/_lib/logger';
import { gatePage } from './gate-page';
import { perVisitor } from './request-limits';
import { fromOwnOrigin, visitorAddress, visitorTag } from './security';

export const GATE_COOKIE = 'zld_gate';
export const GATE_PATH = '/site-access';
export const GATE_TTL_SECONDS = 30 * 24 * 60 * 60;

// The pass's key mixes in the password, so changing SITE_PASSWORD (or SESSION_SECRET) turns away
// every pass handed out before.
const passKey = (password: string, secret: string) =>
  createHmac('sha256', secret).update(`zurich-demo:site-gate:${password}`).digest();

const passSignature = (expiresAt: string, password: string, secret: string) =>
  createHmac('sha256', passKey(password, secret)).update(expiresAt).digest('base64url');

export function signGatePass(password: string, secret: string, now: number = Date.now()) {
  const expiresAt = Math.floor(now / 1000) + GATE_TTL_SECONDS;
  return { value: `${expiresAt}.${passSignature(String(expiresAt), password, secret)}`, expiresAt };
}

// True only for an untampered, unexpired pass made with the current password and secret.
export function verifyGatePass(
  value: string | undefined,
  password: string,
  secret: string,
  now: number = Date.now(),
): boolean {
  const [expiresAt, signature, ...rest] = value?.split('.') ?? [];
  if (!expiresAt || !signature || rest.length > 0 || !/^\d{1,12}$/.test(expiresAt)) return false;
  const expected = Buffer.from(passSignature(expiresAt, password, secret));
  const actual = Buffer.from(signature);
  if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) return false;
  return Number(expiresAt) * 1000 > now;
}

// Both sides are hashed first, so the comparison takes the same time whatever was typed.
export function passwordMatches(given: string, password: string): boolean {
  const digest = (value: string) => createHmac('sha256', 'site-gate').update(value).digest();
  return timingSafeEqual(digest(given), digest(password));
}

// Where to go once in: a path on this site, never another site (//evil.example, /\evil.example).
export function safeNext(next: unknown): string {
  // Browsers read a backslash as a slash and drop tabs and newlines: either could leave the site.
  const unsafe = (path: string) => path.includes('\\') || [...path].some((char) => char < ' ');
  if (typeof next !== 'string' || !next.startsWith('/') || unsafe(next)) {
    return '/';
  }
  const base = 'http://gate.invalid';
  try {
    const url = new URL(next, base);
    if (url.origin !== base || url.pathname === GATE_PATH) return '/';
    return `${url.pathname}${url.search}`;
  } catch {
    return '/';
  }
}

// What stays open: the health check (Lambda Web Adapter's readiness check and the deploy's smoke
// test) and mock MuleSoft, which the BFF calls from inside the server with its own token.
const ungated = (path: string) => path === '/api/health' || path.startsWith('/api/mock-mulesoft/');

// Ten tries, then one more every ten seconds. The password is long and random; this keeps the logs
// and the function quiet if someone tries anyway.
const allowAttempt = perVisitor(10, 0.1);

function showGate(c: Context, status: 401 | 429, next: string, error?: string) {
  c.header('X-Robots-Tag', 'noindex, nofollow');
  return c.html(gatePage({ action: GATE_PATH, next, error }), status);
}

async function enter(c: Context) {
  if (c.req.method !== 'POST') return c.redirect('/', 303);
  if (!fromOwnOrigin(c)) return c.json({ message: 'This request was blocked.' }, 403);
  // A browser's form post always says how long it is; anything else, or anything big, is refused
  // before it's read.
  if (!(Number(c.req.header('content-length')) <= 2048)) {
    return c.json({ message: 'This request is too large.' }, 413);
  }

  const body = await c.req.parseBody();
  const next = safeNext(body.next);
  const visitor = visitorAddress(c);
  const { retryAfter } = allowAttempt(visitor);
  if (retryAfter) {
    c.header('Retry-After', String(retryAfter));
    return showGate(c, 429, next, 'Too many tries. Please wait a minute and try again.');
  }

  const { SITE_PASSWORD: password = '', SESSION_SECRET: secret, COOKIE_SECURE } = getEnv();
  if (typeof body.password !== 'string' || !passwordMatches(body.password, password)) {
    logger.warn({ visitor: visitorTag(visitor) }, 'site gate: wrong password');
    return showGate(c, 401, next, "That password isn't right. Please try again.");
  }
  const pass = signGatePass(password, secret);
  setCookie(c, GATE_COOKIE, pass.value, {
    httpOnly: true,
    secure: COOKIE_SECURE,
    sameSite: 'Lax',
    path: '/',
    maxAge: GATE_TTL_SECONDS,
    expires: new Date(pass.expiresAt * 1000),
  });
  logger.info({ visitor: visitorTag(visitor) }, 'site gate: entered');
  return c.redirect(next, 303);
}

// Runs before Modern.js's static files and pages (order 'pre'), so nothing is served around it.
export const siteGate: MiddlewareHandler = async (c, next) => {
  const { SITE_PASSWORD: password, SESSION_SECRET: secret } = getEnv();
  const { method, path } = c.req;
  if (!password || ungated(path)) return next();
  if (path === GATE_PATH) return enter(c);
  if (verifyGatePass(getCookie(c, GATE_COOKIE), password, secret)) return next();

  if (path.startsWith('/api/')) return c.json({ message: 'This site is private.' }, 401);
  if (path.startsWith('/static/') || !['GET', 'HEAD'].includes(method)) {
    return c.text('This site is private.', 401);
  }
  const url = new URL(c.req.url);
  return showGate(c, 401, safeNext(`${url.pathname}${url.search}`));
};
