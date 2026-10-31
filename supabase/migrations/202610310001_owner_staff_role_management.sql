-- Phase 0 follow-up: owner-controlled staff role management.
-- The first owner is still bootstrapped through a trusted SQL-only procedure.
begin;

create or replace function public.assign_staff_role(
  target_user_id uuid,
  requested_role_code text
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  caller_id uuid;
  requested_role_id bigint;
begin
  caller_id := (select auth.uid());

  if caller_id is null then
    raise exception 'Authentication required' using errcode = '28000';
  end if;

  if not private.has_permission('staff.manage') then
    raise exception 'Insufficient permission to manage staff' using errcode = '42501';
  end if;

  if requested_role_code = 'owner' then
    raise exception 'Owner role cannot be assigned through the application' using errcode = '42501';
  end if;

  select r.id
    into requested_role_id
  from private.roles r
  where r.code = requested_role_code;

  if requested_role_id is null then
    raise exception 'Unknown staff role: %', requested_role_code using errcode = '22023';
  end if;

  if not exists (select 1 from auth.users u where u.id = target_user_id) then
    raise exception 'Target user does not exist' using errcode = '22023';
  end if;

  insert into private.user_roles (user_id, role_id, assigned_by)
  values (target_user_id, requested_role_id, caller_id)
  on conflict (user_id, role_id)
  do update set assigned_by = excluded.assigned_by, assigned_at = now();
end;
$$;

create or replace function public.remove_staff_role(
  target_user_id uuid,
  requested_role_code text
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  caller_id uuid;
  requested_role_id bigint;
begin
  caller_id := (select auth.uid());

  if caller_id is null then
    raise exception 'Authentication required' using errcode = '28000';
  end if;

  if not private.has_permission('staff.manage') then
    raise exception 'Insufficient permission to manage staff' using errcode = '42501';
  end if;

  if requested_role_code = 'owner' then
    raise exception 'Owner role cannot be removed through the application' using errcode = '42501';
  end if;

  select r.id
    into requested_role_id
  from private.roles r
  where r.code = requested_role_code;

  if requested_role_id is null then
    raise exception 'Unknown staff role: %', requested_role_code using errcode = '22023';
  end if;

  delete from private.user_roles
  where user_id = target_user_id
    and role_id = requested_role_id;
end;
$$;

revoke all on function public.assign_staff_role(uuid, text) from public, anon;
revoke all on function public.remove_staff_role(uuid, text) from public, anon;
grant execute on function public.assign_staff_role(uuid, text) to authenticated;
grant execute on function public.remove_staff_role(uuid, text) to authenticated;

commit;
