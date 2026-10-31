# Phase 0 — Initial owner bootstrap

This is a one-time, trusted administrator procedure for the **staging** project first. It must never be exposed as a public signup flow or callable by an ordinary authenticated user.

## Preconditions

1. Apply the identity/RBAC migration and the owner staff-role RPC migration.
2. Create the intended owner account through Supabase Authentication → Users.
3. Confirm the account belongs to the project you intend to bootstrap.
4. Copy the user's email exactly. Do not use signup metadata to grant a role.

## Bootstrap the first owner

In the target project's Supabase SQL Editor, replace `OWNER_EMAIL_HERE` with the email address of the intended owner, then run:

```sql
begin;

do $$
declare
  owner_user_id uuid;
  owner_role_id bigint;
begin
  select u.id
    into strict owner_user_id
  from auth.users u
  where lower(u.email) = lower('OWNER_EMAIL_HERE');

  select r.id
    into strict owner_role_id
  from private.roles r
  where r.code = 'owner';

  insert into private.user_roles (user_id, role_id, assigned_by)
  values (owner_user_id, owner_role_id, owner_user_id)
  on conflict (user_id, role_id) do nothing;
end;
$$;

commit;
```

The `INTO STRICT` lookup intentionally fails if the email matches zero or multiple users. Run it only after confirming the project selector shows the correct staging project. Do not paste passwords, API keys, or service-role keys into SQL.

## Verify

Run:

```sql
select
  u.email,
  r.code as role,
  count(p.permission_id) as permission_count
from auth.users u
join private.user_roles ur on ur.user_id = u.id
join private.roles r on r.id = ur.role_id
left join private.role_permissions p on p.role_id = r.id
where lower(u.email) = lower('OWNER_EMAIL_HERE')
group by u.email, r.code;
```

Expected: one `owner` row with 14 permissions.

## Ongoing staff management

After the first owner is bootstrapped, the owner can assign and remove non-owner roles through the authenticated RPCs:

- `public.assign_staff_role(target_user_id, requested_role_code)`
- `public.remove_staff_role(target_user_id, requested_role_code)`

Both functions derive the caller from `auth.uid()`, require `staff.manage`, reject the `owner` role, and are executable only by authenticated users. The first owner cannot be created, promoted, or removed through these application RPCs. Keep initial owner recovery and ownership transfer as a trusted administrative procedure with a separate review.

The RPCs assign roles to existing Auth users; they do not invite users or create Auth accounts. Staff invitation/onboarding UI must create or invite the account first, then call the role assignment RPC from an authenticated owner session.
