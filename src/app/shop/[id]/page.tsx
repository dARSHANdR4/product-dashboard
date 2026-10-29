'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getProduct } from '@/api/products';
import type { Product } from '@/types';

const money = (price: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }).format(price);

export default function StoreProductDetailPage() {
  const params = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [image, setImage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    setLoading(true);
    getProduct(Number(params.id)).then((value) => {
      if (!active) return;
      setProduct(value);
      setImage(value.thumbnail || value.images?.[0] || '');
    }).catch(() => {
      if (active) setError('This product could not be found. It may have been removed.');
    }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [params.id]);

  if (loading) return <main className="min-h-screen bg-[#f7f8fa] p-5"><div className="mx-auto max-w-6xl"><div className="skeleton h-5 w-36" /><div className="mt-8 grid gap-8 md:grid-cols-2"><div className="skeleton h-96 rounded-3xl" /><div className="space-y-4"><div className="skeleton h-5 w-1/3" /><div className="skeleton h-10 w-3/4" /><div className="skeleton h-6 w-1/4" /><div className="skeleton h-24 w-full" /></div></div></div></main>;

  if (error || !product) return <main className="flex min-h-screen items-center justify-center bg-[#f7f8fa] px-5"><div className="max-w-md rounded-3xl border border-slate-200 bg-white p-8 text-center"><p className="text-lg font-bold">Product unavailable</p><p className="mt-2 text-sm text-slate-500">{error || 'This product is unavailable.'}</p><Link href="/shop" className="mt-5 inline-flex rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white">Back to catalogue</Link></div></main>;

  const images = [...new Set([product.thumbnail, ...(product.images || [])].filter(Boolean))];

  return <main className="min-h-screen bg-[#f7f8fa] text-slate-900">
    <header className="border-b border-slate-200 bg-white"><div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8"><Link href="/shop" className="text-2xl font-black tracking-tight">goods<span className="text-indigo-600">.</span></Link><Link href="/shop" className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold hover:bg-slate-50">← Browse products</Link></div></header>
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-10 lg:px-8">
      <nav aria-label="Breadcrumb" className="mb-6 text-sm text-slate-500"><Link href="/shop" className="hover:text-indigo-600">Catalogue</Link><span className="mx-2">/</span><span>{product.category.replace(/-/g, ' ')}</span><span className="mx-2">/</span><span className="text-slate-800">{product.title}</span></nav>
      <div className="grid gap-8 md:grid-cols-2 md:gap-12">
        <section>
          <div className="flex min-h-80 items-center justify-center overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 sm:min-h-[480px]"><img src={image || '/placeholder-product.svg'} alt={product.title} className="max-h-[440px] w-full object-contain" /></div>
          {images.length > 1 && <div className="mt-3 flex gap-3 overflow-x-auto">{images.map((src) => <button key={src} onClick={() => setImage(src)} aria-label="View product image" className={`flex h-20 w-20 shrink-0 items-center justify-center rounded-xl border bg-white p-2 ${image === src ? 'border-indigo-500 ring-2 ring-indigo-100' : 'border-slate-200'}`}><img src={src} alt="" className="h-full w-full object-contain" /></button>)}</div>}
        </section>
        <section className="py-1 sm:py-4">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-600">{product.brand || product.category.replace(/-/g, ' ')}</p>
          <h1 className="mt-3 text-3xl font-black leading-tight tracking-tight sm:text-4xl">{product.title}</h1>
          <div className="mt-4 flex flex-wrap items-center gap-3"><span className="text-3xl font-black">{money(product.price)}</span>{product.discountPercentage > 0 && <><span className="text-base text-slate-400 line-through">{money(product.price / (1 - product.discountPercentage / 100))}</span><span className="rounded-md bg-rose-50 px-2 py-1 text-xs font-bold text-rose-700">{Math.round(product.discountPercentage)}% off</span></>}</div>
          <div className="mt-4 flex flex-wrap items-center gap-3 text-sm"><span className="rounded-lg bg-amber-50 px-3 py-1.5 font-semibold text-amber-700">★ {Number(product.rating || 0).toFixed(1)} rating</span><span className={`rounded-lg px-3 py-1.5 font-semibold ${product.stock > 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>{product.stock > 0 ? 'In stock' : 'Currently out of stock'}</span></div>
          <div className="my-7 border-t border-slate-200" />
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500">Product description</h2>
          <p className="mt-3 whitespace-pre-line text-sm leading-7 text-slate-600">{product.description || 'No description has been provided for this product yet.'}</p>
          <div className="my-7 border-t border-slate-200" />
          <dl className="grid grid-cols-2 gap-4 text-sm"><div><dt className="text-slate-400">Category</dt><dd className="mt-1 font-semibold capitalize">{product.category.replace(/-/g, ' ')}</dd></div>{product.sku && <div><dt className="text-slate-400">SKU</dt><dd className="mt-1 font-semibold">{product.sku}</dd></div>}{product.warrantyInformation && <div><dt className="text-slate-400">Warranty</dt><dd className="mt-1 font-semibold">{product.warrantyInformation}</dd></div>}{product.shippingInformation && <div><dt className="text-slate-400">Shipping</dt><dd className="mt-1 font-semibold">{product.shippingInformation}</dd></div>}</dl>
          <Link href="/shop" className="mt-8 inline-flex w-full items-center justify-center rounded-xl bg-slate-950 px-5 py-3.5 text-sm font-bold text-white transition hover:bg-indigo-700">Continue browsing <span className="ml-2">→</span></Link>
          <p className="mt-3 text-center text-xs text-slate-400">Catalogue preview · Online checkout is not available yet.</p>
        </section>
      </div>
    </div>
    <footer className="mt-8 border-t border-slate-200 bg-white px-4 py-6 text-center text-xs text-slate-500">goods. · Product information is subject to change.</footer>
  </main>;
}
