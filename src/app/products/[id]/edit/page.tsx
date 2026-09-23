'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { getProduct } from '@/api/products';
import { useProducts } from '@/context/ProductsContext';
import ProductForm from '@/components/products/ProductForm';
import ProductNotFound from '@/components/products/ProductNotFound';
import type { Product } from '@/types';

export default function EditProductPage() {
  const params = useParams();
  const rawId = params.id as string;
  const { products } = useProducts();
  
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const id = parseInt(rawId, 10);
  const isValidId = !isNaN(id) && id > 0;

  useEffect(() => {
    if (!isValidId && id > 0) { // check for valid ID or local negative ID
      setNotFound(true);
      setIsLoading(false);
      return;
    }

    // Check local context first (might have been edited during the session, or it's a locally added item with negative ID)
    const localProduct = products.find((p) => p.id === id);
    if (localProduct) {
      setProduct(localProduct);
      setIsLoading(false);
      return;
    }

    if (id < 0) {
       // It's a local ID, but not in context — it must have been lost on reload
       setNotFound(true);
       setIsLoading(false);
       return;
    }

    setIsLoading(true);
    getProduct(id)
      .then((p) => { setProduct(p); setIsLoading(false); })
      .catch(() => { setNotFound(true); setIsLoading(false); });
  }, [id, isValidId, products]);

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="skeleton h-4 w-48 rounded" />
        <div className="space-y-2">
          <div className="skeleton h-8 w-64 rounded" />
          <div className="skeleton h-4 w-96 rounded" />
        </div>
        <div className="skeleton h-[600px] w-full rounded-2xl" />
      </div>
    );
  }

  if (notFound || !product) return <ProductNotFound id={rawId} />;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm fade-up">
        <Link href="/products" className="text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
          Products
        </Link>
        <svg className="w-4 h-4 text-slate-300 dark:text-slate-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
        <Link href={`/products/${id}`} className="text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors line-clamp-1 max-w-[200px]">
          {product.title}
        </Link>
        <svg className="w-4 h-4 text-slate-300 dark:text-slate-600 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
        <span className="text-slate-700 dark:text-slate-300 font-medium shrink-0">Edit</span>
      </nav>

      <div className="fade-up" style={{ animationDelay: '50ms' }}>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Edit Product</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Make changes to "{product.title}".</p>
      </div>

      <ProductForm initialData={product} isEdit={true} />
    </div>
  );
}
