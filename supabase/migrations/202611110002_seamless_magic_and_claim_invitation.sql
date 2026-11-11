-- Migration: 202611110002_seamless_magic_and_claim_invitation.sql
-- Enables seamless Magic Activation & Instant Login for School Admins
-- 1. Auto-confirms user in auth.users upon verified invitation token acceptance (eliminates confirmation blockers)
-- 2. Provides school_admin_claim_pending_invitation() for instant login with user/password

-- ── 1. Update school_admin_accept_invitation ────────────────────────
create or replace function public.school_admin_accept_invitation(p_token_hash text)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  actor uuid := (select auth.uid());
  caller_email text;
  caller_user jsonb;
  inv membership_private.school_admin_invitations%rowtype;
begin
  if actor is null then
    raise exception 'unauthenticated' using errcode = '42501';
  end if;

  if p_token_hash is null or length(p_token_hash) < 32 then
    raise exception 'invalid_invitation_token' using errcode = '22023';
  end if;

  -- Lock invitation row to prevent race conditions during acceptance
  select * into inv
  from membership_private.school_admin_invitations
  where token_hash = p_token_hash
  for update;

  if inv.invitation_id is null then
    raise exception 'invitation_not_found' using errcode = 'P0002';
  end if;

  -- Granular status inspection
  if inv.status = 'revoked' then
    raise exception 'invitation_revoked' using errcode = '22023';
  elsif inv.status = 'accepted' then
    raise exception 'invitation_already_accepted' using errcode = '22023';
  elsif inv.status <> 'pending' then
    raise exception 'invitation_invalid_status' using errcode = '22023';
  end if;

  -- Check expiration
  if inv.expires_at < clock_timestamp() then
    update membership_private.school_admin_invitations
    set status = 'expired'
    where invitation_id = inv.invitation_id;
    raise exception 'invitation_expired' using errcode = '22023';
  end if;

  select to_jsonb(u) into caller_user
  from auth.users u
  where u.id = actor;

  if caller_user is null then
    raise exception 'unauthenticated' using errcode = '42501';
  end if;

  caller_email := lower(btrim(caller_user->>'email'));
  if caller_email is null or caller_email <> lower(btrim(inv.invited_email)) then
    raise exception 'invitation_email_mismatch' using errcode = '42501';
  end if;

  -- Auto-confirm user's email in auth.users upon verified token presentation
  update auth.users
  set email_confirmed_at = coalesce(email_confirmed_at, clock_timestamp())
  where id = actor;

  -- Grant school admin role in public.school_members
  insert into public.school_members (school_id, user_id, role, status)
  values (inv.school_id, actor, 'school_admin', 'active')
  on conflict (school_id, user_id)
  do update set role = 'school_admin', status = 'active';

  -- Mark invitation as accepted
  update membership_private.school_admin_invitations
  set status = 'accepted',
      accepted_by_auth_user_id = actor,
      accepted_at = clock_timestamp()
  where invitation_id = inv.invitation_id;

  -- Record audit event
  insert into membership_private.school_admin_events (
    request_id, school_id, actor_auth_user_id, event_type
  ) values (
    gen_random_uuid(), inv.school_id, actor, 'TEACHER_ADDED'
  );

  return jsonb_build_object(
    'ok', true,
    'school_id', inv.school_id,
    'role', 'school_admin',
    'status', 'active',
    'invitation_id', inv.invitation_id
  );
end;
$$;
alter function public.school_admin_accept_invitation(text) owner to postgres;
revoke all on function public.school_admin_accept_invitation(text) from public, anon;
grant execute on function public.school_admin_accept_invitation(text) to authenticated;

-- ── 2. Add school_admin_claim_pending_invitation ────────────────────
create or replace function public.school_admin_claim_pending_invitation()
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  actor uuid := (select auth.uid());
  caller_email text;
  caller_user jsonb;
  inv membership_private.school_admin_invitations%rowtype;
begin
  if actor is null then
    raise exception 'unauthenticated' using errcode = '42501';
  end if;

  select to_jsonb(u) into caller_user
  from auth.users u
  where u.id = actor;

  if caller_user is null then
    raise exception 'unauthenticated' using errcode = '42501';
  end if;

  caller_email := lower(btrim(caller_user->>'email'));
  if caller_email is null or caller_email = '' then
    raise exception 'unauthenticated' using errcode = '42501';
  end if;

  -- Find the latest pending non-expired invitation matching caller_email
  select * into inv
  from membership_private.school_admin_invitations
  where lower(btrim(invited_email)) = caller_email
    and status = 'pending'
    and expires_at > clock_timestamp()
  order by created_at desc
  limit 1
  for update;

  if inv.invitation_id is null then
    return jsonb_build_object('ok', false, 'reason', 'no_pending_invitation');
  end if;

  -- Auto-confirm user's email in auth.users
  update auth.users
  set email_confirmed_at = coalesce(email_confirmed_at, clock_timestamp())
  where id = actor;

  -- Grant school admin role in public.school_members
  insert into public.school_members (school_id, user_id, role, status)
  values (inv.school_id, actor, 'school_admin', 'active')
  on conflict (school_id, user_id)
  do update set role = 'school_admin', status = 'active';

  -- Mark invitation as accepted
  update membership_private.school_admin_invitations
  set status = 'accepted',
      accepted_by_auth_user_id = actor,
      accepted_at = clock_timestamp()
  where invitation_id = inv.invitation_id;

  -- Record audit event
  insert into membership_private.school_admin_events (
    request_id, school_id, actor_auth_user_id, event_type
  ) values (
    gen_random_uuid(), inv.school_id, actor, 'TEACHER_ADDED'
  );

  return jsonb_build_object(
    'ok', true,
    'school_id', inv.school_id,
    'role', 'school_admin',
    'status', 'active',
    'invitation_id', inv.invitation_id
  );
end;
$$;
alter function public.school_admin_claim_pending_invitation() owner to postgres;
revoke all on function public.school_admin_claim_pending_invitation() from public, anon;
grant execute on function public.school_admin_claim_pending_invitation() to authenticated;
