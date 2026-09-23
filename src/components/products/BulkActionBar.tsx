'use client';

import React, { useState } from 'react';
import { useProducts } from '@/context/ProductsContext';
import { useToast } from '@/context/ToastContext';

export default function BulkActionBar() {
  const { selectedIds, clearSelection, products, bulkOptimisticDelete } = useProducts();
  const { showToast } = useToast();
  const [showConfirm, setShowConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const count = selectedIds.size;
  if (count === 0) return null;

  const selectedTitles = products
    .filter((p) => selectedIds.has(p.id))
    .map((p) => p.title)
    .slice(0, 5);

  const handleBulkDelete = async () => {
    setIsDeleting(true);
    setShowConfirm(false);
    const ids = Array.from(selectedIds);
    clearSelection();

    const { succeeded, failed } = await bulkOptimisticDelete(ids);

    if (failed.length === 0) {
      showToast(`${succeeded.length} product${succeeded.length !== 1 ? 's' : ''} deleted`, 'success');
    } else if (succeeded.length === 0) {
      showToast(`Delete failed — all ${failed.length} products restored`, 'error');
    } else {
      showToast(
        `${succeeded.length} of ${ids.length} deleted, ${failed.length} failed and restored`,
        'warning'
      );
    }
    setIsDeleting(false);
  };

  return (
    <>
      {/* Floating action bar */}
      <div className="
        sticky top-20 z-30 mb-4 mx-auto
        flex items-center justify-between gap-4
        px-4 py-3 rounded-2xl
        bg-slate-900 dark:bg-slate-700
        shadow-xl shadow-slate-900/20
        border border-slate-700 dark:border-slate-600
        text-white fade-up
      ">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-full bg-blue-500 flex items-center justify-center text-sm font-bold">
            {count}
          </div>
          <span className="text-sm font-medium">
            {count} item{count !== 1 ? 's' : ''} selected
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={clearSelection}
            className="px-3 py-1.5 rounded-lg text-sm text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
          >
            Clear
          </button>
          <button
            id="bulk-delete-btn"
            onClick={() => setShowConfirm(true)}
            disabled={isDeleting}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-red-500 hover:bg-red-600 text-white transition-colors disabled:opacity-50"
          >
            {isDeleting ? (
              <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            ) : (
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            )}
            Delete selected
          </button>
        </div>
      </div>

      {/* Confirm modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowConfirm(false)} />
          <div className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-6 w-full max-w-sm border border-slate-200 dark:border-slate-700 fade-up">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 mx-auto mb-4">
              <svg className="w-6 h-6 text-red-600 dark:text-red-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white text-center mb-1">
              Delete {count} product{count !== 1 ? 's' : ''}?
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 text-center mb-4">
              This action cannot be undone.
            </p>
            {selectedTitles.length > 0 && (
              <ul className="mb-4 space-y-1">
                {selectedTitles.map((title, i) => (
                  <li key={i} className="text-sm text-slate-600 dark:text-slate-400 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" />
                    <span className="truncate">{title}</span>
                  </li>
                ))}
                {count > 5 && (
                  <li className="text-sm text-slate-400 dark:text-slate-500 pl-3.5">
                    ...and {count - 5} more
                  </li>
                )}
              </ul>
            )}
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 py-2.5 px-4 rounded-xl text-sm font-medium border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
              >
                Cancel
              </button>
              <button
                id="confirm-bulk-delete-btn"
                onClick={handleBulkDelete}
                className="flex-1 py-2.5 px-4 rounded-xl text-sm font-medium bg-red-500 hover:bg-red-600 text-white transition-colors"
              >
                Delete {count}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
