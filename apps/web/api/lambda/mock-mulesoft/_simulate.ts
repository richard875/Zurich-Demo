import { getEnv } from '../_lib/env';
import { errorResponse } from '../_lib/responses';

// Makes the mock behave like a remote system: some latency, and failures on demand for demos.
export async function simulateUpstream(): Promise<Response | null> {
  const env = getEnv();
  await new Promise((resolve) => setTimeout(resolve, env.MOCK_MULESOFT_LATENCY_MS));
  if (Math.random() < env.MOCK_MULESOFT_FAIL_RATE) {
    return errorResponse(503, 'Mock MuleSoft is unavailable (simulated failure)');
  }
  return null;
}
