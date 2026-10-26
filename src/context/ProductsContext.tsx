'use client';

/**
 * ProductsContext — Single source of truth for the product list.
 *
 * Implements optimistic UI updates for edit and delete:
 * - Snapshot previous state → apply optimistic change → fire API → rollback on failure.
 * - Each item has an _optimisticStatus: 'idle' | 'pending' | 'error'.
 * - While pending, further actions on the same item are ignored (no double-submit).
 *
 * Local persistence simulation:
 * - DummyJSON doesn't persist writes. After a successful API response,
 *   we merge the change into local state so the UI reflects it within the session.
 * - Added products get a temporary negative ID (Date.now() * -1).
 * - The cache is cleared on any mutation to avoid serving stale data.
 *
 * SIMULATE_FAILURE flag:
 * - Set simulateFailure = true to test rollback without forcing a real API error.
 */

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  ReactNode,
} from 'react';
import { updateProduct, deleteProduct, addProduct } from '@/api/products';
import { productCache } from '@/lib/cache';
import type { Product } from '@/types';

// ─── Dev flag: flip to true to test rollback path ──────────────────────────────
export let simulateFailure = false;
export function setSimulateFailure(val: boolean) {
  simulateFailure = val;
}

interface ProductsContextValue {
  products: Product[];
  total: number;
  setProducts: (products: Product[], total: number) => void;
  mergeProducts: (products: Product[], total: number) => void;
  optimisticEdit: (id: number, changes: Partial<Product>) => Promise<void>;
  optimisticDelete: (id: number) => Promise<void>;
  bulkOptimisticDelete: (ids: number[]) => Promise<{ succeeded: number[]; failed: number[] }>;
  localAdd: (data: Partial<Product>) => Promise<Product>;
  selectedIds: Set<number>;
  toggleSelect: (id: number) => void;
  selectAll: (ids: number[]) => void;
  clearSelection: () => void;
  showFailureSimulator: boolean;
  toggleFailureSimulator: () => void;
}

const ProductsContext = createContext<ProductsContextValue | undefined>(undefined);

