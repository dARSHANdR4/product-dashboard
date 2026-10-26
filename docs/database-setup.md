# Persistent product backend setup

The dashboard includes Next.js API routes backed by PostgreSQL through Supabase PostgREST. Product screens keep their existing DummyJSON-shaped responses and switch to the database API through one environment flag.

## Configure Supabase

Set these environment variables in Vercel's encrypted Environment Variables and, when running scripts locally, in your local shell. Never commit real credentials or expose the service-role key through a `NEXT_PUBLIC_*` variable.

- `SUPABASE_URL`: Supabase project URL.
- `SUPABASE_SERVICE_ROLE_KEY`: server-only Supabase secret key.
- `NEXT_PUBLIC_PRODUCT_API_MODE=database`: switches product API requests to this app's `/api/products` routes. Keep this unset until the import and tests are complete.

## Create the products table

Run `supabase/migrations/202610260001_products.sql` in the Supabase SQL Editor. The migration creates the product table, constraints, indexes and updated-at trigger. Row-level security is enabled. The secret key is only used server-side.

## Import the initial catalogue

The table starts empty. Use the repository import script; do not insert products manually and do not create a public seed endpoint.

1. Check out the `sprint-2/postgres-persistence` branch locally and install dependencies as described in the repository README.
2. Ensure Node.js is installed. The import script uses built-in Node APIs and requires no additional package.
3. In PowerShell, set the two credentials in the current terminal only, then run the script from the repository root:

   ```powershell
   $env:SUPABASE_URL = "https://YOUR_PROJECT_REF.supabase.co"
   $env:SUPABASE_SERVICE_ROLE_KEY = "PASTE_YOUR_SECRET_KEY_HERE"
   node scripts/import-dummyjson-products.mjs
   Remove-Item Env:SUPABASE_SERVICE_ROLE_KEY
   Remove-Item Env:SUPABASE_URL
   ```

   Replace the placeholders locally. Never paste the secret key into chat, source code, screenshots, or a committed `.env` file.

4. The script fetches `https://dummyjson.com/products?limit=0`, maps the catalogue to the database schema, and submits batches to Supabase. It omits source IDs so PostgreSQL generates IDs for the new database records.
5. It uses SKU conflict handling that leaves existing matching-SKU rows unchanged, so rerunning it does not overwrite product edits. It reports the final row count when the Data API returns an exact count.

If the script reports an error, stop and review the error before retrying. Confirm the Data API is enabled and the table schema matches the migration.

## Authentication and API behaviour

Login remains on DummyJSON to avoid breaking the current login screen. Mutating endpoints validate the existing bearer token before writing to the database. Reads are public, matching the current demo's catalogue experience. Product changes are stored in PostgreSQL, so refreshes and later sessions read the saved records.

## Rollout checklist

Verify list/search/category/detail, add, edit, delete, bulk delete, pagination, sorting, invalid inputs, and persistence after refresh. The deployment is not connected until the migration and import have run and the server-side environment variables are configured. Keep database mode disabled until those steps are complete.
