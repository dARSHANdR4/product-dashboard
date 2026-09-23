'use client';

import React from 'react';

interface Props {
  page: number;
  limit: number;
  total: number;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
}

export default function Pagination({ page, limit, total, onPageChange, onLimitChange }: Props) {
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const start = Math.min((page - 1) * limit + 1, total);
  const end = Math.min(page * limit, total);

  // Generate page numbers with ellipsis
  const getPageNumbers = (): (number | '...')[] => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    const pages: (number | '...')[] = [1];
    if (page > 3) pages.push('...');
    for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) {
      pages.push(i);
    }
    if (page < totalPages - 2) pages.push('...');
    pages.push(totalPages);
    return pages;
  };

  const PageBtn = ({ p }: { p: number | '...' }) => {
    if (p === '...') {
      return <span className="px-2 text-slate-400 dark:text-slate-500 text-sm select-none">…</span>;
    }
    const isActive = p === page;
    return (
      <button
        id={`page-btn-${p}`}
        onClick={() => onPageChange(p as number)}
        disabled={isActive}
        aria-label={`Go to page ${p}`}
        aria-current={isActive ? 'page' : undefined}
        className={`
          w-9 h-9 rounded-lg text-sm font-medium transition-all duration-150
          ${isActive
            ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/30 cursor-default'
            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white'
          }
        `}
      >
        {p}
      </button>
    );
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4">
      {/* Showing X–Y of Z */}
      <div className="flex items-center gap-3">
        <p className="text-sm text-slate-500 dark:text-slate-400" aria-live="polite">
          {total === 0 ? 'No results' : `Showing ${start}–${end} of ${total.toLocaleString()}`}
        </p>
        {/* Page size selector */}
        <select
          id="page-size-select"
          value={limit}
          onChange={(e) => onLimitChange(Number(e.target.value))}
          className="text-sm border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1.5 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label="Items per page"
        >
          <option value={10}>10 / page</option>
          <option value={20}>20 / page</option>
          <option value={50}>50 / page</option>
        </select>
      </div>

      {/* Page navigation */}
      <nav aria-label="Pagination" className="flex items-center gap-1">
        {/* Previous */}
        <button
          id="prev-page-btn"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          aria-label="Previous page"
          className="
            flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium
            text-slate-600 dark:text-slate-400
            hover:bg-slate-100 dark:hover:bg-slate-700
            hover:text-slate-900 dark:hover:text-white
            disabled:opacity-40 disabled:cursor-not-allowed
            transition-all duration-150
          "
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          <span className="hidden sm:inline">Prev</span>
        </button>

        {/* Page numbers */}
        <div className="flex items-center gap-0.5">
          {getPageNumbers().map((p, i) => (
            <PageBtn key={`${p}-${i}`} p={p} />
          ))}
        </div>

        {/* Next */}
        <button
          id="next-page-btn"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          aria-label="Next page"
          className="
            flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium
            text-slate-600 dark:text-slate-400
            hover:bg-slate-100 dark:hover:bg-slate-700
            hover:text-slate-900 dark:hover:text-white
            disabled:opacity-40 disabled:cursor-not-allowed
            transition-all duration-150
          "
        >
          <span className="hidden sm:inline">Next</span>
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </nav>
    </div>
  );
}
