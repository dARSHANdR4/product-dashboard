import test from 'node:test';
import assert from 'node:assert/strict';
import {
  parseProductId,
  resolveProductImages,
  validateProductInput,
} from '../src/lib/product-validation.mjs';

test('product validation trims required text and normalizes numeric fields', () => {
  assert.deepEqual(
    validateProductInput({ title: '  Headphones  ', category: '  audio ', price: '49.99', stock: '4' }),
    { ok: true, value: { title: 'Headphones', category: 'audio', price: 49.99, stock: 4 } },
  );
});

test('product validation rejects missing title and category', () => {
  assert.deepEqual(validateProductInput({ title: '   ', category: 'audio', price: 10 }), {
    ok: false,
    message: 'Product title is required',
  });
  assert.deepEqual(validateProductInput({ title: 'Headphones', category: ' ', price: 10 }), {
    ok: false,
    message: 'Product category is required',
  });
});

test('product validation rejects negative or non-finite prices', () => {
  for (const price of [-1, 'not-a-price', Infinity, NaN]) {
    assert.equal(validateProductInput({ title: 'Item', category: 'audio', price }).ok, false);
  }
});

test('product validation rejects negative and fractional stock', () => {
  for (const stock of [-1, 1.5, 'not-stock']) {
    assert.deepEqual(
      validateProductInput({ title: 'Item', category: 'audio', price: 1, stock }),
      { ok: false, message: 'Stock must be a non-negative integer' },
    );
  }
});

test('image URL edits synchronize the thumbnail and carousel list', () => {
  const imageUrl = 'https://images.example.test/headphones.png';
  assert.deepEqual(resolveProductImages({ thumbnail: imageUrl }), {
    thumbnail: imageUrl,
    images: [imageUrl],
  });
  assert.deepEqual(resolveProductImages({ images: [imageUrl] }), {
    thumbnail: imageUrl,
    images: [imageUrl],
  });
});

test('explicit image lists are preserved and empty values remain valid', () => {
  const images = ['https://images.example.test/one.png', 'https://images.example.test/two.png'];
  assert.deepEqual(resolveProductImages({ thumbnail: images[0], images }), {
    thumbnail: images[0],
    images,
  });
  assert.deepEqual(resolveProductImages({}), { thumbnail: '', images: [] });
});

test('product IDs accept positive safe integers only', () => {
  assert.equal(parseProductId('42'), 42);
  for (const raw of ['0', '-1', '1.5', 'abc', '9007199254740992']) {
    assert.equal(parseProductId(raw), null, `expected ${raw} to be rejected`);
  }
});
