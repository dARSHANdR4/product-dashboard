# Product Admin Dashboard

A responsive product management dashboard built with Next.js App Router, TypeScript, Tailwind CSS, and Axios. It supports product management through either the DummyJSON demo API or a persistent PostgreSQL catalogue hosted on Supabase.

## Live demo

**Deployment:** [View the app on Vercel](https://product-dashboard-nine-rouge.vercel.app/)

**Demo login (DummyJSON):**
- Username: `emilys`
- Password: `emilyspass`

The demo credentials are for the current authentication flow. Do not use them as production credentials for any other service.

## Features

### Product management
- Responsive product list and detail pages.
- Pagination, URL-synced state, debounced search, category filtering, and sorting.
- Create, edit, delete, and bulk-delete flows with form validation and confirmation UI.
- Product image handling, loading skeletons, empty states, error states, and retry actions.
- Optimistic edit/delete updates with rollback on failed requests.
- In-memory product-list cache with a 60-second TTL and cache invalidation after mutations.

### Experience and engineering
- Authentication guard and shared Axios interceptors.
- Automatic redirect to login on HTTP 401.
- Dark mode, toast notifications, and responsive layouts.
- TypeScript type checking, ESLint, Node.js unit tests, and a production build in GitHub Actions CI.

## Backend modes

The product API transport is selected with `NEXT_PUBLIC_PRODUCT_API_MODE`:

- **DummyJSON demo mode (default):** leave the variable unset. DummyJSON is a mock API; successful writes are not persisted by DummyJSON. Local context only reflects changes during the current app session.
- **Supabase database mode:** set `NEXT_PUBLIC_PRODUCT_API_MODE=database`. Product reads and writes then use the app's Next.js `/api/products` routes, backed by the Supabase PostgREST API and PostgreSQL. Product changes persist across refreshes and sessions.

Login remains on DummyJSON in both modes. The database-backed write routes validate the existing bearer token before accepting mutations.

### Supabase environment variables

Configure these in Vercel (or in your local, uncommitted environment):

- `SUPABASE_URL`: Supabase project URL.
- `SUPABASE_SERVICE_ROLE_KEY`: server-only secret key. Never prefix it with `NEXT_PUBLIC_`, commit it, or expose it in client-side code.
- `NEXT_PUBLIC_PRODUCT_API_MODE=database`: set for the Production environment when using the persistent product backend.

Follow [the database setup guide](docs/database-setup.md) for the table migration, initial catalogue import, environment configuration, and rollout verification. Do not enable database mode until the migration and required server-side variables are ready.

## Local development

Requirements: Node.js 22 and npm.

```bash
git clone https://github.com/dARSHANdR4/product-dashboard.git
cd product-dashboard
npm ci
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Quality checks

Run these before submitting changes:

```bash
npm run typecheck
npm run lint
npm test
npm run build
```

GitHub Actions runs the type check, lint, unit tests, and production build for pull requests targeting `main`.

## Design notes and trade-offs

- **Token storage:** the current client auth implementation keeps a token in module memory and backs it up to `sessionStorage`. This is a demo-oriented approach, not a replacement for a production-grade server-managed session with secure, HttpOnly cookies.
- **Search and category:** the UI clears one when the other is selected to avoid implying that unsupported combinations are applied in demo mode.
- **Cache:** product-list responses are cached in memory for up to 60 seconds; successful mutations invalidate the cache.
- **Failure simulation:** a development-only control exists to exercise optimistic rollback paths. Do not enable test-failure behavior in production.

## AI usage

AI tools assisted with selected boilerplate styling, icon SVGs, and TypeScript data interfaces. The project-specific architecture, state management, optimistic update flows, and React Context integration were developed and refined as part of the application work.

## Copyright and permissions

Copyright © 2026 dARSHANdR4. All rights reserved.

Unless otherwise stated, original project code and assets are reserved and no open-source licence is granted. Third-party materials remain subject to their respective licences. Public repositories may still be viewed and forked through GitHub's platform functionality. See [COPYRIGHT](./COPYRIGHT) for the full notice.
