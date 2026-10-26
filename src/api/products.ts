// api/products.ts — All product-related API services
// Never call axiosInstance directly inside components — always use these functions.

import axiosInstance from '@/lib/product-axios';
import type { Product, PaginatedProducts } from '@/types';

// ─── List + Paginate ──────────────────────────────────────────────────────────

interface GetProductsParams {
  limit?: number;
  skip?: number;
  sortBy?: string;
  order?: string;
  signal?: AbortSignal;
}

export async function getProducts(params: GetProductsParams = {}): Promise<PaginatedProducts> {
  const { signal, ...rest } = params;
  const response = await axiosInstance.get<PaginatedProducts>('/products', {
    params: {
      limit: rest.limit ?? 10,
      skip: rest.skip ?? 0,
      ...(rest.sortBy ? { sortBy: rest.sortBy, order: rest.order ?? 'asc' } : {}),
    },
    signal,
  });
  return response.data;
}

// ─── Search ───────────────────────────────────────────────────────────────────

interface SearchProductsParams {
  q: string;
  limit?: number;
  skip?: number;
  sortBy?: string;
  order?: string;
  signal?: AbortSignal;
}

export async function searchProducts(params: SearchProductsParams): Promise<PaginatedProducts> {
  const { signal, q, ...rest } = params;
  const response = await axiosInstance.get<PaginatedProducts>('/products/search', {
    params: {
      q,
      limit: rest.limit ?? 10,
      skip: rest.skip ?? 0,
      ...(rest.sortBy ? { sortBy: rest.sortBy, order: rest.order ?? 'asc' } : {}),
    },
    signal,
  });
  return response.data;
}

// ─── By Category ──────────────────────────────────────────────────────────────

interface GetByCategoryParams {
  category: string;
  limit?: number;
  skip?: number;
  sortBy?: string;
  order?: string;
  signal?: AbortSignal;
}

export async function getProductsByCategory(params: GetByCategoryParams): Promise<PaginatedProducts> {
  const { signal, category, ...rest } = params;
  const response = await axiosInstance.get<PaginatedProducts>(`/products/category/${encodeURIComponent(category)}`, {
    params: {
      limit: rest.limit ?? 10,
      skip: rest.skip ?? 0,
      ...(rest.sortBy ? { sortBy: rest.sortBy, order: rest.order ?? 'asc' } : {}),
    },
    signal,
  });
  return response.data;
}

// ─── Single Product ───────────────────────────────────────────────────────────

export async function getProduct(id: number): Promise<Product> {
  const response = await axiosInstance.get<Product>(`/products/${id}`);
  return response.data;
}

// ─── Categories ───────────────────────────────────────────────────────────────

interface CategoryItem {
  slug: string;
  name: string;
  url: string;
}

export async function getCategories(): Promise<CategoryItem[]> {
  const response = await axiosInstance.get<CategoryItem[]>('/products/categories');
  return response.data;
}

// ─── Add ─────────────────────────────────────────────────────────────────────

export async function addProduct(data: Partial<Product>): Promise<Product> {
  const response = await axiosInstance.post<Product>('/products/add', data);
  return response.data;
}

// ─── Update ──────────────────────────────────────────────────────────────────

export async function updateProduct(id: number, data: Partial<Product>): Promise<Product> {
  const response = await axiosInstance.put<Product>(`/products/${id}`, data);
  return response.data;
}

// ─── Delete ──────────────────────────────────────────────────────────────────

export async function deleteProduct(id: number): Promise<{ isDeleted: boolean; deletedOn: string }> {
  const response = await axiosInstance.delete<{ isDeleted: boolean; deletedOn: string }>(
    `/products/${id}`
  );
  return response.data;
}
