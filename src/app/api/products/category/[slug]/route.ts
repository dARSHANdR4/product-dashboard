import { GET as listProducts } from '../../route';

export async function GET(request: Request, context: { params: Promise<{ slug: string }> }) {
  const { slug } = await context.params;
  const url = new URL(request.url);
  url.searchParams.set('category', slug);
  return listProducts(new Request(url, { headers: request.headers }));
}
