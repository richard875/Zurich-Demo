// Limits are kept in process, which suits the single ECS task: no Redis or timers. A restart resets
// them; they stop one visitor crowding out the rest, but aren't an AWS billing cap.
export function tokenBucket(capacity: number, refillPerSecond: number, now = () => Date.now()) {
  let tokens = capacity;
  let updatedAt = now();
  return () => {
    const time = now();
    tokens = Math.min(capacity, tokens + (Math.max(0, time - updatedAt) / 1000) * refillPerSecond);
    updatedAt = time;
    if (tokens < 1) return Math.ceil((1 - tokens) / refillPerSecond);
    tokens -= 1;
    return 0;
  };
}

export interface VisitorLimit {
  // Seconds to wait, or 0 when the request may go ahead.
  retryAfter: number;
  // Refusals to log now: a visitor's first, then the count since the last log, at most once a
  // minute. 0 means nothing to log.
  refusalsToLog: number;
}

const REPORT_EVERY_MS = 60_000;

// A token bucket for each visitor, keyed by address. Only the most recently seen maxVisitors are
// kept, so memory stays bounded; a visitor dropped from the end starts again with a full bucket.
export function perVisitor(
  capacity: number,
  refillPerSecond: number,
  { maxVisitors = 10_000, now = () => Date.now() } = {},
) {
  const visitors = new Map<string, { take: () => number; refusals: number; reportedAt: number }>();
  return (visitor: string): VisitorLimit => {
    const entry = visitors.get(visitor) ?? {
      take: tokenBucket(capacity, refillPerSecond, now),
      refusals: 0,
      reportedAt: -Infinity,
    };
    // Re-inserting keeps the map in order from least to most recently seen.
    visitors.delete(visitor);
    visitors.set(visitor, entry);
    if (visitors.size > maxVisitors) {
      const oldest = visitors.keys().next();
      if (!oldest.done) visitors.delete(oldest.value);
    }

    const retryAfter = entry.take();
    if (!retryAfter) return { retryAfter, refusalsToLog: 0 };
    entry.refusals += 1;
    if (now() - entry.reportedAt < REPORT_EVERY_MS) return { retryAfter, refusalsToLog: 0 };
    const refusalsToLog = entry.refusals;
    entry.refusals = 0;
    entry.reportedAt = now();
    return { retryAfter, refusalsToLog };
  };
}
