import test from 'node:test';
import assert from 'node:assert/strict';
import { InMemoryCache, buildCacheKey } from '../src/lib/cache-core.mjs';

const query = (overrides = {}) => ({
  page: 1,
  limit: 10,
  search: '',
  category: '',
  sortBy: '',
  sortOrder: 'asc',
  ...overrides,
});

test('cache returns stored values and misses unknown keys', () => {
  const cache = new InMemoryCache();
  cache.set('products', { total: 2 }, 1000);
  assert.deepEqual(cache.get('products', 1001), { total: 2 });
  assert.equal(cache.get('missing', 1001), null);
});

test('cache expires entries after the TTL', () => {
  const cache = new InMemoryCache();
  cache.set('products', ['item'], 1000);
  assert.deepEqual(cache.get('products', 61_000), ['item']);
  assert.equal(cache.get('products', 61_001), null);
  assert.equal(cache.size, 0);
});

test('setting an existing key at capacity does not evict another entry', () => {
  const cache = new InMemoryCache();
  for (let i = 0; i < 100; i++) cache.set(`key-${i}`, i, 1000);
  cache.set('key-50', 'updated', 2000);
  assert.equal(cache.size, 100);
  assert.equal(cache.get('key-0', 2000), 0);
  assert.equal(cache.get('key-50', 2000), 'updated');
  cache.set('new-key', 'new', 2000);
  assert.equal(cache.size, 100);
  assert.equal(cache.get('key-0', 2000), null);
  assert.equal(cache.get('new-key', 2000), 'new');
});

test('delete and clear invalidate cached values', () => {
  const cache = new InMemoryCache();
  cache.set('a', 1, 1000);
  cache.set('b', 2, 1000);
  cache.delete('a');
  assert.equal(cache.get('a', 1000), null);
  cache.clear();
  assert.equal(cache.size, 0);
  assert.equal(cache.get('b', 1000), null);
});

test('cache keys vary with every query dimension and safely encode separators', () => {
  const baseline = buildCacheKey(query());
  for (const [key, value] of Object.entries(query({ page: 2, limit: 20, search: 'a-b', category: 'c', sortBy: 'price', sortOrder: 'desc' }))) {
    assert.notEqual(buildCacheKey(query({ [key]: value })), baseline, `expected ${key} to affect the key`);
  }
  assert.notEqual(buildCacheKey(query({ search: 'a-b', category: 'c' })), buildCacheKey(query({ search: 'a', category: 'b-c' })));
});
