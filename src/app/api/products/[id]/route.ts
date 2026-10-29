import { ApiFailure, dbRequest, jsonError, normalizeProduct, requireUser, toProduct } from '@/lib/server-products';
import { parseProductId } from '@/lib/product-validation.mjs';

type Context = { params: Promise<{ id: string }> };
function productId(raw: string): number {
  const id = parseProductId(raw);
  if (id === null) throw new ApiFailure(400, 'Invalid product ID');
  return id;
}

export async function GET(_request: Request, context: Context) {
  try {
    const id = productId((await context.params).id);
    const rows = await dbRequest<Record<string, unknown>[]>(`?id=eq.${id}&limit=1`);
    if (!rows[0]) throw new ApiFailure(404, 'Product not found');
    return Response.json(toProduct(rows[0]));
  } catch (error) { return jsonError(error); }
}

export async function PUT(request: Request, context: Context) {
  try {
    await requireUser(request);
    const id = productId((await context.params).id);
    const body = await request.json();
    const existing = await dbRequest<Record<string, unknown>[]>(`?id=eq.${id}&limit=1`);
    if (!existing[0]) throw new ApiFailure(404, 'Product not found');
    const current = toProduct(existing[0]);
    const merged = normalizeProduct({ ...current, ...body, id });
    const rows = await dbRequest<Record<string, unknown>[]>(`?id=eq.${id}`, { method: 'PATCH', body: JSON.stringify(merged) });
    if (!rows[0]) throw new ApiFailure(404, 'Product not found');
    return Response.json(toProduct(rows[0]));
  } catch (error) { return jsonError(error); }
}

export async function DELETE(request: Request, context: Context) {
  try {
    await requireUser(request);
    const id = productId((await context.params).id);
    const rows = await dbRequest<Record<string, unknown>[]>(`?id=eq.${id}`, { method: 'DELETE' });
    if (!rows[0]) throw new ApiFailure(404, 'Product not found');
    return Response.json({ isDeleted: true, deletedOn: new Date().toISOString() });
  } catch (error) { return jsonError(error); }
}
