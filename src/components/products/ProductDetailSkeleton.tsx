import React from 'react';

export default function ProductDetailSkeleton() {
  return (
    <div className="space-y-8 fade-up">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2">
        <div className="skeleton h-4 w-20 rounded" />
        <div className="skeleton h-4 w-4 rounded" />
        <div className="skeleton h-4 w-32 rounded" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Image carousel skeleton */}
        <div className="space-y-3">
          <div className="skeleton w-full aspect-square rounded-2xl" />
          <div className="flex gap-2 justify-center">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="skeleton w-16 h-16 rounded-lg" />
            ))}
          </div>
        </div>

        {/* Details skeleton */}
        <div className="space-y-4">
          <div className="skeleton h-3 w-24 rounded-full" />
          <div className="skeleton h-8 w-3/4 rounded" />
          <div className="skeleton h-4 w-1/2 rounded" />

          <div className="flex items-center gap-3">
            <div className="skeleton h-8 w-24 rounded" />
            <div className="skeleton h-6 w-16 rounded" />
          </div>

          <div className="skeleton h-px w-full rounded" />

          <div className="space-y-2">
            <div className="skeleton h-4 w-full rounded" />
            <div className="skeleton h-4 w-full rounded" />
            <div className="skeleton h-4 w-3/4 rounded" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="skeleton h-16 rounded-xl" />
            ))}
          </div>

          <div className="flex gap-3 pt-2">
            <div className="skeleton h-11 flex-1 rounded-xl" />
            <div className="skeleton h-11 flex-1 rounded-xl" />
          </div>
        </div>
      </div>

      {/* Reviews skeleton */}
      <div className="space-y-4">
        <div className="skeleton h-6 w-32 rounded" />
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="skeleton h-24 w-full rounded-xl" />
        ))}
      </div>
    </div>
  );
}
