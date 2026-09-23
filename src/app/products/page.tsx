'use client';

import React, { useEffect, useState, useRef, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { getProducts, searchProducts, getProductsByCategory, getCategories } from '@/api/products';
import { productCache, buildCacheKey } from '@/lib/cache';
import { useProducts } from '@/context/ProductsContext';
import { useToast } from '@/context/ToastContext';
import { useDebounce } from '@/hooks/useDebounce';
import ProductTable from '@/components/products/ProductTable';
import ProductSkeleton from '@/components/products/ProductSkeleton';
import SearchBar from '@/components/products/SearchBar';
import FilterSort from '@/components/products/FilterSort';
import Pagination from '@/components/products/Pagination';
import type { SortField, SortOrder } from '@/types';

// ─── URL param helpers ─────────────────────────────────────────────────────────
function safeInt(val: string | null, fallback: number, min = 1, max = Infinity): number {
  const n = parseInt(val ?? '', 10);
  if (isNaN(n)) return fallback;
  return Math.max(min, Math.min(max, n));
}

function safeLimit(val: string | null): number {
  const n = parseInt(val ?? '', 10);
  return [10, 20, 50].includes(n) ? n : 10;
}

function safeSortField(val: string | null): SortField | '' {
  return ['price', 'rating', 'title'].includes(val ?? '') ? (val as SortField) : '';
}

function safeSortOrder(val: string | null): SortOrder {
  return val === 'desc' ? 'desc' : 'asc';
}

// ─── Inner page (uses useSearchParams) ────────────────────────────────────────
function ProductsPageInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { setProducts, products, total, clearSelection } = useProducts();
  const { showToast } = useToast();

  // ── Read URL params with guards ──────────────────────────────────────────────
  const page = safeInt(searchParams.get('page'), 1, 1);
  const limit = safeLimit(searchParams.get('limit'));
  const urlSearch = searchParams.get('search') ?? '';
  const urlCategory = searchParams.get('category') ?? '';
  const sortBy = safeSortField(searchParams.get('sortBy'));
  const sortOrder = safeSortOrder(searchParams.get('sortOrder'));

  // ── Local state for the search input (not URL-synced until debounced) ────────
  const [searchInput, setSearchInput] = useState(urlSearch);
  const debouncedSearch = useDebounce(searchInput, 450);

  // ── Fetch state ───────────────────────────────────────────────────────────────
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<string[]>([]);

  // Race-condition guard: only the latest request may update state
  const requestIdRef = useRef(0);
  const abortControllerRef = useRef<AbortController | null>(null);

  // ── Sync debounced search to URL ─────────────────────────────────────────────
  useEffect(() => {
    if (debouncedSearch === urlSearch) return;
    const params = new URLSearchParams(searchParams.toString());
    if (debouncedSearch) {
      params.set('search', debouncedSearch);
      // Mutual exclusivity: search clears category
      if (params.get('category')) {
        params.delete('category');
        showToast('Search started — category filter cleared', 'info');
      }
    } else {
      params.delete('search');
    }
    params.set('page', '1');
    router.replace(`/products?${params.toString()}`, { scroll: false });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  // ── Category change → clear search ──────────────────────────────────────────
  const handleCategoryChange = useCallback((cat: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (cat) {
      params.set('category', cat);
      // Mutual exclusivity: category clears search
      if (params.get('search')) {
        params.delete('search');
        setSearchInput('');
        showToast('Category selected — search cleared', 'info');
      }
    } else {
      params.delete('category');
    }
    params.set('page', '1');
    router.push(`/products?${params.toString()}`, { scroll: false });
  }, [searchParams, router, showToast]);

  const handleSortChange = useCallback((field: SortField | '', order: SortOrder) => {
    const params = new URLSearchParams(searchParams.toString());
    if (field) {
      params.set('sortBy', field);
      params.set('sortOrder', order);
    } else {
      params.delete('sortBy');
      params.delete('sortOrder');
    }
    params.set('page', '1');
    router.push(`/products?${params.toString()}`, { scroll: false });
  }, [searchParams, router]);

  const handleSortToggle = useCallback((field: string) => {
    const newField = field as SortField;
    const newOrder: SortOrder = sortBy === newField && sortOrder === 'asc' ? 'desc' : 'asc';
    handleSortChange(newField, newOrder);
  }, [sortBy, sortOrder, handleSortChange]);

  const handlePageChange = useCallback((newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', String(newPage));
    router.push(`/products?${params.toString()}`, { scroll: false });
    clearSelection(); // clear selection on page change (deliberate scope decision)
  }, [searchParams, router, clearSelection]);

  const handleLimitChange = useCallback((newLimit: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('limit', String(newLimit));
    params.set('page', '1');
    router.push(`/products?${params.toString()}`, { scroll: false });
  }, [searchParams, router]);

  // ── Fetch categories on mount ────────────────────────────────────────────────
  useEffect(() => {
    getCategories().then((cats) => setCategories(cats.map((c) => c.slug))).catch(() => {});
  }, []);

  // ── Main data fetch ───────────────────────────────────────────────────────────
  const fetchProducts = useCallback(async () => {
    const thisId = ++requestIdRef.current;

    // Check cache first — if hit, use immediately (no spinner)
    const cacheKey = buildCacheKey({ page, limit, search: urlSearch, category: urlCategory, sortBy, sortOrder });
    const cached = productCache.get<{ products: unknown[]; total: number }>(cacheKey);
    if (cached) {
      setProducts(cached.products as Parameters<typeof setProducts>[0], cached.total);
      setIsLoading(false);
      setError(null);
      return; // cache hit → skip network entirely
    }

    // Cancel any previous in-flight request
    abortControllerRef.current?.abort();
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setIsLoading(true);
    setError(null);

    try {
      const skip = (page - 1) * limit;
      const sortParams = sortBy ? { sortBy, order: sortOrder } : {};

      let result;
      if (urlSearch) {
        result = await searchProducts({ q: urlSearch, limit, skip, ...sortParams, signal: controller.signal });
      } else if (urlCategory) {
        result = await getProductsByCategory({ category: urlCategory, limit, skip, ...sortParams, signal: controller.signal });
      } else {
        result = await getProducts({ limit, skip, ...sortParams, signal: controller.signal });
      }

      // Race condition guard: ignore stale responses
      if (thisId !== requestIdRef.current) return;

      productCache.set(cacheKey, result);
      setProducts(result.products, result.total);
      setError(null);
    } catch (err: unknown) {
      if (thisId !== requestIdRef.current) return;
      // Ignore AbortError (cancelled request)
      if (err && typeof err === 'object' && 'name' in err && (err as { name: string }).name === 'CanceledError') return;
      const msg = (err as { message?: string })?.message || 'Failed to load products.';
      setError(msg);
      showToast(msg, 'error');
    } finally {
      if (thisId === requestIdRef.current) setIsLoading(false);
    }
  }, [page, limit, urlSearch, urlCategory, sortBy, sortOrder, setProducts, showToast]);

  useEffect(() => {
    fetchProducts();
    return () => { abortControllerRef.current?.abort(); };
  }, [fetchProducts]);

  // Sync input with URL (e.g., browser back/forward)
  useEffect(() => {
    setSearchInput(urlSearch);
  }, [urlSearch]);

  // ── Empty / Error state components ────────────────────────────────────────────
  const EmptyState = () => (
    <div className="flex flex-col items-center justify-center py-20 text-center fade-up">
      <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
        <svg className="w-8 h-8 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>
      <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-1">No results found</h3>
      <p className="text-sm text-slate-400 dark:text-slate-500 max-w-xs">
        {urlSearch
          ? `No products match "${urlSearch}". Try a different search term.`
          : urlCategory
          ? `No products in the "${urlCategory}" category.`
          : 'No products available.'}
      </p>
      {(urlSearch || urlCategory) && (
        <button
          onClick={() => {
            setSearchInput('');
            router.push('/products');
          }}
          className="mt-4 px-4 py-2 rounded-xl text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors"
        >
          Clear filters
        </button>
      )}
    </div>
  );

  const ErrorState = () => (
    <div className="flex flex-col items-center justify-center py-20 text-center fade-up">
      <div className="w-16 h-16 rounded-2xl bg-red-50 dark:bg-red-900/20 flex items-center justify-center mb-4">
        <svg className="w-8 h-8 text-red-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
        </svg>
      </div>
      <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-1">Failed to load</h3>
      <p className="text-sm text-slate-400 dark:text-slate-500 max-w-xs mb-4">{error}</p>
      <button
        id="retry-btn"
        onClick={fetchProducts}
        className="px-4 py-2 rounded-xl text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors flex items-center gap-2"
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
        Retry
      </button>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Products</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            {isLoading ? 'Loading...' : `${total.toLocaleString()} total products`}
          </p>
        </div>
        <Link
          href="/products/new"
          id="add-product-btn"
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:from-blue-600 hover:to-indigo-700 shadow-lg shadow-blue-500/25 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Add Product
        </Link>
      </div>

      {/* Search + Filter bar */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-3">
          <SearchBar
            value={searchInput}
            onChange={setSearchInput}
            isLoading={isLoading && !!debouncedSearch}
          />
          <FilterSort
            categories={categories}
            selectedCategory={urlCategory}
            onCategoryChange={handleCategoryChange}
            sortBy={sortBy}
            sortOrder={sortOrder}
            onSortChange={handleSortChange}
            isLoading={isLoading}
          />
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <ProductSkeleton count={limit} />
      ) : error ? (
        <ErrorState />
      ) : products.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          <ProductTable
            products={products}
            sortBy={sortBy}
            sortOrder={sortOrder}
            onSort={handleSortToggle}
          />
          <Pagination
            page={page}
            limit={limit}
            total={total}
            onPageChange={handlePageChange}
            onLimitChange={handleLimitChange}
          />
        </>
      )}
    </div>
  );
}

// ─── Outer page wraps inner in Suspense (required for useSearchParams) ─────────
export default function ProductsPage() {
  return (
    <Suspense>
      <ProductsPageInner />
    </Suspense>
  );
}
