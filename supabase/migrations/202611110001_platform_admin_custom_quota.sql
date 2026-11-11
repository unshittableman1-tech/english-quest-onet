-- Migration: 202611110001_platform_admin_custom_quota.sql
-- Allow platform admin to specify custom student quota (max_students_override) when creating a school

drop function if exists public.platform_admin_create_school_with_invitation(text, text, text, text, uuid, text, timestamptz, timestamptz, text, text);

create or replace function public.platform_admin_create_school_with_invitation(
  school_code text,
  school_name text,
  school_province text,
  school_area text,
  target_plan_id uuid,
  subscription_status text,
  subscription_starts_at timestamptz,
  subscription_ends_at timestamptz,
  admin_email text,
  invitation_token_hash text,
  max_students_override integer default null
)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  actor uuid := (select auth.uid());
  created_school public.schools%rowtype;
  created_subscription public.subscriptions%rowtype;
  created_invitation membership_private.school_admin_invitations%rowtype;
  clean_email text;
begin
  -- SECURITY: Caller must be an authenticated platform admin
  if actor is null or not (select membership_private.is_platform_admin()) then
    raise exception 'platform_admin_forbidden' using errcode = '42501';
  end if;

  -- Validate school code & name
  if school_code is null or school_code !~ '^[A-Z0-9][A-Z0-9_-]{2,31}$'
     or nullif(btrim(school_name), '') is null then
    raise exception 'invalid_school_onboarding' using errcode = '22023';
  end if;

  -- Validate subscription
  if subscription_status not in ('trialing', 'active') or subscription_ends_at <= subscription_starts_at then
    raise exception 'invalid_school_subscription' using errcode = '22023';
  end if;

  -- Validate plan
  if not exists (select 1 from public.plans plan where plan.id = target_plan_id and plan.is_active) then
    raise exception 'plan_unavailable' using errcode = '22023';
  end if;

  -- Validate email & token hash
  clean_email := lower(btrim(admin_email));
  if clean_email is null or clean_email !~ '^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$' then
    raise exception 'invalid_admin_email' using errcode = '22023';
  end if;
  if invitation_token_hash is null or length(invitation_token_hash) < 32 then
    raise exception 'invalid_token_hash' using errcode = '22023';
  end if;

  -- Check for existing active school code
  if exists (select 1 from public.schools s where upper(s.code) = upper(school_code)) then
    raise exception 'school_code_already_exists' using errcode = '23505';
  end if;

  -- Insert School
  insert into public.schools (code, name, province, area)
  values (school_code, btrim(school_name), nullif(btrim(school_province), ''), nullif(btrim(school_area), ''))
  returning * into created_school;

  -- Insert Subscription with optional custom seat override
  insert into public.subscriptions (school_id, plan_id, status, starts_at, ends_at, max_students_override)
  values (created_school.id, target_plan_id, subscription_status, subscription_starts_at, subscription_ends_at, max_students_override)
  returning * into created_subscription;

  -- Insert Pending Invitation
  insert into membership_private.school_admin_invitations (
    school_id, invited_email, token_hash, status, invited_by_auth_user_id, expires_at
  ) values (
    created_school.id, clean_email, invitation_token_hash, 'pending', actor,
    (clock_timestamp() + interval '7 days')
  ) returning * into created_invitation;

  return jsonb_build_object(
    'ok', true,
    'school', to_jsonb(created_school),
    'subscription', to_jsonb(created_subscription),
    'invitation', jsonb_build_object(
      'invitation_id', created_invitation.invitation_id,
      'invited_email', created_invitation.invited_email,
      'status', created_invitation.status,
      'expires_at', created_invitation.expires_at
    )
  );
end;
$$;

alter function public.platform_admin_create_school_with_invitation(text, text, text, text, uuid, text, timestamptz, timestamptz, text, text, integer) owner to postgres;
revoke all on function public.platform_admin_create_school_with_invitation(text, text, text, text, uuid, text, timestamptz, timestamptz, text, text, integer) from public, anon;
grant execute on function public.platform_admin_create_school_with_invitation(text, text, text, text, uuid, text, timestamptz, timestamptz, text, text, integer) to authenticated;
