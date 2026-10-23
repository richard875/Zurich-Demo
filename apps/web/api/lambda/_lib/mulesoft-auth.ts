import { createHmac, timingSafeEqual } from 'node:crypto';

export const MULESOFT_AUTH_HEADER = 'x-mulesoft-token';

// Domain separation keeps this internal credential distinct from signed session cookies.
// Reuse the existing secret, so this needs no extra AWS secret or service.
export const mulesoftToken = (secret: string): string =>
  createHmac('sha256', secret).update('zurich-demo:mock-mulesoft:v1').digest('hex');

export function validMulesoftToken(value: string | undefined, secret: string): boolean {
  if (!value || !/^[a-f0-9]{64}$/.test(value)) return false;
  return timingSafeEqual(Buffer.from(value), Buffer.from(mulesoftToken(secret)));
}
