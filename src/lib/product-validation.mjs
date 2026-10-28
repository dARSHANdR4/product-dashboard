/** Pure validation helpers shared by API code and the Node test suite. */
export function validateProductInput(input = {}) {
  if (typeof input.title !== 'string' || !input.title.trim()) {
    return { ok: false, message: 'Product title is required' };
  }
  if (typeof input.category !== 'string' || !input.category.trim()) {
    return { ok: false, message: 'Product category is required' };
  }

  const price = Number(input.price);
  const stock = Number(input.stock ?? 0);
  if (!Number.isFinite(price) || price < 0) {
    return { ok: false, message: 'Price must be a non-negative number' };
  }
  if (!Number.isInteger(stock) || stock < 0) {
    return { ok: false, message: 'Stock must be a non-negative integer' };
  }

  return {
    ok: true,
    value: {
      title: input.title.trim(),
      category: input.category.trim(),
      price,
      stock,
    },
  };
}

/** Keep the detail-page thumbnail and carousel images in sync on edits. */
export function resolveProductImages(input = {}) {
  return {
    images: input.images ?? (input.thumbnail ? [input.thumbnail] : []),
    thumbnail: input.thumbnail ?? input.images?.[0] ?? '',
  };
}

export function parseProductId(raw) {
  const id = Number(raw);
  return Number.isSafeInteger(id) && id >= 1 ? id : null;
}

const allowedSortFields = new Set(['id', 'title', 'price', 'rating', 'stock', 'category', 'createdAt']);

/** Parse public product-list query parameters without trusting sort-field input. */
export function resolveProductQueryOptions(params) {
  const limit = Math.min(100, Math.max(1, Number.parseInt(params.get('limit') || '10', 10) || 10));
  const skip = Math.max(0, Number.parseInt(params.get('skip') || '0', 10) || 0);
  const sortBy = params.get('sortBy') || 'id';
  const order = params.get('order') === 'desc' ? 'desc' : 'asc';

  if (!allowedSortFields.has(sortBy)) {
    return { ok: false, message: 'Unsupported sort field' };
  }

  return { ok: true, value: { limit, skip, sortBy, order } };
}
