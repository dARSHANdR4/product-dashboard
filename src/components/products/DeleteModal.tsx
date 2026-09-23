'use client';

import React from 'react';

interface Props {
  productTitle: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function DeleteModal({ productTitle, onConfirm, onCancel }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-6 w-full max-w-sm border border-slate-200 dark:border-slate-700 fade-up">
        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 mx-auto mb-4">
          <svg className="w-6 h-6 text-red-600 dark:text-red-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>

        <h3 className="text-lg font-bold text-slate-900 dark:text-white text-center mb-2">
          Delete product?
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 text-center mb-1">
          You are about to delete:
        </p>
        <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 text-center mb-5 line-clamp-2">
          &ldquo;{productTitle}&rdquo;
        </p>
        <p className="text-xs text-slate-400 text-center mb-5">This action cannot be undone.</p>

        <div className="flex gap-3">
          <button
            id="cancel-delete-btn"
            onClick={onCancel}
            className="flex-1 py-2.5 px-4 rounded-xl text-sm font-medium border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
          >
            Cancel
          </button>
          <button
            id="confirm-delete-btn"
            onClick={onConfirm}
            className="flex-1 py-2.5 px-4 rounded-xl text-sm font-medium bg-red-500 hover:bg-red-600 text-white transition-colors shadow-lg shadow-red-500/20"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
