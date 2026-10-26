# PostgreSQL persistence setup

This project currently uses DummyJSON for demo authentication and product data. DummyJSON accepts mutation requests but does not persist product changes. The Prisma schema in this folder is the planned persistent product store; it is not active until the Prisma client, server routes, migrations, and environment variable are configured.

## Recommended provider

Use a hosted PostgreSQL provider such as Neon or Supabase. Create a dedicated development database first; do not use production data while testing.

## Required environment variables

Configure these only in your local ignored `.env` file and in the deployment platform's encrypted environment-variable settings:

- `DATABASE_URL`: pooled PostgreSQL connection string for application queries.
- `DIRECT_URL`: direct PostgreSQL connection string for schema migrations, if the provider supplies a separate direct endpoint.

Never commit real connection strings, passwords, or `.env` files.

## Planned implementation sequence

1. Add and pin Prisma dependencies and regenerate `package-lock.json`.
2. Generate the Prisma client from `prisma/schema.prisma`.
3. Create a first migration and verify it against a disposable development database.
4. Add Next.js Route Handlers for list/search/detail/create/update/delete, with server-side validation.
5. Switch the frontend product API service from DummyJSON to the local `/api/products` endpoints.
6. Add database-backed integration tests and run typecheck, lint, tests, and production build in CI.
7. Configure the hosted deployment's environment variables only after CI passes.

## Data migration note

DummyJSON data is sample data. This migration creates a new, empty product table; it does not automatically import the remote catalogue. Seed/import functionality should be added deliberately and must be safe to run more than once.
