'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { getProduct } from '@/api/products';
import { useProducts } from '@/context/ProductsContext';
import ImageCarousel from '@/components/products/ImageCarousel';
import ProductDetailSkeleton from '@/components/products/ProductDetailSkeleton';
import ProductNotFound from '@/components/products/ProductNotFound';
import DeleteModal from '@/components/products/DeleteModal';
import { useRouter } from 'next/navigation';
import { useToast } from '@/context/ToastContext';
import type { Product } from '@/types';

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg
          key={i}
          className={`w-4 h-4 ${i < Math.round(rating) ? 'text-amber-400' : 'text-slate-200 dark:text-slate-700'}`}
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
      <span className="ml-1 text-sm font-medium text-slate-600 dark:text-slate-400">{rating.toFixed(1)}</span>
    </div>
  );
}

export default function ProductDetailPage() {
  const params = useParams();
  const rawId = params.id as string;
  const router = useRouter();
  const { showToast } = useToast();
  const { optimisticDelete, products } = useProducts();

  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const id = parseInt(rawId, 10);
  const isValidId = !isNaN(id) && id > 0;

  useEffect(() => {
    if (!isValidId) {
      setNotFound(true);
      setIsLoading(false);
      return;
    }

    // Check local context first (might have been edited during the session)
    const localProduct = products.find((p) => p.id === id);
    if (localProduct) {
      setProduct(localProduct);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    getProduct(id)
      .then((p) => { setProduct(p); setIsLoading(false); })
      .catch(() => { setNotFound(true); setIsLoading(false); });
  }, [id, isValidId, products]);

  const handleDelete = async () => {
    setShowDeleteModal(false);
    await optimisticDelete(id);
    showToast('Product deleted', 'success');
    router.push('/products');
  };

  if (isLoading) return <ProductDetailSkeleton />;
  if (notFound || !product) return <ProductNotFound id={rawId} />;

  const discountedPrice = product.price * (1 - product.discountPercentage / 100);

  return (
    <div className="space-y-8 fade-up">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm">
        <Link href="/products" className="text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
          Products
        </Link>
        <svg className="w-4 h-4 text-slate-300 dark:text-slate-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
        <span className="text-slate-700 dark:text-slate-300 font-medium line-clamp-1">{product.title}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left: images */}
        <ImageCarousel images={product.images} title={product.title} />

        {/* Right: details */}
        <div className="space-y-5">
          {/* Category + SKU */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 capitalize">
              {product.category.replace(/-/g, ' ')}
            </span>
            {product.brand && (
              <span className="text-xs text-slate-400 dark:text-slate-500">by {product.brand}</span>
            )}
            {product._isLocal && (
              <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400">
                Locally added
              </span>
            )}
          </div>

          <h1 className="text-2xl font-bold text-slate-900 dark:text-white leading-tight">{product.title}</h1>

          {/* Rating */}
          <div className="flex items-center gap-3">
            <StarRating rating={product.rating} />
            <span className="text-sm text-slate-400">({product.reviews?.length ?? 0} reviews)</span>
          </div>

          {/* Price */}
          <div className="flex items-center gap-3">
            {product.discountPercentage > 0 ? (
              <>
                <span className="text-3xl font-black text-slate-900 dark:text-white">
                  ${discountedPrice.toFixed(2)}
                </span>
                <span className="text-lg text-slate-400 line-through">${product.price.toFixed(2)}</span>
                <span className="px-2 py-0.5 rounded-full text-sm font-semibold bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400">
                  -{product.discountPercentage.toFixed(0)}%
                </span>
              </>
            ) : (
              <span className="text-3xl font-black text-slate-900 dark:text-white">
                ${product.price.toFixed(2)}
              </span>
            )}
          </div>

          <hr className="border-slate-100 dark:border-slate-700" />

          {/* Description */}
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{product.description}</p>

          {/* Info grid */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Stock', value: product.stock === 0 ? 'Out of stock' : `${product.stock} units`, color: product.stock === 0 ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400' },
              { label: 'SKU', value: product.sku || 'N/A', color: '' },
              { label: 'Warranty', value: product.warrantyInformation || 'N/A', color: '' },
              { label: 'Shipping', value: product.shippingInformation || 'N/A', color: '' },
            ].map((item) => (
              <div key={item.label} className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3 border border-slate-100 dark:border-slate-700">
                <p className="text-xs font-medium text-slate-400 dark:text-slate-500 mb-1">{item.label}</p>
                <p className={`text-sm font-semibold ${item.color || 'text-slate-700 dark:text-slate-300'}`}>{item.value}</p>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Link
              href={`/products/${id}/edit`}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/20"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Edit product
            </Link>
            <button
              id="detail-delete-btn"
              onClick={() => setShowDeleteModal(true)}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Delete
            </button>
          </div>
        </div>
      </div>

      {/* Reviews */}
      {product.reviews && product.reviews.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            Customer Reviews
            <span className="ml-2 text-sm font-normal text-slate-400">({product.reviews.length})</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {product.reviews.map((review, i) => (
              <div key={i} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-white text-sm">{review.reviewerName}</p>
                    <p className="text-xs text-slate-400">{new Date(review.date).toLocaleDateString()}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, j) => (
                      <svg key={j} className={`w-3.5 h-3.5 ${j < review.rating ? 'text-amber-400' : 'text-slate-200 dark:text-slate-600'}`} viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                      </svg>
                    ))}
                  </div>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{review.comment}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {showDeleteModal && (
        <DeleteModal
          productTitle={product.title}
          onConfirm={handleDelete}
          onCancel={() => setShowDeleteModal(false)}
        />
      )}
    </div>
  );
}
