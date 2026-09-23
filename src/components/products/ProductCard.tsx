'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useProducts } from '@/context/ProductsContext';
import DeleteModal from './DeleteModal';
import type { Product } from '@/types';

interface Props {
  product: Product;
}

export default function ProductCard({ product }: Props) {
  const { optimisticDelete, selectedIds, toggleSelect } = useProducts();
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const isPending = product._optimisticStatus === 'pending';
  const isSelected = selectedIds.has(product.id);

  const stockBadge =
    product.stock === 0
      ? { label: 'Out of stock', cls: 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400' }
      : product.stock < 10
      ? { label: `Low: ${product.stock}`, cls: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400' }
      : { label: `${product.stock} in stock`, cls: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400' };

  return (
    <>
      <div
        className={`
          relative group bg-white dark:bg-slate-800 rounded-2xl border transition-all duration-200
          ${isSelected ? 'border-blue-400 dark:border-blue-500 ring-2 ring-blue-400/30' : 'border-slate-200 dark:border-slate-700'}
          ${isPending ? 'opacity-60' : 'hover:shadow-md hover:-translate-y-0.5'}
          overflow-hidden
        `}
      >
        {/* Checkbox */}
        <div className="absolute top-3 left-3 z-10">
          <input
            type="checkbox"
            id={`card-select-${product.id}`}
            checked={isSelected}
            onChange={() => toggleSelect(product.id)}
            disabled={isPending}
            className="w-4 h-4 rounded border-slate-300 dark:border-slate-600 text-blue-600 focus:ring-blue-500 bg-white/90 dark:bg-slate-800/90 cursor-pointer"
            aria-label={`Select ${product.title}`}
          />
        </div>

        {/* Local badge */}
        {product._isLocal && (
          <div className="absolute top-3 right-3 z-10">
            <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-400">
              Local
            </span>
          </div>
        )}

        {/* Image */}
        <Link href={`/products/${product.id}`}>
          <div className="aspect-video bg-slate-50 dark:bg-slate-700/50 overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={product.thumbnail}
              alt={product.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />
          </div>
        </Link>

        <div className="p-4 space-y-3">
          {/* Category + Rating */}
          <div className="flex items-center justify-between">
            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 capitalize">
              {product.category.replace(/-/g, ' ')}
            </span>
            <div className="flex items-center gap-1 text-amber-400">
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
              <span className="text-xs font-medium text-slate-600 dark:text-slate-400">{product.rating.toFixed(1)}</span>
            </div>
          </div>

          {/* Title */}
          <Link href={`/products/${product.id}`} className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
            <h3 className="font-semibold text-slate-900 dark:text-white text-sm line-clamp-2 leading-snug">
              {product.title}
            </h3>
          </Link>

          {/* Price + Stock */}
          <div className="flex items-center justify-between">
            <div>
              <span className="text-lg font-bold text-slate-900 dark:text-white">
                ${product.price.toFixed(2)}
              </span>
              {product.discountPercentage > 0 && (
                <span className="ml-1 text-xs text-emerald-600 dark:text-emerald-400">
                  -{product.discountPercentage.toFixed(0)}%
                </span>
              )}
            </div>
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${stockBadge.cls}`}>
              {stockBadge.label}
            </span>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-1">
            <Link
              href={`/products/${product.id}/edit`}
              id={`card-edit-${product.id}`}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-medium bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Edit
            </Link>
            <button
              id={`card-delete-${product.id}`}
              onClick={() => setShowDeleteModal(true)}
              disabled={isPending}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-medium bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPending ? (
                <svg className="animate-spin w-3.5 h-3.5" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : (
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              )}
              Delete
            </button>
          </div>
        </div>
      </div>

      {showDeleteModal && (
        <DeleteModal
          productTitle={product.title}
          onConfirm={async () => {
            setShowDeleteModal(false);
            await optimisticDelete(product.id);
          }}
          onCancel={() => setShowDeleteModal(false)}
        />
      )}
    </>
  );
}
