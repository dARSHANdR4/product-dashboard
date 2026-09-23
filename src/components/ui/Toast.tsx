'use client';

import React, { useEffect, useState } from 'react';
import { useToast } from '@/context/ToastContext';
import type { Toast as ToastType } from '@/types';

const ICONS = {
  success: (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  error: (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  info: (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  warning: (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
  ),
};

const STYLES = {
  success: 'border-l-4 border-emerald-500 bg-white dark:bg-slate-800 text-emerald-700 dark:text-emerald-400',
  error:   'border-l-4 border-red-500   bg-white dark:bg-slate-800 text-red-700   dark:text-red-400',
  info:    'border-l-4 border-blue-500   bg-white dark:bg-slate-800 text-blue-700   dark:text-blue-400',
  warning: 'border-l-4 border-amber-500  bg-white dark:bg-slate-800 text-amber-700  dark:text-amber-400',
};

function ToastItem({ toast }: { toast: ToastType }) {
  const { dismissToast } = useToast();
  const [exiting, setExiting] = useState(false);

  const handleDismiss = () => {
    setExiting(true);
    setTimeout(() => dismissToast(toast.id), 250);
  };

  // Progress bar
  const [progress, setProgress] = useState(100);
  useEffect(() => {
    const start = Date.now();
    const duration = 3500;
    const interval = setInterval(() => {
      const elapsed = Date.now() - start;
      const pct = Math.max(0, 100 - (elapsed / duration) * 100);
      setProgress(pct);
      if (pct === 0) clearInterval(interval);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      role="alert"
      aria-live="polite"
      className={`
        relative flex items-start gap-3 rounded-lg shadow-lg px-4 py-3 min-w-[280px] max-w-sm
        overflow-hidden cursor-pointer select-none
        ${STYLES[toast.type]}
        ${exiting ? 'toast-exit' : 'toast-enter'}
      `}
      onClick={handleDismiss}
    >
      <span className="mt-0.5 shrink-0">{ICONS[toast.type]}</span>
      <p className="flex-1 text-sm font-medium leading-5">{toast.message}</p>
      <button
        onClick={(e) => { e.stopPropagation(); handleDismiss(); }}
        className="shrink-0 opacity-60 hover:opacity-100 transition-opacity"
        aria-label="Dismiss notification"
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
      {/* Progress bar */}
      <div className="absolute bottom-0 left-0 h-0.5 bg-current opacity-30 transition-all duration-50 ease-linear"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}

export default ToastItem;
