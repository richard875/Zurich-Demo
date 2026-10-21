// The mock sign-in's session: a cookie holding customerId.expiry.signature, signed with
// HMAC-SHA256. A browser fingerprint isn't real authentication; this only protects fake data.
import { createHash, createHmac, timingSafeEqual } from 'node:crypto';

export const SESSION_COOKIE = 'zld_session';
export const SESSION_TTL_SECONDS = 8 * 60 * 60;

const customerIdPattern = /^cust_[0-9a-f]{16}$/;

export function customerIdFor(visitorId: string): string {
  return `cust_${createHash('sha256').update(visitorId).digest('hex').slice(0, 16)}`;
}

export const deviceLabelFor = (customerId: string) => customerId.slice(-4);

const signatureFor = (payload: string, secret: string) =>
  createHmac('sha256', secret).update(payload).digest('base64url');

export function signSession(customerId: string, secret: string, now: number = Date.now()) {
  const expiresAt = Math.floor(now / 1000) + SESSION_TTL_SECONDS;
  const payload = `${customerId}.${expiresAt}`;
  return { value: `${payload}.${signatureFor(payload, secret)}`, expiresAt };
}

// Returns the customer ID, or null for a missing, malformed, tampered or expired cookie.
export function verifySession(
  value: string | undefined,
  secret: string,
  now: number = Date.now(),
): string | null {
  const [customerId, expiresAt, signature, ...rest] = value?.split('.') ?? [];
  if (!customerId || !expiresAt || !signature || rest.length > 0) return null;
  if (!customerIdPattern.test(customerId) || !/^\d+$/.test(expiresAt)) return null;

  const expected = Buffer.from(signatureFor(`${customerId}.${expiresAt}`, secret));
  const actual = Buffer.from(signature);
  if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) return null;

  return Number(expiresAt) * 1000 > now ? customerId : null;
}
