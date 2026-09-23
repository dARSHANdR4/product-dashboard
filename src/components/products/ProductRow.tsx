'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useProducts } from '@/context/ProductsContext';
import DeleteModal from './DeleteModal';
import type { Product } from '@/types';

interface Props {
  product: Product;
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-1" title={`${rating.toFixed(1)} out of 5`}>
      {Array.from({ length: 5 }).map((_, i) => {
        const filled = i < Math.floor(rating);
        const half = !filled && i < rating;
        return (
          <svg key={i} className={`w-3 h-3 ${filled || half ? 'text-amber-400' : 'text-slate-300 dark:text-slate-600'}`} viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        );
      })}
      <span className="text-xs text-slate-500 dark:text-slate-400 ml-1">{rating.toFixed(1)}</span>
    </div>
  );
}

export default function ProductRow({ product }: Props) {
  const { optimisticDelete, selectedIds, toggleSelect } = useProducts();
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const isPending = product._optimisticStatus === 'pending';
  const isError = product._optimisticStatus === 'error';
  const isSelected = selectedIds.has(product.id);

  const stockColor =
    product.stock === 0
      ? 'text-red-600 dark:text-red-400'
      : product.stock < 10
      ? 'text-amber-600 dark:text-amber-400'
      : 'text-emerald-600 dark:text-emerald-400';

  return (
    <>
      <tr
        className={`
          group border-b border-slate-100 dark:border-slate-700/50
          transition-all duration-200
          ${isPending ? 'opacity-50' : ''}
          ${isError ? 'bg-red-50/50 dark:bg-red-900/10' : 'hover:bg-slate-50 dark:hover:bg-slate-700/30'}
          ${isSelected ? 'bg-blue-50 dark:bg-blue-900/20' : ''}
        `}
      >
        {/* Checkbox */}
        <td className="pl-4 pr-2 py-3 w-10">
          <input
            type="checkbox"
            id={`select-${product.id}`}
            checked={isSelected}
            onChange={() => toggleSelect(product.id)}
            disabled={isPending}
            className="w-4 h-4 rounded border-slate-300 dark:border-slate-600 text-blue-600 focus:ring-blue-500 disabled:opacity-50 cursor-pointer"
            aria-label={`Select ${product.title}`}
          />
        </td>

        {/* Thumbnail */}
        <td className="px-2 py-3 w-16">
          <Link href={`/products/${product.id}`}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={product.thumbnail}
              alt={product.title}
              className="w-12 h-12 object-cover rounded-lg border border-slate-200 dark:border-slate-600 group-hover:scale-105 transition-transform duration-200"
              loading="lazy"
            />
          </Link>
        </td>

        {/* Title + Brand */}
        <td className="px-4 py-3">
          <Link href={`/products/${product.id}`} className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
            <p className="font-medium text-slate-900 dark:text-white text-sm line-clamp-1">{product.title}</p>
            {product.brand && (
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{product.brand}</p>
            )}
          </Link>
          {product._isLocal && (
            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 mt-1">
              Local
            </span>
          )}
        </td>

        {/* Category */}
        <td className="px-4 py-3 hidden lg:table-cell">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 capitalize">
            {product.category.replace(/-/g, ' ')}
          </span>
        </td>

        {/* Price */}
        <td className="px-4 py-3">
          <div>
            <span className="font-semibold text-slate-900 dark:text-white text-sm">
              ${product.price.toFixed(2)}
            </span>
            {product.discountPercentage > 0 && (
              <span className="ml-1.5 text-xs text-emerald-600 dark:text-emerald-400">
                -{product.discountPercentage.toFixed(0)}%
              </span>
            )}
          </div>
        </td>

        {/* Rating */}
        <td className="px-4 py-3 hidden md:table-cell">
          <StarRating rating={product.rating} />
        </td>

        {/* Stock */}
        <td className="px-4 py-3 hidden md:table-cell">
          <span className={`text-sm font-medium ${stockColor}`}>
            {product.stock === 0 ? 'Out' : product.stock}
          </span>
        </td>

        {/* Actions */}
        <td className="px-4 py-3">
          <div className="flex items-center gap-1.5">
            <Link
              href={`/products/${product.id}/edit`}
              id={`edit-${product.id}`}
              className={`
                inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium
                bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400
                hover:bg-blue-100 dark:hover:bg-blue-900/40
                transition-colors duration-150
                ${isPending ? 'pointer-events-none opacity-50' : ''}
              `}
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Edit
            </Link>
            <button
              id={`delete-${product.id}`}
              onClick={() => setShowDeleteModal(true)}
              disabled={isPending}
              className="
                inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium
                bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400
                hover:bg-red-100 dark:hover:bg-red-900/40
                transition-colors duration-150
                disabled:opacity-50 disabled:cursor-not-allowed
              "
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
        </td>
      </tr>

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
