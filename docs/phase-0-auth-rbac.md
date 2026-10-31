# Phase 0 — Identity and access foundation

## Decisions

- Store currency: USD. Existing numeric product prices are not converted or reinterpreted by the identity migration.
- Customer registration: open registration through Supabase Auth, with email confirmation enabled in the Supabase project settings.
- Staff onboarding: owner-controlled. An owner creates/invites the Auth account and assigns its staff role through a trusted administrative workflow. Public signup never assigns a staff role.
- Authentication provider: Supabase Auth. The application must use server-managed, cookie-based sessions through `@supabase/ssr`; browser code must never receive a secret/service-role key.

## Identity model

`auth.users` is the credential and identity source managed by Supabase. Do not create or modify its internal schema.

`public.profiles` stores only user-editable profile attributes:
- `id` — UUID primary key and cascading FK to `auth.users.id`.
- `full_name`, `phone`, `avatar_path`.
- `created_at`, `updated_at`.

A database trigger creates a profile after an Auth user is inserted. It copies only the optional display name from signup metadata. It never trusts user metadata for roles or permissions.

## RBAC model

Authorization is stored in the non-API-exposed `private` schema:

| Table | Purpose |
| --- | --- |
| `private.roles` | Stable role codes and display names |
| `private.permissions` | Fine-grained permission codes |
| `private.role_permissions` | Many-to-many role/permission mapping |
| `private.user_roles` | Staff role assignments and assignment audit metadata |

Seeded roles:
- `owner`: all permissions, including staff and settings administration.
- `admin`: operational permissions, deliberately excluding `staff.manage` and `settings.manage`.
- `product_manager`: product and category management.
- `inventory_manager`: inventory read and management.
- `order_manager`: order management and customer read access.

Customers have no staff role. A user may have multiple staff roles. No signup path inserts into `private.user_roles`. Authenticated clients receive read-only access to their own role assignment; they receive no role-table write privileges.

`private.has_permission(text)` derives the caller from `auth.uid()`. It does not accept a user ID from the caller. It is a narrowly granted `SECURITY DEFINER` helper with an empty search path and fully qualified object references.

## RLS and grants

RLS and SQL grants are separate controls and both are required:
- Profiles: authenticated users can read/update only their own profile row. No client INSERT or DELETE.
- Role assignments: authenticated users can read only their own assignments. No client INSERT, UPDATE, or DELETE.
- Internal role/permission tables: private schema, excluded from the Supabase Data API exposed schemas, with no client table privileges.
- The profile trigger runs as its owner and creates the profile. It does not assign roles.
- Future public tables must enable RLS before they are exposed to the Data API. Policies must be operation-specific and tested for both allowed and denied access.

The first owner must be bootstrapped by a trusted project administrator after the owner account has been created in Supabase Auth. Do not promote a user based on email domain, signup metadata, or a client-supplied role. A follow-up migration adds owner-only staff role assignment/removal RPCs; the first owner remains a one-time trusted SQL bootstrap.

## Migration

Apply `supabase/migrations/202610300001_identity_and_rbac.sql` only after reviewing the target project's current migration history and confirming the `private` schema is not already used for unrelated application objects. The migration is additive and does not alter or delete product rows.

Before production rollout:
1. Enable email confirmations in Supabase Auth.
2. Configure the production Site URL and allowed redirect URLs.
3. Keep `private` out of the Data API exposed schemas.
4. Create the initial owner Auth account, then assign the `owner` role using a trusted SQL/admin workflow.
5. Verify a normal customer has no staff permissions and cannot write role assignments.
6. Confirm the existing product table, sequence grants, and product rows remain unchanged.

## Authentication cutover is intentionally separate

The current application still contains a DummyJSON login flow and product routes that use a service-role key. This migration does not pretend to replace that flow. The next implementation step must add Supabase SSR cookie sessions and migrate the API routes to user-scoped access with RLS before the legacy DummyJSON path is removed. Never use the service-role key for ordinary customer or staff CRUD; it bypasses RLS.

Required server environment:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

If a server-only secret is needed for trusted administrative operations, store it only in a server environment variable and never expose it with a `NEXT_PUBLIC_` prefix. Do not commit credentials.

## Verification checklist

- [ ] Migration applies cleanly to a staging Supabase project.
- [ ] A new Auth user gets exactly one profile row.
- [ ] Signup metadata cannot create roles or permissions.
- [ ] Customer can read/update own profile only.
- [ ] Customer cannot read another profile.
- [ ] Customer cannot insert/update/delete role assignments.
- [ ] `private.has_permission` returns false for a customer.
- [ ] Owner permissions are seeded; admin cannot manage staff/settings.
- [ ] Existing product rows and identity sequence are unchanged.
- [ ] The private schema is not exposed through the Data API.
