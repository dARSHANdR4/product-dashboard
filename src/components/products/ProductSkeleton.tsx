import React from 'react';

export default function ProductSkeleton({ count = 10 }: { count?: number }) {
  return (
    <>
      {/* Desktop table skeleton */}
      <div className="hidden md:block overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm">
        {/* Header */}
        <div className="grid grid-cols-[48px_64px_1fr_160px_100px_80px_80px_100px] gap-4 px-4 py-3 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
          {['', '', 'Product', 'Category', 'Price', 'Rating', 'Stock', 'Actions'].map((h, i) => (
            <div key={i} className={`skeleton h-4 rounded ${i === 0 ? 'w-4' : i === 1 ? 'w-12' : ''}`} />
          ))}
        </div>
        {/* Rows */}
        {Array.from({ length: count }).map((_, i) => (
          <div
            key={i}
            className="grid grid-cols-[48px_64px_1fr_160px_100px_80px_80px_100px] gap-4 px-4 py-4 border-b border-slate-50 dark:border-slate-700/50 items-center"
          >
            <div className="skeleton h-4 w-4 rounded" />
            <div className="skeleton w-12 h-12 rounded-lg" />
            <div className="space-y-2">
              <div className="skeleton h-4 w-3/4 rounded" />
              <div className="skeleton h-3 w-1/2 rounded" />
            </div>
            <div className="skeleton h-4 w-20 rounded-full" />
            <div className="skeleton h-5 w-16 rounded" />
            <div className="skeleton h-4 w-10 rounded" />
            <div className="skeleton h-4 w-12 rounded" />
            <div className="flex gap-2">
              <div className="skeleton h-8 w-16 rounded-lg" />
              <div className="skeleton h-8 w-16 rounded-lg" />
            </div>
          </div>
        ))}
      </div>

      {/* Mobile card skeleton */}
      <div className="md:hidden grid grid-cols-1 sm:grid-cols-2 gap-4">
        {Array.from({ length: Math.min(count, 6) }).map((_, i) => (
          <div
            key={i}
            className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 space-y-3"
          >
            <div className="flex items-start gap-3">
              <div className="skeleton w-16 h-16 rounded-xl shrink-0" />
              <div className="flex-1 space-y-2 pt-1">
                <div className="skeleton h-4 w-3/4 rounded" />
                <div className="skeleton h-3 w-1/2 rounded-full" />
              </div>
            </div>
            <div className="flex gap-2">
              <div className="skeleton h-4 w-16 rounded" />
              <div className="skeleton h-4 w-12 rounded" />
            </div>
            <div className="flex gap-2 pt-1">
              <div className="skeleton h-8 flex-1 rounded-lg" />
              <div className="skeleton h-8 flex-1 rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
