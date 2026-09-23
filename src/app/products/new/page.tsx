import type { Metadata } from 'next';
import ProductForm from '@/components/products/ProductForm';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Add Product',
  description: 'Add a new product to the inventory.',
};

export default function NewProductPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm fade-up">
        <Link href="/products" className="text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
          Products
        </Link>
        <svg className="w-4 h-4 text-slate-300 dark:text-slate-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
        <span className="text-slate-700 dark:text-slate-300 font-medium">Add Product</span>
      </nav>

      <div className="fade-up" style={{ animationDelay: '50ms' }}>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Add New Product</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Fill in the details below to add a product to the catalog.</p>
      </div>

      <ProductForm isEdit={false} />
    </div>
  );
}
