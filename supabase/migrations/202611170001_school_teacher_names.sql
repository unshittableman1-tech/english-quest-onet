-- Teacher names are entered by an authorized school administrator, per school.
-- Existing memberships and historical records are retained.
alter table public.school_members add column if not exists teacher_name text;

create or replace function public.school_admin_list_teachers(target_school_id text)
returns jsonb language plpgsql stable security definer set search_path = '' as $$
declare result jsonb;
begin
  if (select auth.uid()) is null
     or not membership_private.school_admin_authorized(target_school_id) then
    raise exception 'school_admin_forbidden' using errcode = '42501';
  end if;
  select coalesce(jsonb_agg(jsonb_build_object(
    'user_id', member.user_id, 'role', member.role, 'status', member.status,
    'created_at', member.created_at, 'email', auth_user.email,
    'teacher_name', member.teacher_name
  ) order by auth_user.email), '[]'::jsonb)
  into result
  from public.school_members member
  join auth.users auth_user on auth_user.id = member.user_id
  where member.school_id = target_school_id;
  return result;
end;
$$;

create or replace function public.school_admin_update_teacher_name(
  p_school_id text, p_user_id uuid, p_name text
) returns void language plpgsql security definer set search_path = '' as $$
begin
  if (select auth.uid()) is null
     or not membership_private.school_admin_authorized(p_school_id) then
    raise exception 'school_admin_forbidden' using errcode = '42501';
  end if;
  if p_name is null or char_length(btrim(p_name)) = 0 or char_length(btrim(p_name)) > 200 then
    raise exception 'invalid_teacher_name' using errcode = '22023';
  end if;
  update public.school_members
  set teacher_name = btrim(p_name)
  where school_id = p_school_id and user_id = p_user_id;
  if not found then
    raise exception 'teacher_membership_not_found' using errcode = 'P0002';
  end if;
end;
$$;
alter function public.school_admin_update_teacher_name(text, uuid, text) owner to postgres;
revoke all on function public.school_admin_update_teacher_name(text, uuid, text) from public, anon;
grant execute on function public.school_admin_update_teacher_name(text, uuid, text) to authenticated;
