import { dbRequest, jsonError } from '@/lib/server-products';

export async function GET() {
  try {
    const rows = await dbRequest<{ category: string }[]>('?select=category&order=category.asc');
    const unique = [...new Set(rows.map((row) => row.category).filter(Boolean))];
    return Response.json(unique.map((name) => ({
      slug: name,
      name: name.replace(/-/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase()),
      url: `/api/products/category/${encodeURIComponent(name)}`,
    })));
  } catch (error) { return jsonError(error); }
}
