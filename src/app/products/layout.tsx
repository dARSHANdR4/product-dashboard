'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { ProductsProvider } from '@/context/ProductsContext';
import Navbar from '@/components/layout/Navbar';

import { getToken } from '@/lib/auth';

/**
 * Route guard for all /products/* pages.
 * Redirects unauthenticated users to /login.
 * Wraps authenticated content with ProductsProvider.
 */
export default function ProductsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, isLoading } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();

  useEffect(() => {
    // Also check getToken() synchronously to prevent race conditions 
    // where router.replace happens before AuthContext state fully flushes.
    if (!isLoading && !isAuthenticated && !getToken()) {
      showToast('Please sign in to continue', 'info');
      router.replace('/login');
    }
  }, [isAuthenticated, isLoading, router, showToast]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg animate-pulse">
            <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
          <p className="text-sm text-slate-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated && !getToken()) return null;

  return (
    <ProductsProvider onToast={showToast}>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-200">
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>
      </div>
    </ProductsProvider>
  );
}
