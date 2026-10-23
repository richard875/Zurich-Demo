import pino from 'pino';

// Callers must not log first names or health answers; the redact list is a safety net.
export const logger = pino({
  // Read directly so importing the logger never triggers env validation (see getEnv).
  level: process.env.LOG_LEVEL || 'info',
  base: { service: 'web' },
  timestamp: pino.stdTimeFunctions.isoTime,
  redact: {
    paths: [
      'cookie',
      'authorization',
      'headers.cookie',
      'headers.authorization',
      'headers["x-mulesoft-token"]',
      'firstName',
      '*.firstName',
      'answers',
      '*.answers',
    ],
    censor: '[redacted]',
  },
});
