import type { Logger } from 'pino';

// Values the correlation middleware puts on every request, read back with c.get().
declare module 'hono' {
  interface ContextVariableMap {
    correlationId: string;
    logger: Logger;
  }
}
