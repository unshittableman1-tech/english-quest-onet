-- Additive foundation only. Does not change legacy students or their policies.
-- Deliberately fails on conflicting tables: audit an existing database first.
begin;

create schema if not exists membership_private;
revoke all on schema membership_private from public, anon, authenticated;
grant usage on schema membership_private to authenticated;

create table public.platform_admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table public.schools (
  id text primary key default gen_random_uuid()::text,
  code text not null unique check (code ~ '^[A-Z0-9][A-Z0-9_-]{2,31}$'),
  name text not null check (length(trim(name)) > 0),
  province text,
  area text,
  contact_name text,
  contact_email text,
  contact_phone text,
  status text not null default 'active' check (status in ('active', 'suspended', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.school_members (
  id uuid primary key default gen_random_uuid(),
  school_id text not null references public.schools(id) on delete restrict,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('school_admin', 'teacher')),
  status text not null default 'active' check (status in ('active', 'suspended')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (school_id, user_id)
);
create index school_members_user_idx on public.school_members(user_id, status);

create table public.plans (
  id uuid primary key default gen_random_uuid(),
  code text not null unique check (code ~ '^[a-z0-9][a-z0-9_-]{1,31}$'),
  name text not null check (length(trim(name)) > 0),
  description text,
  currency text not null default 'THB' check (currency ~ '^[A-Z]{3}$'),
  price_monthly numeric(12,2) check (price_monthly >= 0),
  price_yearly numeric(12,2) check (price_yearly >= 0),
  max_students integer not null check (max_students >= 0),
  max_teachers integer not null check (max_teachers >= 0),
  max_classes integer not null check (max_classes >= 0),
  features jsonb not null default '{}'::jsonb check (jsonb_typeof(features) = 'object'),
  is_active boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- One current contract per school; payment/history records belong in a later migration.
create table public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  school_id text not null unique references public.schools(id) on delete restrict,
  plan_id uuid not null references public.plans(id) on delete restrict,
  status text not null check (status in ('trialing', 'active', 'past_due', 'expired', 'suspended', 'cancelled')),
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  trial_ends_at timestamptz,
  max_students_override integer check (max_students_override >= 0),
  max_teachers_override integer check (max_teachers_override >= 0),
  max_classes_override integer check (max_classes_override >= 0),
  features_override jsonb not null default '{}'::jsonb check (jsonb_typeof(features_override) = 'object'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (ends_at > starts_at),
  check (trial_ends_at is null or (trial_ends_at > starts_at and trial_ends_at <= ends_at)),
  check (status <> 'trialing' or trial_ends_at is not null)
);

create function membership_private.touch_updated_at()
returns trigger language plpgsql set search_path = '' as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger schools_updated before update on public.schools
for each row execute function membership_private.touch_updated_at();
create trigger members_updated before update on public.school_members
for each row execute function membership_private.touch_updated_at();
create trigger plans_updated before update on public.plans
for each row execute function membership_private.touch_updated_at();
create trigger subscriptions_updated before update on public.subscriptions
for each row execute function membership_private.touch_updated_at();

-- No caller-supplied user ID and no editable user_metadata roles.
-- Definer helpers avoid recursive policies on school_members.
create function membership_private.is_platform_admin()
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.platform_admins where user_id = (select auth.uid()));
$$;

create function membership_private.has_school_access(target_school text, admin_only boolean default false)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.school_members m
    join public.schools s on s.id = m.school_id
    where m.user_id = (select auth.uid()) and m.school_id = target_school
      and m.status = 'active' and s.status = 'active'
      and (not admin_only or m.role = 'school_admin')
  );
$$;

revoke all on function membership_private.touch_updated_at() from public, anon, authenticated;
revoke all on function membership_private.is_platform_admin() from public, anon, authenticated;
revoke all on function membership_private.has_school_access(text, boolean) from public, anon, authenticated;
grant execute on function membership_private.is_platform_admin() to authenticated;
grant execute on function membership_private.has_school_access(text, boolean) to authenticated;

alter table public.platform_admins enable row level security;
alter table public.schools enable row level security;
alter table public.school_members enable row level security;
alter table public.plans enable row level security;
alter table public.subscriptions enable row level security;

revoke all on public.platform_admins, public.schools, public.school_members, public.plans, public.subscriptions
  from public, anon, authenticated;
grant select on public.platform_admins, public.schools, public.school_members, public.plans, public.subscriptions
  to authenticated;
grant all on public.platform_admins, public.schools, public.school_members, public.plans, public.subscriptions
  to service_role;

-- Provisioning and billing mutations require a trusted server, even for platform admins.
create policy admins_read_self on public.platform_admins for select to authenticated
using (user_id = (select auth.uid()));

create policy schools_read on public.schools for select to authenticated
using (membership_private.is_platform_admin() or membership_private.has_school_access(id));

create policy members_read on public.school_members for select to authenticated
using (membership_private.is_platform_admin()
  or (user_id = (select auth.uid()) and membership_private.has_school_access(school_id))
  or membership_private.has_school_access(school_id, true));

create policy subscriptions_read on public.subscriptions for select to authenticated
using (membership_private.is_platform_admin() or membership_private.has_school_access(school_id));

create policy plans_read on public.plans for select to authenticated
using (is_active or membership_private.is_platform_admin() or exists (
  select 1 from public.subscriptions s where s.plan_id = plans.id
));

commit;
