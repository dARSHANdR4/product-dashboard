import type { Product } from '@/types';
import { resolveProductImages, validateProductInput } from './product-validation.mjs';

const tableUrl = () => {
  const base = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!base || !key) throw new ApiFailure(503, 'Database is not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.');
  return { url: `${base.replace(/\/$/, '')}/rest/v1/products`, key };
};

export class ApiFailure extends Error {
  constructor(public status: number, message: string) { super(message); }
}

export async function dbRequest<T>(path = '', init: RequestInit = {}): Promise<T> {
  const { url, key } = tableUrl();
  const headers = new Headers(init.headers);
  headers.set('apikey', key);
  headers.set('Authorization', `Bearer ${key}`);
  headers.set('Content-Type', 'application/json');
  if (!headers.has('Prefer')) headers.set('Prefer', 'return=representation');
  const response = await fetch(`${url}${path}`, { ...init, cache: 'no-store', headers });
  if (!response.ok) {
    const detail = await response.text().catch(() => '');
    throw new ApiFailure(response.status === 404 ? 404 : 502, detail || 'Database request failed');
  }
  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

export async function requireUser(request: Request): Promise<void> {
  const authorization = request.headers.get('authorization');
  if (!authorization?.startsWith('Bearer ')) throw new ApiFailure(401, 'Authentication required');
  const token = authorization.slice(7).trim();
  if (!token) throw new ApiFailure(401, 'Authentication required');
  try {
    const response = await fetch('https://dummyjson.com/auth/me', {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    });
    if (!response.ok) throw new ApiFailure(401, 'Session expired. Please log in again.');
  } catch (error) {
    if (error instanceof ApiFailure) throw error;
    throw new ApiFailure(503, 'Unable to verify session');
  }
}

export function jsonError(error: unknown): Response {
  const status = error instanceof ApiFailure ? error.status : 500;
  const message = error instanceof Error ? error.message : 'Unexpected server error';
  return Response.json({ message }, { status });
}

const allowedSort = new Set(['id', 'title', 'price', 'rating', 'stock', 'category', 'createdAt']);
export async function dbCount(filters: string): Promise<number> {
  const { url, key } = tableUrl();
  const response = await fetch(`${url}?${filters}`, {
    method: 'HEAD',
    cache: 'no-store',
    headers: { apikey: key, Authorization: `Bearer ${key}`, Prefer: 'count=exact' },
  });
  if (!response.ok) throw new ApiFailure(502, 'Unable to count products');
  const range = response.headers.get('content-range');
  const total = range?.split('/')[1];
  return total && total !== '*' ? Number(total) : 0;
}

export function queryOptions(url: URL) {
  const limit = Math.min(100, Math.max(1, Number.parseInt(url.searchParams.get('limit') || '10', 10) || 10));
  const skip = Math.max(0, Number.parseInt(url.searchParams.get('skip') || '0', 10) || 0);
  const sortBy = url.searchParams.get('sortBy') || 'id';
  const order = url.searchParams.get('order') === 'desc' ? 'desc' : 'asc';
  if (!allowedSort.has(sortBy)) throw new ApiFailure(400, 'Unsupported sort field');
  return { limit, skip, sortBy, order };
}

export function normalizeProduct(input: Partial<Product>) {
  const validation = validateProductInput(input);
  if (!validation.ok) {
    throw new ApiFailure(400, 'message' in validation ? validation.message : 'Invalid product input');
  }
  const value = validation.value!;
  const { title, category, price, stock } = value;
  const { images, thumbnail } = resolveProductImages(input);
  return {
    title,
    description: input.description ?? '',
    category,
    price,
    discountPercentage: Number(input.discountPercentage ?? 0),
    rating: Number(input.rating ?? 0),
    stock,
    tags: input.tags ?? [],
    brand: input.brand ?? '',
    sku: input.sku || `SKU-${crypto.randomUUID()}`,
    weight: Number(input.weight ?? 0),
    dimensions: input.dimensions ?? { width: 0, height: 0, depth: 0 },
    warrantyInformation: input.warrantyInformation ?? '',
    shippingInformation: input.shippingInformation ?? '',
    availabilityStatus: input.availabilityStatus ?? (stock > 0 ? 'In Stock' : 'Out of Stock'),
    reviews: input.reviews ?? [],
    returnPolicy: input.returnPolicy ?? '',
    minimumOrderQuantity: Number(input.minimumOrderQuantity ?? 1),
    meta: input.meta ?? { createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), barcode: '', qrCode: '' },
    images,
    thumbnail,
  };
}

export function toProduct(row: Record<string, unknown>): Product {
  return {
    ...row,
    id: Number(row.id),
    title: String(row.title ?? ''),
    description: String(row.description ?? ''),
    category: String(row.category ?? ''),
    price: Number(row.price ?? 0),
    discountPercentage: Number(row.discountPercentage ?? 0),
    rating: Number(row.rating ?? 0),
    stock: Number(row.stock ?? 0),
    tags: Array.isArray(row.tags) ? row.tags as string[] : [],
    brand: String(row.brand ?? ''),
    sku: String(row.sku ?? ''),
    weight: Number(row.weight ?? 0),
    dimensions: (row.dimensions ?? { width: 0, height: 0, depth: 0 }) as Product['dimensions'],
    warrantyInformation: String(row.warrantyInformation ?? ''),
    shippingInformation: String(row.shippingInformation ?? ''),
    availabilityStatus: String(row.availabilityStatus ?? 'In Stock'),
    reviews: Array.isArray(row.reviews) ? row.reviews as Product['reviews'] : [],
    returnPolicy: String(row.returnPolicy ?? ''),
    minimumOrderQuantity: Number(row.minimumOrderQuantity ?? 1),
    meta: (row.meta ?? { createdAt: '', updatedAt: '', barcode: '', qrCode: '' }) as Product['meta'],
    images: Array.isArray(row.images) ? row.images as string[] : [],
    thumbnail: String(row.thumbnail ?? ''),
  } as Product;
}
