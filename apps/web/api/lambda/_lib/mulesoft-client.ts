// HTTP client for the MuleSoft APIs. The BFF treats them as an external system:
// it only reaches them over HTTP at MULESOFT_BASE_URL, never by import.
import type { Logger } from 'pino';
import type { z } from 'zod';
import { getEnv } from './env';

export type MulesoftFailure =
  'timeout' | 'unavailable' | 'rejected' | 'invalid-response' | 'network';

export type MulesoftResult<T> =
  { ok: true; data: T } | { ok: false; failure: MulesoftFailure; status?: number };

type Attempt<T> = MulesoftResult<T> & { retryable?: boolean };

export interface MulesoftOptions {
  correlationId: string;
  log: Logger;
  baseUrl?: string;
  fetchImpl?: typeof fetch;
  timeoutMs?: number;
  retryDelayMs?: number;
}

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function attempt<S extends z.ZodTypeAny>(
  url: string,
  body: unknown,
  responseSchema: S,
  fetchImpl: typeof fetch,
  correlationId: string,
  timeoutMs: number,
): Promise<Attempt<z.output<S>>> {
  let response: Response;
  try {
    response = await fetchImpl(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-correlation-id': correlationId },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(timeoutMs),
    });
  } catch (error) {
    const timedOut = error instanceof DOMException && error.name === 'TimeoutError';
    return timedOut
      ? { ok: false, failure: 'timeout', retryable: true }
      : { ok: false, failure: 'network' };
  }

  if (response.status >= 500) {
    return { ok: false, failure: 'unavailable', status: response.status, retryable: true };
  }
  if (!response.ok) return { ok: false, failure: 'rejected', status: response.status };

  const json: unknown = await response.json().catch(() => undefined);
  const parsed = responseSchema.safeParse(json);
  return parsed.success
    ? { ok: true, data: parsed.data }
    : { ok: false, failure: 'invalid-response', status: response.status };
}

// Times out after 3 seconds and retries once, 200 ms later, on a timeout or a 5xx.
export async function postToMulesoft<S extends z.ZodTypeAny>(
  path: string,
  body: unknown,
  responseSchema: S,
  options: MulesoftOptions,
): Promise<MulesoftResult<z.output<S>>> {
  const {
    correlationId,
    log,
    baseUrl = getEnv().MULESOFT_BASE_URL,
    fetchImpl = fetch,
    timeoutMs = 3000,
    retryDelayMs = 200,
  } = options;
  const url = `${baseUrl}${path}`;

  for (let attemptNumber = 1; ; attemptNumber += 1) {
    const started = performance.now();
    const { retryable, ...result } = await attempt(
      url,
      body,
      responseSchema,
      fetchImpl,
      correlationId,
      timeoutMs,
    );
    const durationMs = Math.round(performance.now() - started);

    if (result.ok) {
      log.info(
        { mulesoftPath: path, attempt: attemptNumber, durationMs },
        'mulesoft call succeeded',
      );
      return result;
    }
    log.warn(
      {
        mulesoftPath: path,
        attempt: attemptNumber,
        durationMs,
        failure: result.failure,
        status: result.status,
      },
      'mulesoft call failed',
    );
    if (!retryable || attemptNumber === 2) return result;
    await delay(retryDelayMs);
  }
}
