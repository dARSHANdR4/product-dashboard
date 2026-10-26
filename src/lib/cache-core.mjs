/** @typedef {{ data: unknown, timestamp: number }} CacheEntry */

/** Small in-memory TTL cache shared by the dashboard. */
export class InMemoryCache {
  /** @type {Map<string, CacheEntry>} */
  store = new Map();

  /** @param {number} [now] */
  get(key, now = Date.now()) {
    const entry = this.store.get(key);
    if (!entry) return null;
    if (now - entry.timestamp > 60_000) {
      this.store.delete(key);
      return null;
    }
    return entry.data;
  }

  set(key, data, now = Date.now()) {
    // Replacing an existing key must not evict an unrelated entry.
    if (!this.store.has(key) && this.store.size >= 100) {
      const firstKey = this.store.keys().next().value;
      if (firstKey !== undefined) this.store.delete(firstKey);
    }
    this.store.set(key, { data, timestamp: now });
  }

  delete(key) {
    this.store.delete(key);
  }

  clear() {
    this.store.clear();
  }

  has(key, now = Date.now()) {
    return this.get(key, now) !== null;
  }

  get size() {
    return this.store.size;
  }
}

/** Deterministic, collision-resistant key for all product query parameters. */
export function buildCacheKey(params) {
  return JSON.stringify([
    params.page,
    params.limit,
    params.search,
    params.category,
    params.sortBy,
    params.sortOrder,
  ]);
}
