/**
 * In-memory token bucket rate limiter for serverless endpoints
 */

const rateLimitMap = new Map();

/**
 * Checks if a key (e.g. IP or UID) has exceeded its request quota
 * @param {string} key - Unique identifier (IP or UID)
 * @param {number} limit - Maximum allowed requests in window
 * @param {number} windowMs - Time window in milliseconds (default: 60 seconds)
 * @returns {{ allowed: boolean, remaining: number, resetMs: number }}
 */
export function checkRateLimit(key, limit = 10, windowMs = 60000) {
  const now = Date.now();
  const record = rateLimitMap.get(key) || { count: 0, resetTime: now + windowMs };

  // If window expired, reset counter
  if (now > record.resetTime) {
    record.count = 0;
    record.resetTime = now + windowMs;
  }

  record.count += 1;
  rateLimitMap.set(key, record);

  // Clean up older keys periodically
  if (rateLimitMap.size > 5000) {
    for (const [k, v] of rateLimitMap.entries()) {
      if (now > v.resetTime) {
        rateLimitMap.delete(k);
      }
    }
  }

  const remaining = Math.max(0, limit - record.count);
  return {
    allowed: record.count <= limit,
    remaining,
    resetMs: Math.max(0, record.resetTime - now),
  };
}
