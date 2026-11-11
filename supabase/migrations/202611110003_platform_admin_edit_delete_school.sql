-- Migration: 202611110003_platform_admin_edit_delete_school.sql
-- Adds platform_admin_update_school and platform_admin_delete_school RPCs

-- ── 1. Update School RPC ─────────────────────────────────────────────
create or replace function public.platform_admin_update_school(
  p_school_id text,
  p_school_name text,
  p_school_code text,
  p_school_province text default null,
  p_school_area text default null,
  p_plan_id uuid default null,
  p_max_students_override integer default null,
  p_subscription_status text default null,
  p_subscription_ends_at timestamptz default null
)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  actor uuid := (select auth.uid());
  target_school public.schools%rowtype;
  clean_code text := upper(btrim(p_school_code));
  clean_name text := btrim(p_school_name);
begin
  if actor is null or not (select membership_private.is_platform_admin()) then
    raise exception 'platform_admin_forbidden' using errcode = '42501';
  end if;

  if clean_code is null or clean_code !~ '^[A-Z0-9][A-Z0-9_-]{2,31}$'
     or nullif(clean_name, '') is null then
    raise exception 'invalid_school_data' using errcode = '22023';
  end if;

  select * into target_school from public.schools where id = p_school_id;
  if target_school.id is null then
    raise exception 'school_not_found' using errcode = 'P0002';
  end if;

  -- Ensure school_code uniqueness if changed
  if clean_code <> upper(target_school.code) and exists (
    select 1 from public.schools where upper(code) = clean_code and id <> p_school_id
  ) then
    raise exception 'school_code_already_exists' using errcode = '23505';
  end if;

  -- 1. Update School info
  update public.schools
  set name = clean_name,
      code = clean_code,
      province = nullif(btrim(p_school_province), ''),
      area = nullif(btrim(p_school_area), ''),
      updated_at = clock_timestamp()
  where id = p_school_id
  returning * into target_school;

  -- Update school_code in students if changed
  update public.students
  set school_code = clean_code
  where school_id = p_school_id;

  -- 2. Update Subscription if provided
  if p_plan_id is not null or p_max_students_override is not null or p_subscription_status is not null or p_subscription_ends_at is not null then
    update public.subscriptions
    set plan_id = coalesce(p_plan_id, plan_id),
        max_students_override = case
          when p_max_students_override = -1 then null
          when p_max_students_override is not null then p_max_students_override
          else max_students_override
        end,
        status = coalesce(p_subscription_status, status),
        ends_at = coalesce(p_subscription_ends_at, ends_at),
        updated_at = clock_timestamp()
    where school_id = p_school_id;
  end if;

  return jsonb_build_object(
    'ok', true,
    'school', to_jsonb(target_school)
  );
end;
$$;
alter function public.platform_admin_update_school(text, text, text, text, text, uuid, integer, text, timestamptz) owner to postgres;
revoke all on function public.platform_admin_update_school(text, text, text, text, text, uuid, integer, text, timestamptz) from public, anon;
grant execute on function public.platform_admin_update_school(text, text, text, text, text, uuid, integer, text, timestamptz) to authenticated;

-- ── 2. Delete School RPC ─────────────────────────────────────────────
create or replace function public.platform_admin_delete_school(p_school_id text)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  actor uuid := (select auth.uid());
  target_school public.schools%rowtype;
begin
  if actor is null or not (select membership_private.is_platform_admin()) then
    raise exception 'platform_admin_forbidden' using errcode = '42501';
  end if;

  select * into target_school from public.schools where id = p_school_id;
  if target_school.id is null then
    raise exception 'school_not_found' using errcode = 'P0002';
  end if;

  -- 1. Remove student identity mapping and challenges
  delete from student_private.pin_change_challenges
  where account_id in (select account_id from student_private.identity_map where school_id = p_school_id);

  delete from student_private.access_events where school_id = p_school_id;
  delete from student_private.identity_map where school_id = p_school_id;

  -- 2. Delete students belonging to this school
  delete from public.students where school_id = p_school_id;

  -- 3. Delete school admin invitations and events
  delete from membership_private.school_admin_events where school_id = p_school_id;
  delete from membership_private.school_admin_invitations where school_id = p_school_id;

  -- 4. Delete school members
  delete from public.school_members where school_id = p_school_id;

  -- 5. Delete subscriptions
  delete from public.subscriptions where school_id = p_school_id;

  -- 6. Finally delete the school
  delete from public.schools where id = p_school_id;

  return jsonb_build_object(
    'ok', true,
    'deleted_school_id', p_school_id,
    'school_code', target_school.code,
    'school_name', target_school.name
  );
end;
$$;
alter function public.platform_admin_delete_school(text) owner to postgres;
revoke all on function public.platform_admin_delete_school(text) from public, anon;
grant execute on function public.platform_admin_delete_school(text) to authenticated;
