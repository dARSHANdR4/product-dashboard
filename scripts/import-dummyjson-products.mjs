#!/usr/bin/env node
/**
 * Import the current DummyJSON product catalogue into Supabase.
 *
 * Required environment variables:
 *   SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 *
 * Run locally from the repository root:
 *   node scripts/import-dummyjson-products.mjs
 *
 * Safe to rerun: existing rows with matching SKUs are left unchanged.
 * Never expose the service-role key in client code or commit it to Git.
 */

const supabaseUrl = process.env.SUPABASE_URL?.replace(/\/$/, '');
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceKey) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variable.');
  process.exit(1);
}

const sourceUrl = 'https://dummyjson.com/products?limit=0';
const batchSize = 50;

function safeNumber(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function mapProduct(product) {
  const id = Number(product.id);
  const rawSku = typeof product.sku === 'string' ? product.sku.trim() : '';
  // DummyJSON normally provides a SKU. The ID-based fallback is deterministic,
  // so repeated imports won't create duplicate rows for products lacking one.
  const sku = rawSku || `DUMMYJSON-${id}`;
  const createdAt = product.meta?.createdAt || new Date().toISOString();
  const updatedAt = product.meta?.updatedAt || createdAt;

  return {
    title: String(product.title || `Product ${id}`).trim(),
    description: String(product.description || ''),
    category: String(product.category || 'uncategorized'),
    price: Math.max(0, safeNumber(product.price)),
    discountPercentage: safeNumber(product.discountPercentage),
    rating: safeNumber(product.rating),
    stock: Math.max(0, Math.trunc(safeNumber(product.stock))),
    tags: Array.isArray(product.tags) ? product.tags.map(String) : [],
    brand: String(product.brand || ''),
    sku,
    weight: Math.max(0, safeNumber(product.weight)),
    dimensions: product.dimensions && typeof product.dimensions === 'object'
      ? product.dimensions
      : { width: 0, height: 0, depth: 0 },
    warrantyInformation: String(product.warrantyInformation || ''),
    shippingInformation: String(product.shippingInformation || ''),
    availabilityStatus: String(product.availabilityStatus || (safeNumber(product.stock) > 0 ? 'In Stock' : 'Out of Stock')),
    reviews: Array.isArray(product.reviews) ? product.reviews : [],
    returnPolicy: String(product.returnPolicy || ''),
    minimumOrderQuantity: Math.max(1, Math.trunc(safeNumber(product.minimumOrderQuantity, 1))),
    meta: {
      ...(product.meta && typeof product.meta === 'object' ? product.meta : {}),
      createdAt,
      updatedAt,
      barcode: String(product.meta?.barcode || ''),
      qrCode: String(product.meta?.qrCode || ''),
    },
    images: Array.isArray(product.images)
      ? product.images.map(String)
      : (product.thumbnail ? [String(product.thumbnail)] : []),
    thumbnail: String(product.thumbnail || ''),
    createdAt,
    updatedAt,
  };
}

async function main() {
  console.log('Fetching products from DummyJSON...');
  const sourceResponse = await fetch(sourceUrl);
  if (!sourceResponse.ok) {
    throw new Error(`DummyJSON request failed (${sourceResponse.status}).`);
  }
  const payload = await sourceResponse.json();
  if (!Array.isArray(payload.products) || payload.products.length === 0) {
    throw new Error('DummyJSON returned no products; refusing to import an empty catalogue.');
  }

  const products = payload.products.map(mapProduct);
  const skuSet = new Set();
  for (const product of products) {
    if (skuSet.has(product.sku)) {
      throw new Error(`Duplicate SKU in source catalogue: ${product.sku}. Import stopped to avoid ambiguous data.`);
    }
    skuSet.add(product.sku);
  }

  console.log(`Preparing ${products.length} products in batches of ${batchSize}...`);
  let attempted = 0;
  for (let offset = 0; offset < products.length; offset += batchSize) {
    const batch = products.slice(offset, offset + batchSize);
    const endpoint = new URL(`${supabaseUrl}/rest/v1/products`);
    endpoint.searchParams.set('on_conflict', 'sku');

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
        'Content-Type': 'application/json',
        Prefer: 'resolution=ignore-duplicates,return=minimal',
      },
      body: JSON.stringify(batch),
    });

    if (!response.ok) {
      const detail = await response.text().catch(() => '');
      throw new Error(`Supabase import failed for batch starting at ${offset + 1} (${response.status}): ${detail}`);
    }

    attempted += batch.length;
    console.log(`Processed ${Math.min(offset + batch.length, products.length)}/${products.length}`);
  }

  const countResponse = await fetch(`${supabaseUrl}/rest/v1/products?select=id`, {
    method: 'HEAD',
    headers: {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
      Prefer: 'count=exact',
    },
  });

  if (!countResponse.ok) {
    console.warn('Import requests succeeded, but the final row count could not be verified.');
    console.log(`Submitted ${attempted} source products. Check the Supabase Table Editor for the final count.`);
    return;
  }

  const contentRange = countResponse.headers.get('content-range');
  const total = contentRange?.split('/')[1];
  console.log(`Import complete. Source products processed: ${attempted}. Supabase total rows: ${total || 'not reported'}.`);
  console.log('Existing rows with matching SKUs were preserved; this script does not overwrite product edits.');
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : 'Unexpected import error.');
  process.exit(1);
});
