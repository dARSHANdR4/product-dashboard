# Persistent product backend setup

The dashboard includes Next.js API routes backed by PostgreSQL through Supabase PostgREST. Product screens can keep their existing DummyJSON-shaped responses and switch to the database API through one environment flag.

## Configure Supabase

Create a Supabase project, then set these environment variables in local `.env.local` and in Vercel's encrypted Environment Variables. Never commit real credentials or expose the service-role key through a `NEXT_PUBLIC_*` variable.

- `SUPABASE_URL`: project URL.
- `SUPABASE_SERVICE_ROLE_KEY`: server-only service role key.
- `NEXT_PUBLIC_PRODUCT_API_MODE=database`: switches product API requests to this app's `/api/products` routes.

Leave the mode unset to keep the current DummyJSON product demo until database setup is complete.

## Create the products table

Run `supabase/migrations/202610260001_products.sql` in the Supabase SQL Editor. The migration creates the product table, constraints, indexes and updated-at trigger. Row-level security is enabled. The service-role key is only used server-side.

## Import the initial catalogue

The new table starts empty. Before switching the app:
1. Fetch `https://dummyjson.com/products?limit=0`.
2. Import those product objects into `public.products`; omit remote IDs so PostgreSQL generates its own IDs.
3. Ensure each SKU is unique. Generate one for missing or duplicate SKUs.
4. Verify row count and spot-check records before enabling database mode.

Do not add a public seed endpoint.

## Authentication and API behaviour

Login remains on DummyJSON to avoid breaking the current login screen. Mutating endpoints validate the existing bearer token before writing to the database. Reads are public, matching the current demo's catalogue experience. Product changes are stored in PostgreSQL, so refreshes and later sessions read the saved records.

## Rollout checklist

Verify list/search/category/detail, add, edit, delete, bulk delete, pagination, sorting, invalid inputs, and persistence after refresh. The deployment is not connected until the migration and import have run and the server-side environment variables are configured. Keep the mode unset until those steps are complete.
