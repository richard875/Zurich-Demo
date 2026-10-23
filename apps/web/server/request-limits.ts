// Process-wide limits suit the single ECS task. Fixed-size state needs no Redis, timers or IP map.
// A restart resets these limits; they reduce abuse, but aren't an AWS billing cap.
export function tokenBucket(capacity: number, refillPerSecond: number, now = Date.now) {
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