export function ProductsProvider({
  children,
  onToast,
}: {
  children: ReactNode;
  onToast: (message: string, type: 'success' | 'error' | 'info') => void;
}) {
  const [products, setProductsState] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [showFailureSimulator, setShowFailureSimulator] = useState(false);

  // Track pending items to prevent double-mutation
  const pendingIds = useRef<Set<number>>(new Set());

  const setProducts = useCallback((prods: Product[], tot: number) => {
    setProductsState(prods.map((p) => ({ ...p, _optimisticStatus: 'idle' as const })));
    setTotal(tot);
  }, []);

  const mergeProducts = useCallback((prods: Product[], tot: number) => {
    setProducts(prods, tot);
  }, [setProducts]);

  const toggleFailureSimulator = useCallback(() => {
    setShowFailureSimulator((v) => {
      const next = !v;
      setSimulateFailure(next);
      return next;
    });
  }, []);

  // ─── Optimistic Edit ────────────────────────────────────────────────────────
  const optimisticEdit = useCallback(
    async (id: number, changes: Partial<Product>) => {
      if (pendingIds.current.has(id)) return; // prevent double-submit
      pendingIds.current.add(id);

      // Snapshot previous state
      const previousProduct = products.find((p) => p.id === id);
      if (!previousProduct) {
        pendingIds.current.delete(id);
        return;
      }

      // Apply optimistic update
      setProductsState((prev) =>
        prev.map((p) =>
          p.id === id ? { ...p, ...changes, _optimisticStatus: 'pending' } : p
        )
      );

      try {
        if (simulateFailure) throw new Error('Simulated failure for testing rollback');

        await updateProduct(id, changes);
        productCache.clear(); // invalidate cache after mutation

        // Confirm update — set status back to idle
        setProductsState((prev) =>
          prev.map((p) =>
            p.id === id ? { ...p, ...changes, _optimisticStatus: 'idle' } : p
          )
        );
        onToast('Product updated successfully', 'success');
      } catch {
        // Rollback to previous state
        setProductsState((prev) =>
          prev.map((p) =>
            p.id === id ? { ...previousProduct, _optimisticStatus: 'error' } : p
          )
        );
        onToast('Update failed — reverting changes', 'error');
      } finally {
        pendingIds.current.delete(id);
        // Reset error status after a moment
        setTimeout(() => {
          setProductsState((prev) =>
            prev.map((p) =>
              p.id === id && p._optimisticStatus === 'error'
                ? { ...p, _optimisticStatus: 'idle' }
                : p
            )
          );
        }, 3000);
      }
    },
    [products, onToast]
  );

  // ─── Optimistic Delete ──────────────────────────────────────────────────────
  const optimisticDelete = useCallback(
    async (id: number) => {
      if (pendingIds.current.has(id)) return; // prevent double-submit
      pendingIds.current.add(id);

      // Snapshot: record item and its original index
      const previousIndex = products.findIndex((p) => p.id === id);
      const previousProduct = products[previousIndex];
      if (!previousProduct) {
        pendingIds.current.delete(id);
        return;
      }

      // Optimistically remove
      setProductsState((prev) => prev.filter((p) => p.id !== id));
      setTotal((t) => t - 1);

      try {
        if (simulateFailure) throw new Error('Simulated failure for testing rollback');

        await deleteProduct(id);
        productCache.clear();
        onToast('Product deleted', 'success');
      } catch {
        // Rollback: re-insert at original index
        setProductsState((prev) => {
          const next = [...prev];
          const insertAt = Math.min(previousIndex, next.length);
          next.splice(insertAt, 0, { ...previousProduct, _optimisticStatus: 'idle' });
          return next;
        });
        setTotal((t) => t + 1);
        onToast('Delete failed — product restored', 'error');
      } finally {
        pendingIds.current.delete(id);
      }
    },
    [products, onToast]
  );

  // ─── Bulk Optimistic Delete ──────────────────────────────────────────────────
  const bulkOptimisticDelete = useCallback(
    async (ids: number[]): Promise<{ succeeded: number[]; failed: number[] }> => {
      // Filter out already-pending items
      const eligibleIds = ids.filter((id) => !pendingIds.current.has(id));
      eligibleIds.forEach((id) => pendingIds.current.add(id));

      // Snapshot: record each product and its original index
      const snapshots: Array<{ product: Product; index: number }> = eligibleIds
        .map((id) => ({
          product: products.find((p) => p.id === id)!,
          index: products.findIndex((p) => p.id === id),
        }))
        .filter((s) => s.product);

      // Optimistically remove all
      setProductsState((prev) => prev.filter((p) => !eligibleIds.includes(p.id)));
      setTotal((t) => t - snapshots.length);

      // Fire all deletes in parallel
      const results = await Promise.allSettled(
        snapshots.map(({ product }) =>
          simulateFailure
            ? Promise.reject(new Error('Simulated failure'))
            : deleteProduct(product.id)
        )
      );

      const succeeded: number[] = [];
      const failed: number[] = [];

      results.forEach((result, idx) => {
        const { product } = snapshots[idx];
        if (result.status === 'fulfilled') {
          succeeded.push(product.id);
        } else {
          failed.push(product.id);
        }
      });

      // Re-insert failed items at their original positions
      if (failed.length > 0) {
        const failedSnapshots = snapshots
          .filter((s) => failed.includes(s.product.id))
          .sort((a, b) => a.index - b.index); // restore in original order

        setProductsState((prev) => {
          const next = [...prev];
          for (const { product, index } of failedSnapshots) {
            const insertAt = Math.min(index, next.length);
            next.splice(insertAt, 0, { ...product, _optimisticStatus: 'idle' });
          }
          return next;
        });
        setTotal((t) => t + failed.length);
      }

      if (succeeded.length > 0) productCache.clear();

      eligibleIds.forEach((id) => pendingIds.current.delete(id));
      return { succeeded, failed };
    },
    [products]
  );

  // ─── Local Add ──────────────────────────────────────────────────────────────
  const localAdd = useCallback(
    async (data: Partial<Product>): Promise<Product> => {
      const apiResult = await addProduct(data);
      productCache.clear();

      // The backend owns the permanent ID; never replace it with a temporary client ID.
      const savedProduct: Product = {
        ...apiResult,
        ...data,
        id: apiResult.id,
        _isLocal: false,
        _optimisticStatus: 'idle',
      };
      setProductsState((prev) => [savedProduct, ...prev]);
      setTotal((t) => t + 1);
      return savedProduct;
    },
    []
  );

  // ─── Selection ───────────────────────────────────────────────────────────────
  const toggleSelect = useCallback((id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const selectAll = useCallback((ids: number[]) => {
    setSelectedIds(new Set(ids));
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  return (
    <ProductsContext.Provider
      value={{
        products,
        total,
        setProducts,
        mergeProducts,
        optimisticEdit,
        optimisticDelete,
        bulkOptimisticDelete,
        localAdd,
        selectedIds,
        toggleSelect,
        selectAll,
        clearSelection,
        showFailureSimulator,
        toggleFailureSimulator,
      }}
    >
      {children}
    </ProductsContext.Provider>
  );
}

export function useProducts(): ProductsContextValue {
  const ctx = useContext(ProductsContext);
  if (!ctx) throw new Error('useProducts must be used within ProductsProvider');
  return ctx;
}
