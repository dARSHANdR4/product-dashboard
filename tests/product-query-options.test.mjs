import test from 'node:test';
import assert from 'node:assert/strict';
import { resolveProductQueryOptions } from '../src/lib/product-validation.mjs';

test('query options use safe defaults', () => {
  assert.deepEqual(resolveProductQueryOptions(new URLSearchParams()), {
    ok: true,
    value: { limit: 10, skip: 0, sortBy: 'id', order: 'asc' },
  });
});

test('query options clamp pagination and allow supported sort fields', () => {
  assert.deepEqual(resolveProductQueryOptions(new URLSearchParams('limit=500&skip=-9&sortBy=price&order=desc')), {
    ok: true,
    value: { limit: 100, skip: 0, sortBy: 'price', order: 'desc' },
  });
});

test('query options reject unsupported sort fields', () => {
  assert.deepEqual(resolveProductQueryOptions(new URLSearchParams('sortBy=select')), {
    ok: false,
    message: 'Unsupported sort field',
  });
});
