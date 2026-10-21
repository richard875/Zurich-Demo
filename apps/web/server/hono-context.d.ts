import type { Logger } from 'pino';

// Values the server middleware puts on every request, read back with c.get().
declare module 'hono' {
  interface ContextVariableMap {
    correlationId: string;
    logger: Logger;
    // Set only when the request carries a valid session cookie.
    customerId: string | undefined;
  }
}
