import { dbRequest, jsonError, normalizeProduct, queryOptions, requireUser, toProduct } from '@/lib/server-products';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const { limit, skip, sortBy, order } = queryOptions(url);
    const q = url.searchParams.get('q')?.trim();
    const category = url.searchParams.get('category')?.trim();
    const filters = [`order=${encodeURIComponent(sortBy)}.${order}`, `limit=${limit}`, `offset=${skip}`, 'select=*'];
    if (q) filters.push(`or=(title.ilike.*${encodeURIComponent(q)}*,description.ilike.*${encodeURIComponent(q)}*,brand.ilike.*${encodeURIComponent(q)}*)`);
    if (category) filters.push(`category=eq.${encodeURIComponent(category)}`);
    const rows = await dbRequest<Record<string, unknown>[]>(`?${filters.join('&')}`, {
      headers: { Prefer: 'count=exact' },
    });
    // Count is returned in Content-Range by PostgREST, so use a separate exact count request.
    const countFilters = ['select=id'];
    if (q) countFilters.push(`or=(title.ilike.*${encodeURIComponent(q)}*,description.ilike.*${encodeURIComponent(q)}*,brand.ilike.*${encodeURIComponent(q)}*)`);
    if (category) countFilters.push(`category=eq.${encodeURIComponent(category)}`);
    const allMatching = await dbRequest<Record<string, unknown>[]>(`?${countFilters.join('&')}`);
    return Response.json({ products: rows.map(toProduct), total: allMatching.length, skip, limit });
  } catch (error) { return jsonError(error); }
}

export async function POST(request: Request) {
  try {
    await requireUser(request);
    const body = await request.json();
    const product = normalizeProduct(body);
    const rows = await dbRequest<Record<string, unknown>[]>('', { method: 'POST', body: JSON.stringify(product) });
    return Response.json(toProduct(rows[0]), { status: 201 });
  } catch (error) { return jsonError(error); }
}
