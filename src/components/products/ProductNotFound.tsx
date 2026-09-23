import React from 'react';
import Link from 'next/link';

interface Props {
  id?: string | number;
}

export default function ProductNotFound({ id }: Props) {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4 fade-up">
      {/* Illustration */}
      <div className="relative mb-8">
        <div className="w-32 h-32 rounded-3xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 flex items-center justify-center shadow-inner">
          <svg className="w-16 h-16 text-slate-300 dark:text-slate-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
        </div>
        <div className="absolute -top-2 -right-2 w-8 h-8 rounded-xl bg-red-100 dark:bg-red-900/40 border-2 border-white dark:border-slate-900 flex items-center justify-center">
          <svg className="w-4 h-4 text-red-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
      </div>

      <h1 className="text-4xl font-black text-slate-200 dark:text-slate-700 mb-2">404</h1>
      <h2 className="text-xl font-bold text-slate-700 dark:text-slate-300 mb-2">Product not found</h2>
      <p className="text-sm text-slate-400 dark:text-slate-500 max-w-sm mb-8">
        {id
          ? `We couldn't find a product with ID "${id}". It may have been deleted or the link might be incorrect.`
          : 'This product does not exist or has been removed.'}
      </p>

      <div className="flex flex-col sm:flex-row items-center gap-3">
        <Link
          href="/products"
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/20"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to products
        </Link>
        <Link
          href="/products/new"
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Add new product
        </Link>
      </div>
    </div>
  );
}
