// lib/cache.ts — In-memory request cache with TTL
// Keyed by a deterministic string built from query state.
// Lives at module level so it survives client-side navigation but resets on full page reload.
// This is intentional: memory-only simplicity tradeoff (no IndexedDB/localStorage needed).

import type { CacheEntry } from '@/types';

const TTL_MS = 60_000; // 60 seconds
const MAX_ENTRIES = 100;

class InMemoryCache {
  private store = new Map<string, CacheEntry<unknown>>();

  /** Returns cached data if it exists and isn't stale, otherwise null */
  get<T>(key: string): T | null {
    const entry = this.store.get(key);
    if (!entry) return null;
    if (Date.now() - entry.timestamp > TTL_MS) {
      this.store.delete(key);
      return null;
    }
    return entry.data as T;
  }

  /** Stores data under the given key */
  set<T>(key: string, data: T): void {
    // Evict oldest entry if at capacity
    if (this.store.size >= MAX_ENTRIES) {
      const firstKey = this.store.keys().next().value;
      if (firstKey) this.store.delete(firstKey);
    }
    this.store.set(key, { data, timestamp: Date.now() });
  }

  /** Delete a specific key */
  delete(key: string): void {
    this.store.delete(key);
  }

  /** Clear the entire cache — called after any mutation (add/edit/delete) */
  clear(): void {
    this.store.clear();
  }

  /** Check if a key exists and is fresh */
  has(key: string): boolean {
    return this.get(key) !== null;
  }

  get size(): number {
    return this.store.size;
  }
}

// Singleton instance
export const productCache = new InMemoryCache();

/** Build a deterministic cache key from query parameters */
export function buildCacheKey(params: {
  page: number;
  limit: number;
  search: string;
  category: string;
  sortBy: string;
  sortOrder: string;
}): string {
  return `${params.page}-${params.limit}-${params.search}-${params.category}-${params.sortBy}-${params.sortOrder}`;
}
