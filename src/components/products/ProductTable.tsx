'use client';

import React from 'react';
import { useProducts } from '@/context/ProductsContext';
import ProductRow from './ProductRow';
import ProductCard from './ProductCard';
import BulkActionBar from './BulkActionBar';
import type { Product } from '@/types';

interface Props {
  products: Product[];
  sortBy: string;
  sortOrder: string;
  onSort: (field: string) => void;
}

function SortIcon({ field, currentField, order }: { field: string; currentField: string; order: string }) {
  const isActive = field === currentField;
  return (
    <span className={`ml-1 ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-300 dark:text-slate-600'}`}>
      {isActive && order === 'asc' ? '↑' : isActive && order === 'desc' ? '↓' : '↕'}
    </span>
  );
}

export default function ProductTable({ products, sortBy, sortOrder, onSort }: Props) {
  const { selectedIds, selectAll, clearSelection } = useProducts();

  const allSelected = products.length > 0 && products.every((p) => selectedIds.has(p.id));
  const someSelected = products.some((p) => selectedIds.has(p.id));

  const handleSelectAll = () => {
    if (allSelected) {
      clearSelection();
    } else {
      selectAll(products.map((p) => p.id));
    }
  };

  const SortableHeader = ({ field, label, className = '' }: { field: string; label: string; className?: string }) => (
    <th
      className={`px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider cursor-pointer hover:text-slate-700 dark:hover:text-slate-200 select-none transition-colors ${className}`}
      onClick={() => onSort(field)}
    >
      {label}
      <SortIcon field={field} currentField={sortBy} order={sortOrder} />
    </th>
  );

  return (
    <div>
      <BulkActionBar />

      {/* Desktop Table */}
      <div className="hidden md:block overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
        <table className="w-full">
          <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700">
            <tr>
              <th className="pl-4 pr-2 py-3 w-10">
                <input
                  type="checkbox"
                  id="select-all"
                  checked={allSelected}
                  ref={(el) => { if (el) el.indeterminate = someSelected && !allSelected; }}
                  onChange={handleSelectAll}
                  className="w-4 h-4 rounded border-slate-300 dark:border-slate-600 text-blue-600 focus:ring-blue-500 cursor-pointer"
                  aria-label="Select all products on this page"
                />
              </th>
              <th className="px-2 py-3 w-16" />
              <SortableHeader field="title" label="Product" />
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider hidden lg:table-cell">Category</th>
              <SortableHeader field="price" label="Price" />
              <SortableHeader field="rating" label="Rating" className="hidden md:table-cell" />
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider hidden md:table-cell">Stock</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-50 dark:divide-slate-700/30">
            {products.map((product) => (
              <ProductRow key={product.id} product={product} />
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden">
        {someSelected && (
          <div className="mb-3 flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
            <input
              type="checkbox"
              checked={allSelected}
              ref={(el) => { if (el) el.indeterminate = someSelected && !allSelected; }}
              onChange={handleSelectAll}
              className="w-4 h-4 rounded border-slate-300 dark:border-slate-600 text-blue-600 focus:ring-blue-500 cursor-pointer"
              aria-label="Select all"
            />
            <span>Select all</span>
          </div>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </div>
  );
}
