import pino from 'pino';
import { describe, expect, it, vi } from 'vitest';
import { z } from 'zod';
import { postToMulesoft } from './mulesoft-client';

const schema = z.object({ decision: z.enum(['ACCEPT', 'REFER']) });
const log = pino({ level: 'silent' });

function fakeFetch(...responses: (Response | 'hang')[]) {
  return vi.fn<typeof fetch>((_url, init) => {
    const next = responses.shift() ?? 'hang';
    if (next !== 'hang') return Promise.resolve(next);
    // Never answers, like a stuck upstream, until the client's timeout aborts it.
    return new Promise((_resolve, reject) => {
      init?.signal?.addEventListener('abort', () => reject(init.signal?.reason));
    });
  });
}

const call = (fetchImpl: typeof fetch, extra: { timeoutMs?: number; retryDelayMs?: number } = {}) =>
  postToMulesoft('/underwriting', { answers: [] }, schema, {
    correlationId: 'corr-12345678',
    log,
    baseUrl: 'http://mulesoft.test',
    fetchImpl,
    ...extra,
  });

describe('postToMulesoft', () => {
  it('posts JSON with the correlation ID and returns the validated body', async () => {
    const fetchImpl = fakeFetch(Response.json({ decision: 'ACCEPT' }));
    await expect(call(fetchImpl)).resolves.toEqual({ ok: true, data: { decision: 'ACCEPT' } });

    const [url, init] = fetchImpl.mock.calls[0] ?? [];
    expect(url).toBe('http://mulesoft.test/underwriting');
    expect(init?.headers).toMatchObject({ 'x-correlation-id': 'corr-12345678' });
    expect(init?.body).toBe(JSON.stringify({ answers: [] }));
  });

  it('retries once, 200 ms after a 5xx', async () => {
    vi.useFakeTimers();
    try {
      const fetchImpl = fakeFetch(
        new Response(null, { status: 503 }),
        Response.json({ decision: 'REFER' }),
      );
      const result = call(fetchImpl);

      await vi.advanceTimersByTimeAsync(199);
      expect(fetchImpl).toHaveBeenCalledTimes(1);
      await vi.advanceTimersByTimeAsync(1);
      await expect(result).resolves.toEqual({ ok: true, data: { decision: 'REFER' } });
      expect(fetchImpl).toHaveBeenCalledTimes(2);
    } finally {
      vi.useRealTimers();
    }
  });

  it('gives up after a second 5xx', async () => {
    const fetchImpl = fakeFetch(
      new Response(null, { status: 503 }),
      new Response(null, { status: 500 }),
    );
    await expect(call(fetchImpl, { retryDelayMs: 0 })).resolves.toEqual({
      ok: false,
      failure: 'unavailable',
      status: 500,
    });
    expect(fetchImpl).toHaveBeenCalledTimes(2);
  });

  it('times out, retries, then reports the timeout', async () => {
    const fetchImpl = fakeFetch('hang', 'hang');
    await expect(call(fetchImpl, { timeoutMs: 20, retryDelayMs: 0 })).resolves.toEqual({
      ok: false,
      failure: 'timeout',
    });
    expect(fetchImpl).toHaveBeenCalledTimes(2);
  });

  it('recovers when only the first attempt times out', async () => {
    const fetchImpl = fakeFetch('hang', Response.json({ decision: 'ACCEPT' }));
    await expect(call(fetchImpl, { timeoutMs: 20, retryDelayMs: 0 })).resolves.toEqual({
      ok: true,
      data: { decision: 'ACCEPT' },
    });
  });

  it('does not retry a 4xx or a response that fails validation', async () => {
    const rejected = fakeFetch(Response.json({ message: 'bad' }, { status: 400 }));
    await expect(call(rejected)).resolves.toMatchObject({ ok: false, failure: 'rejected' });
    expect(rejected).toHaveBeenCalledTimes(1);

    const invalid = fakeFetch(Response.json({ decision: 'MAYBE' }));
    await expect(call(invalid)).resolves.toMatchObject({ ok: false, failure: 'invalid-response' });
    expect(invalid).toHaveBeenCalledTimes(1);
  });
});
