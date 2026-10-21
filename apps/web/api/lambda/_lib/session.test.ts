import { describe, expect, it } from 'vitest';
import {
  customerIdFor,
  deviceLabelFor,
  SESSION_TTL_SECONDS,
  signSession,
  verifySession,
} from './session';

const secret = 'test-secret-value';
const now = Date.parse('2026-10-24T09:00:00Z');
const customerId = customerIdFor('3f9a0c1d2e3f4a5b6c7d8e9f0a1b2c3d');

describe('session cookie', () => {
  it('derives a stable customer ID and device label from the visitor ID', () => {
    expect(customerId).toMatch(/^cust_[0-9a-f]{16}$/);
    expect(customerIdFor('3f9a0c1d2e3f4a5b6c7d8e9f0a1b2c3d')).toBe(customerId);
    expect(deviceLabelFor(customerId)).toBe(customerId.slice(-4));
  });

  it('accepts a cookie it signed', () => {
    const { value } = signSession(customerId, secret, now);
    expect(verifySession(value, secret, now)).toBe(customerId);
  });

  it('rejects a tampered customer ID, expiry or signature', () => {
    const { value } = signSession(customerId, secret, now);
    const [id, expiry, signature] = value.split('.');
    const other = customerIdFor('someone-else');

    expect(verifySession(`${other}.${expiry}.${signature}`, secret, now)).toBeNull();
    expect(verifySession(`${id}.${Number(expiry) + 3600}.${signature}`, secret, now)).toBeNull();
    expect(verifySession(`${id}.${expiry}.${signature?.slice(1)}x`, secret, now)).toBeNull();
    expect(verifySession(value, 'a-different-secret', now)).toBeNull();
  });

  it('rejects an expired cookie', () => {
    const { value } = signSession(customerId, secret, now);
    const justAfter = now + SESSION_TTL_SECONDS * 1000 + 1;
    expect(verifySession(value, secret, justAfter)).toBeNull();
  });

  it('rejects missing and malformed cookies', () => {
    expect(verifySession(undefined, secret, now)).toBeNull();
    expect(verifySession('', secret, now)).toBeNull();
    expect(verifySession('not-a-session', secret, now)).toBeNull();
    expect(verifySession('a.b.c.d', secret, now)).toBeNull();
  });
});
