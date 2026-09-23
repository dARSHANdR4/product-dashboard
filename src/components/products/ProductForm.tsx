'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useProducts } from '@/context/ProductsContext';
import { useToast } from '@/context/ToastContext';
import type { Product, ProductFormData } from '@/types';

interface Props {
  initialData?: Product;
  isEdit?: boolean;
}

export default function ProductForm({ initialData, isEdit }: Props) {
  const router = useRouter();
  const { localAdd, optimisticEdit } = useProducts();
  const { showToast } = useToast();

  const [formData, setFormData] = useState<ProductFormData>({
    title: initialData?.title || '',
    description: initialData?.description || '',
    category: initialData?.category || 'smartphones',
    price: initialData?.price?.toString() || '',
    stock: initialData?.stock?.toString() || '0',
    brand: initialData?.brand || '',
    discountPercentage: initialData?.discountPercentage?.toString() || '0',
    thumbnail: initialData?.thumbnail || '',
  });

  const [errors, setErrors] = useState<Partial<Record<keyof ProductFormData, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof ProductFormData, string>> = {};

    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    
    const price = Number(formData.price);
    if (!formData.price || isNaN(price) || price <= 0) {
      newErrors.price = 'Price must be greater than 0';
    }
    
    const stock = Number(formData.stock);
    if (!formData.stock || isNaN(stock) || stock < 0) {
      newErrors.stock = 'Stock must be 0 or greater';
    }
    
    const discount = Number(formData.discountPercentage);
    if (isNaN(discount) || discount < 0 || discount > 100) {
      newErrors.discountPercentage = 'Discount must be between 0 and 100';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when user types
    if (errors[name as keyof ProductFormData]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      showToast('Please fix the errors in the form', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        price: Number(formData.price),
        stock: Number(formData.stock),
        brand: formData.brand,
        discountPercentage: Number(formData.discountPercentage),
        thumbnail: formData.thumbnail || 'https://cdn.dummyjson.com/product-images/1/thumbnail.jpg',
      };

      if (isEdit && initialData) {
        await optimisticEdit(initialData.id, payload);
        // Toast is handled inside ProductsContext for optimisticEdit
        router.push(`/products/${initialData.id}`);
      } else {
        const newProduct = await localAdd(payload);
        showToast('Product added successfully', 'success');
        router.push(`/products/${newProduct.id}`);
      }
    } catch (err) {
      const msg = (err as any)?.message || 'An error occurred while saving';
      showToast(msg, 'error');
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl fade-up bg-white dark:bg-slate-800 rounded-2xl p-6 md:p-8 border border-slate-200 dark:border-slate-700 shadow-sm">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Title */}
        <div className="md:col-span-2 space-y-2">
          <label htmlFor="title" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
            Product Title <span className="text-red-500">*</span>
          </label>
          <input
            id="title"
            name="title"
            type="text"
            value={formData.title}
            onChange={handleChange}
            placeholder="e.g. iPhone 15 Pro"
            className={`w-full px-4 py-2.5 rounded-xl border bg-white dark:bg-slate-900 text-slate-900 dark:text-white transition-colors focus:outline-none focus:ring-2 ${
              errors.title ? 'border-red-500 focus:ring-red-500' : 'border-slate-200 dark:border-slate-700 focus:ring-blue-500'
            }`}
          />
          {errors.title && <p className="text-sm text-red-500">{errors.title}</p>}
        </div>

        {/* Description */}
        <div className="md:col-span-2 space-y-2">
          <label htmlFor="description" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
            Description <span className="text-red-500">*</span>
          </label>
          <textarea
            id="description"
            name="description"
            rows={4}
            value={formData.description}
            onChange={handleChange}
            placeholder="Detailed description of the product..."
            className={`w-full px-4 py-2.5 rounded-xl border bg-white dark:bg-slate-900 text-slate-900 dark:text-white transition-colors focus:outline-none focus:ring-2 ${
              errors.description ? 'border-red-500 focus:ring-red-500' : 'border-slate-200 dark:border-slate-700 focus:ring-blue-500'
            }`}
          />
          {errors.description && <p className="text-sm text-red-500">{errors.description}</p>}
        </div>

        {/* Category */}
        <div className="space-y-2">
          <label htmlFor="category" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
            Category
          </label>
          <select
            id="category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
          >
            <option value="smartphones">Smartphones</option>
            <option value="laptops">Laptops</option>
            <option value="fragrances">Fragrances</option>
            <option value="skincare">Skincare</option>
            <option value="groceries">Groceries</option>
            <option value="home-decoration">Home Decoration</option>
            <option value="furniture">Furniture</option>
          </select>
        </div>

        {/* Brand */}
        <div className="space-y-2">
          <label htmlFor="brand" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
            Brand
          </label>
          <input
            id="brand"
            name="brand"
            type="text"
            value={formData.brand}
            onChange={handleChange}
            placeholder="e.g. Apple"
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Price */}
        <div className="space-y-2">
          <label htmlFor="price" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
            Price ($) <span className="text-red-500">*</span>
          </label>
          <input
            id="price"
            name="price"
            type="number"
            step="0.01"
            value={formData.price}
            onChange={handleChange}
            className={`w-full px-4 py-2.5 rounded-xl border bg-white dark:bg-slate-900 text-slate-900 dark:text-white transition-colors focus:outline-none focus:ring-2 ${
              errors.price ? 'border-red-500 focus:ring-red-500' : 'border-slate-200 dark:border-slate-700 focus:ring-blue-500'
            }`}
          />
          {errors.price && <p className="text-sm text-red-500">{errors.price}</p>}
        </div>

        {/* Stock */}
        <div className="space-y-2">
          <label htmlFor="stock" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
            Stock <span className="text-red-500">*</span>
          </label>
          <input
            id="stock"
            name="stock"
            type="number"
            step="1"
            value={formData.stock}
            onChange={handleChange}
            className={`w-full px-4 py-2.5 rounded-xl border bg-white dark:bg-slate-900 text-slate-900 dark:text-white transition-colors focus:outline-none focus:ring-2 ${
              errors.stock ? 'border-red-500 focus:ring-red-500' : 'border-slate-200 dark:border-slate-700 focus:ring-blue-500'
            }`}
          />
          {errors.stock && <p className="text-sm text-red-500">{errors.stock}</p>}
        </div>

        {/* Discount */}
        <div className="space-y-2">
          <label htmlFor="discountPercentage" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
            Discount (%)
          </label>
          <input
            id="discountPercentage"
            name="discountPercentage"
            type="number"
            step="0.1"
            value={formData.discountPercentage}
            onChange={handleChange}
            className={`w-full px-4 py-2.5 rounded-xl border bg-white dark:bg-slate-900 text-slate-900 dark:text-white transition-colors focus:outline-none focus:ring-2 ${
              errors.discountPercentage ? 'border-red-500 focus:ring-red-500' : 'border-slate-200 dark:border-slate-700 focus:ring-blue-500'
            }`}
          />
          {errors.discountPercentage && <p className="text-sm text-red-500">{errors.discountPercentage}</p>}
        </div>

        {/* Thumbnail URL */}
        <div className="md:col-span-2 space-y-2">
          <label htmlFor="thumbnail" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
            Thumbnail URL
          </label>
          <input
            id="thumbnail"
            name="thumbnail"
            type="url"
            value={formData.thumbnail}
            onChange={handleChange}
            placeholder="https://example.com/image.jpg"
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="flex items-center gap-4 pt-4 border-t border-slate-100 dark:border-slate-700">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-5 py-2.5 rounded-xl text-sm font-medium border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
        >
          Cancel
        </button>
        <button
          id="submit-product-btn"
          type="submit"
          disabled={isSubmitting}
          className="flex-1 flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/20 disabled:opacity-50"
        >
          {isSubmitting ? (
            <>
              <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Saving...
            </>
          ) : (
            isEdit ? 'Save Changes' : 'Add Product'
          )}
        </button>
      </div>
    </form>
  );
}
