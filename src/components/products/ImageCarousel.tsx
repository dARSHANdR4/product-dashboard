'use client';

import React, { useState, useCallback } from 'react';

interface Props {
  images: string[];
  title: string;
}

export default function ImageCarousel({ images, title }: Props) {
  const [current, setCurrent] = useState(0);
  const validImages = images.filter(Boolean);
  const total = validImages.length;

  const prev = useCallback(() => setCurrent((c) => (c - 1 + total) % total), [total]);
  const next = useCallback(() => setCurrent((c) => (c + 1) % total), [total]);

  if (total === 0) {
    return (
      <div className="aspect-square bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center">
        <svg className="w-16 h-16 text-slate-300 dark:text-slate-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1}>
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <path d="M21 15l-5-5L5 21" />
        </svg>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Main image */}
      <div className="relative aspect-square bg-slate-50 dark:bg-slate-800 rounded-2xl overflow-hidden group">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={validImages[current]}
          alt={`${title} — image ${current + 1} of ${total}`}
          className="w-full h-full object-contain transition-all duration-300"
        />

        {total > 1 && (
          <>
            {/* Nav buttons */}
            <button
              onClick={prev}
              aria-label="Previous image"
              className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 dark:bg-slate-800/90 shadow-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white dark:hover:bg-slate-700"
            >
              <svg className="w-4 h-4 text-slate-700 dark:text-slate-200" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={next}
              aria-label="Next image"
              className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 dark:bg-slate-800/90 shadow-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white dark:hover:bg-slate-700"
            >
              <svg className="w-4 h-4 text-slate-700 dark:text-slate-200" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>

            {/* Counter */}
            <div className="absolute bottom-3 right-3 px-2 py-1 rounded-full bg-black/50 text-white text-xs font-medium">
              {current + 1} / {total}
            </div>
          </>
        )}
      </div>

      {/* Thumbnails */}
      {total > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {validImages.map((img, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              aria-label={`View image ${i + 1}`}
              className={`
                shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all duration-150
                ${i === current ? 'border-blue-500 ring-2 ring-blue-500/30' : 'border-transparent hover:border-slate-300 dark:hover:border-slate-600 opacity-60 hover:opacity-100'}
              `}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img} alt={`Thumbnail ${i + 1}`} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}

      {/* Dot indicators */}
      {total > 1 && (
        <div className="flex items-center justify-center gap-1.5">
          {validImages.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              aria-label={`Go to image ${i + 1}`}
              className={`carousel-dot transition-all duration-300 ${i === current ? 'active bg-blue-500' : 'bg-slate-300 dark:bg-slate-600'}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
