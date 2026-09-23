'use client';

import React from 'react';
import type { SortField, SortOrder } from '@/types';

interface Props {
  categories: string[];
  selectedCategory: string;
  onCategoryChange: (cat: string) => void;
  sortBy: SortField | '';
  sortOrder: SortOrder;
  onSortChange: (field: SortField | '', order: SortOrder) => void;
  isLoading?: boolean;
}

const SORT_OPTIONS: { value: SortField | ''; label: string }[] = [
  { value: '', label: 'Default order' },
  { value: 'price', label: 'Price' },
  { value: 'rating', label: 'Rating' },
  { value: 'title', label: 'Title (A-Z)' },
];

export default function FilterSort({
  categories,
  selectedCategory,
  onCategoryChange,
  sortBy,
  sortOrder,
  onSortChange,
}: Props) {
  const handleSortFieldChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value as SortField | '';
    onSortChange(val, sortOrder);
  };

  const handleSortOrderToggle = () => {
    onSortChange(sortBy, sortOrder === 'asc' ? 'desc' : 'asc');
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Category filter */}
      <div className="relative">
        <select
          id="category-filter"
          value={selectedCategory}
          onChange={(e) => onCategoryChange(e.target.value)}
          aria-label="Filter by category"
          className="
            appearance-none pl-9 pr-8 py-2.5 rounded-xl text-sm
            bg-white dark:bg-slate-800
            border border-slate-200 dark:border-slate-700
            text-slate-700 dark:text-slate-300
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
            transition-all duration-200 cursor-pointer
            min-w-[160px]
          "
        >
          <option value="">All categories</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
            </option>
          ))}
        </select>
        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
          <svg className="w-4 h-4 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
        </div>
        <div className="absolute inset-y-0 right-2 flex items-center pointer-events-none">
          <svg className="w-4 h-4 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {/* Sort field */}
      <div className="relative">
        <select
          id="sort-select"
          value={sortBy}
          onChange={handleSortFieldChange}
          aria-label="Sort by"
          className="
            appearance-none pl-9 pr-8 py-2.5 rounded-xl text-sm
            bg-white dark:bg-slate-800
            border border-slate-200 dark:border-slate-700
            text-slate-700 dark:text-slate-300
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
            transition-all duration-200 cursor-pointer
            min-w-[140px]
          "
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
          <svg className="w-4 h-4 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 7h18M6 12h12M9 17h6" />
          </svg>
        </div>
        <div className="absolute inset-y-0 right-2 flex items-center pointer-events-none">
          <svg className="w-4 h-4 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {/* Sort order toggle */}
      {sortBy && (
        <button
          id="sort-order-btn"
          onClick={handleSortOrderToggle}
          title={sortOrder === 'asc' ? 'Sort descending' : 'Sort ascending'}
          aria-label={sortOrder === 'asc' ? 'Currently ascending, click for descending' : 'Currently descending, click for ascending'}
          className="
            flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-sm font-medium
            bg-white dark:bg-slate-800
            border border-slate-200 dark:border-slate-700
            text-slate-700 dark:text-slate-300
            hover:bg-slate-50 dark:hover:bg-slate-700
            focus:outline-none focus:ring-2 focus:ring-blue-500
            transition-all duration-200
          "
        >
          {sortOrder === 'asc' ? (
            <>
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 4h13M3 8h9M3 12h5m8 0l4-4m0 0l4 4m-4-4v12" />
              </svg>
              Asc
            </>
          ) : (
            <>
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 4h13M3 8h9M3 12h5m8 4l4 4m0 0l4-4m-4 4V8" />
              </svg>
              Desc
            </>
          )}
        </button>
      )}

      {/* Active filter badges */}
      {selectedCategory && (
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
          <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          {selectedCategory.replace(/-/g, ' ')}
        </span>
      )}
    </div>
  );
}
