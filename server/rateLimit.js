export class RateLimiter {
  constructor(maxRequests, windowSeconds) {
    this.maxRequests = maxRequests;
    this.windowMs = windowSeconds * 1000;
    this.requests = new Map();
  }

  allow(key) {
    const now = Date.now();
    const cutoff = now - this.windowMs;
    const queue = this.requests.get(key) ?? [];
    const updated = queue.filter((timestamp) => timestamp >= cutoff);

    if (updated.length >= this.maxRequests) {
      this.requests.set(key, updated);
      const retryAfterMs = updated[0] + this.windowMs - now;
      return { allowed: false, retryAfter: Math.max(Math.ceil(retryAfterMs / 1000), 1) };
    }

    updated.push(now);
    this.requests.set(key, updated);
    return { allowed: true, retryAfter: 0 };
  }
}
