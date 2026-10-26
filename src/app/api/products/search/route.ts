import { jsonError } from '@/lib/server-products';
import { GET as listProducts } from '../route';

export async function GET(request: Request) {
  const url = new URL(request.url);
  if (!url.searchParams.get('q')?.trim()) return Response.json({ message: 'Search query q is required' }, { status: 400 });
  const target = new URL('/api/products', url.origin);
  for (const [key, value] of url.searchParams) target.searchParams.set(key, value);
  try { return await listProducts(new Request(target, { headers: request.headers })); }
  catch (error) { return jsonError(error); }
}
