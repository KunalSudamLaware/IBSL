export class RateLimiter {
  private cache = new Map<string, { count: number; expiresAt: number }>();

  public check(identifier: string, limit: number, windowMs: number): boolean {
    const now = Date.now();
    const record = this.cache.get(identifier);

    // Garbage collection for expired records (prevents memory leaks)
    if (this.cache.size > 1000) {
      for (const [key, val] of this.cache.entries()) {
        if (val.expiresAt < now) {
          this.cache.delete(key);
        }
      }
    }

    if (!record || record.expiresAt < now) {
      this.cache.set(identifier, { count: 1, expiresAt: now + windowMs });
      return true;
    }

    if (record.count >= limit) {
      return false; // Rate limit explicitly exceeded
    }

    record.count++;
    return true;
  }
}

// Global singleton instance
export const downloadRateLimiter = new RateLimiter();
