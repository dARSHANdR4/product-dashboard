// lib/cache.ts — typed application wrapper around the dependency-free cache core.
import { InMemoryCache, buildCacheKey } from './cache-core.mjs';

export { buildCacheKey };

export const productCache = new InMemoryCache() as {
  get<T>(key: string): T | null;
  set<T>(key: string, data: T): void;
  delete(key: string): void;
  clear(): void;
  has(key: string): boolean;
  readonly size: number;
};
