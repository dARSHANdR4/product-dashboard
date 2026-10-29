'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { getCategories, getProducts, getProductsByCategory, searchProducts } from '@/api/products';
import type { Product } from '@/types';

const money = (price: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(price);
const titleCase = (value: string) => value.replace(/-/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());

function ProductImage({ product }: { product: Product }) {
  const [failed, setFailed] = useState(false);
  const src = product.thumbnail || product.images?.[0];
  if (!src || failed) return <div className="flex h-full min-h-48 items-center justify-center bg-slate-100 text-4xl text-slate-300">▧</div>;
  return <img src={src} alt={product.title} loading="lazy" onError={() => setFailed(true)} className="h-full min-h-48 w-full object-contain p-5 transition-transform duration-300 group-hover:scale-105" />;
}

export default function StorefrontPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<{ slug: string; name: string }[]>([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [sort, setSort] = useState('featured');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getCategories().then(setCategories).catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    let active = true;
    const timer = window.setTimeout(async () => {
      setLoading(true);
      setError('');
      try {
        const options = { limit: 100, skip: 0 };
        const result = search.trim()
          ? await searchProducts({ ...options, q: search.trim() })
          : category
            ? await getProductsByCategory({ ...options, category })
            : await getProducts(options);
        if (active) setProducts(result.products);
      } catch {
        if (active) setError('We could not load products right now. Please try again.');
      } finally {
        if (active) setLoading(false);
      }
    }, search.trim() ? 250 : 0);
    return () => { active = false; window.clearTimeout(timer); };
  }, [search, category]);

  const visibleProducts = useMemo(() => {
    const list = [...products];
    if (sort === 'price-low') list.sort((a, b) => a.price - b.price);
    if (sort === 'price-high') list.sort((a, b) => b.price - a.price);
    if (sort === 'rating') list.sort((a, b) => b.rating - a.rating);
    if (sort === 'name') list.sort((a, b) => a.title.localeCompare(b.title));
    return list;
  }, [products, sort]);

  return (
    <main className="min-h-screen bg-[#f7f8fa] text-slate-900">
      <div className="bg-slate-950 px-4 py-2 text-center text-xs font-medium tracking-wide text-white sm:text-sm">
        Discover products picked for everyday life
      </div>
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/shop" className="shrink-0 text-2xl font-black tracking-tight text-slate-950">goods<span className="text-indigo-600">.</span></Link>
          <div className="order-3 w-full flex-1 sm:order-none sm:min-w-48">
            <label className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-100">
              <span aria-hidden="true" className="text-lg text-slate-400">⌕</span>
              <input aria-label="Search products" value={search} onChange={(event) => { setSearch(event.target.value); setCategory(''); }} placeholder="Search products, brands and more" className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400" />
              {search && <button onClick={() => setSearch('')} className="text-sm text-slate-500" aria-label="Clear search">✕</button>}
            </label>
          </div>
          <Link href="/login" className="ml-auto rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold hover:bg-slate-50">Admin sign in</Link>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 pb-16 pt-6 sm:px-6 lg:px-8">
        {!search && !category && (
          <section className="relative mb-8 overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-950 via-indigo-800 to-violet-700 px-6 py-10 text-white sm:px-10 sm:py-14">
            <div className="relative z-10 max-w-xl">
              <p className="mb-3 text-xs font-bold uppercase tracking-[0.22em] text-indigo-200">Your next favourite find</p>
              <h1 className="text-3xl font-black leading-tight sm:text-5xl">Good finds.<br />Better everyday.</h1>
              <p className="mt-4 max-w-md text-sm leading-6 text-indigo-100 sm:text-base">Explore the collection, discover something new, and find the right product for you.</p>
              <a href="#catalog" className="mt-7 inline-flex rounded-xl bg-white px-5 py-3 text-sm font-bold text-indigo-950 transition hover:bg-indigo-50">Explore catalogue <span className="ml-2">→</span></a>
            </div>
            <div aria-hidden="true" className="absolute -right-8 -top-16 h-64 w-64 rounded-full border-[36px] border-white/10 sm:right-12 sm:top-[-5rem] sm:h-96 sm:w-96 sm:border-[54px]" />
            <div aria-hidden="true" className="absolute bottom-[-5rem] right-24 h-52 w-52 rounded-full bg-violet-400/20 blur-2xl" />
          </section>
        )}

        <nav aria-label="Product categories" className="mb-7 flex gap-2 overflow-x-auto pb-2">
          <button onClick={() => setCategory('')} className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition ${!category ? 'bg-slate-950 text-white' : 'border border-slate-200 bg-white text-slate-600 hover:border-slate-400'}`}>All products</button>
          {categories.map((item) => <button key={item.slug} onClick={() => { setCategory(item.slug); setSearch(''); }} className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition ${category === item.slug ? 'bg-slate-950 text-white' : 'border border-slate-200 bg-white text-slate-600 hover:border-slate-400'}`}>{item.name}</button>)}
        </nav>

        <section id="catalog">
          <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-indigo-600">{category ? 'Browsing category' : search ? 'Search results' : 'The collection'}</p>
              <h2 className="mt-1 text-2xl font-black tracking-tight sm:text-3xl">{category ? titleCase(category) : search ? `Results for “${search}”` : 'Explore products'}</h2>
              {!loading && <p className="mt-1 text-sm text-slate-500">{visibleProducts.length} {visibleProducts.length === 1 ? 'product' : 'products'}</p>}
            </div>
            <label className="flex items-center gap-2 text-sm text-slate-500">Sort by
              <select value={sort} onChange={(event) => setSort(event.target.value)} className="rounded-xl border border-slate-200 bg-white px-3 py-2 font-semibold text-slate-800 outline-none focus:border-indigo-400">
                <option value="featured">Featured</option><option value="price-low">Price: low to high</option><option value="price-high">Price: high to low</option><option value="rating">Top rated</option><option value="name">Name A–Z</option>
              </select>
            </label>
          </div>

          {error ? <div role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center text-sm text-red-700">{error}<div><button onClick={() => { setSearch((value) => value + ' '); }} className="mt-3 rounded-lg bg-red-700 px-4 py-2 font-semibold text-white">Retry search</button></div></div> : loading ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4 xl:grid-cols-5">{Array.from({ length: 10 }, (_, index) => <div key={index} className="overflow-hidden rounded-2xl border border-slate-100 bg-white"><div className="skeleton h-44 sm:h-56" /><div className="space-y-3 p-4"><div className="skeleton h-3 w-1/3" /><div className="skeleton h-4 w-full" /><div className="skeleton h-4 w-1/2" /></div></div>)}</div>
          ) : visibleProducts.length ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4 xl:grid-cols-5">
              {visibleProducts.map((product) => <Link href={`/shop/${product.id}`} key={product.id} className="group overflow-hidden rounded-2xl border border-slate-200/80 bg-white transition duration-200 hover:-translate-y-1 hover:border-indigo-200 hover:shadow-xl hover:shadow-slate-200/60">
                <div className="relative flex h-44 items-center justify-center overflow-hidden bg-slate-50 sm:h-56"><ProductImage product={product} />{product.discountPercentage > 0 && <span className="absolute left-3 top-3 rounded-md bg-rose-600 px-2 py-1 text-[10px] font-bold text-white">{Math.round(product.discountPercentage)}% OFF</span>}</div>
                <div className="p-3 sm:p-4">
                  <p className="truncate text-[10px] font-bold uppercase tracking-wider text-slate-400 sm:text-xs">{product.brand || titleCase(product.category)}</p>
                  <h3 className="mt-1 line-clamp-2 min-h-10 text-sm font-semibold leading-5 text-slate-800 group-hover:text-indigo-700 sm:text-base">{product.title}</h3>
                  <div className="mt-3 flex flex-wrap items-center gap-2"><span className="text-base font-black text-slate-950 sm:text-lg">{money(product.price)}</span>{product.discountPercentage > 0 && <span className="text-xs text-slate-400 line-through">{money(product.price / (1 - product.discountPercentage / 100))}</span>}</div>
                  <div className="mt-2 flex items-center justify-between gap-2"><span className="text-xs text-amber-600">★ {Number(product.rating || 0).toFixed(1)}</span><span className={`text-[10px] font-semibold ${product.stock > 0 ? 'text-emerald-700' : 'text-rose-600'}`}>{product.stock > 0 ? 'In stock' : 'Out of stock'}</span></div>
                </div>
              </Link>)}
            </div>
          ) : <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center"><p className="text-lg font-bold">No products found</p><p className="mt-2 text-sm text-slate-500">Try another search or select a different category.</p><button onClick={() => { setSearch(''); setCategory(''); }} className="mt-5 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white">Clear filters</button></div>}
        </section>
      </div>
      <footer className="border-t border-slate-200 bg-white"><div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-7 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8"><Link href="/shop" className="text-base font-black text-slate-900">goods<span className="text-indigo-600">.</span></Link><p>Browse the catalogue · Product information is subject to change.</p><Link href="/login" className="font-semibold hover:text-indigo-600">Admin access</Link></div></footer>
    </main>
  );
}
