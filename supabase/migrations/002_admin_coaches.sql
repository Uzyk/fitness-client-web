-- Perfiles, coaches, invitaciones y panel admin
-- Rol admin: asignar manualmente tras primer registro (ver docs/ADMIN-SETUP.md)

-- ---------------------------------------------------------------------------
-- Tablas
-- ---------------------------------------------------------------------------

create table if not exists public.profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  role          text not null default 'student'
                check (role in ('admin', 'coach', 'student')),
  full_name     text,
  email         text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create table if not exists public.coaches (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid references auth.users(id) on delete set null,
  brand_name    text not null,
  email         text not null unique,
  slug          text not null unique,
  theme         jsonb not null default '{
    "rosado": "#E879A9",
    "rosadoPastel": "#FCE7F3",
    "moradoPastel": "#DDD6FE",
    "morado": "#A78BFA",
    "celestePastel": "#BAE6FD",
    "celeste": "#38BDF8"
  }'::jsonb,
  status        text not null default 'invited'
                check (status in ('invited', 'active', 'suspended')),
  created_by    uuid references auth.users(id),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create table if not exists public.coach_invitations (
  id            uuid primary key default gen_random_uuid(),
  coach_id      uuid not null references public.coaches(id) on delete cascade,
  email         text not null,
  token         text not null unique default encode(gen_random_bytes(24), 'hex'),
  expires_at    timestamptz not null default (now() + interval '14 days'),
  accepted_at   timestamptz,
  created_by    uuid references auth.users(id),
  created_at    timestamptz not null default now()
);

create index if not exists coaches_user_id_idx on public.coaches (user_id);
create index if not exists coaches_status_idx on public.coaches (status);
create index if not exists coach_invitations_token_idx on public.coach_invitations (token);
create index if not exists coach_invitations_email_idx on public.coach_invitations (email);

-- ---------------------------------------------------------------------------
-- Trigger: perfil al registrarse
-- ---------------------------------------------------------------------------

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, role, full_name, email)
  values (
    new.id,
    coalesce(new.raw_app_meta_data->>'role', 'student'),
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.email
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- Helpers
-- ---------------------------------------------------------------------------

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

create or replace function public.slugify_coach(p_name text)
returns text
language sql
immutable
as $$
  select trim(both '-' from lower(regexp_replace(
    regexp_replace(trim(p_name), '[^a-zA-Z0-9]+', '-', 'g'),
    '-+', '-', 'g'
  )));
$$;

-- Invitación pública (solo datos necesarios para registro)
create or replace function public.get_coach_invitation(p_token text)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_result json;
begin
  select json_build_object(
    'email', ci.email,
    'brand_name', c.brand_name,
    'theme', c.theme,
    'expires_at', ci.expires_at,
    'accepted_at', ci.accepted_at,
    'valid', (ci.accepted_at is null and ci.expires_at > now())
  )
  into v_result
  from public.coach_invitations ci
  join public.coaches c on c.id = ci.coach_id
  where ci.token = p_token;

  return coalesce(v_result, '{}'::json);
end;
$$;

-- Crear coach + invitación (solo admin)
create or replace function public.admin_create_coach(
  p_brand_name text,
  p_email text,
  p_theme jsonb default null
)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_coach_id uuid;
  v_token text;
  v_slug text;
  v_email text;
  v_theme jsonb;
begin
  if not public.is_admin() then
    raise exception 'Forbidden: admin only';
  end if;

  v_email := lower(trim(p_email));
  v_slug := public.slugify_coach(p_brand_name);

  if v_slug = '' then
    v_slug := 'coach-' || substr(gen_random_uuid()::text, 1, 8);
  end if;

  v_theme := coalesce(p_theme, '{
    "rosado": "#E879A9",
    "rosadoPastel": "#FCE7F3",
    "moradoPastel": "#DDD6FE",
    "morado": "#A78BFA",
    "celestePastel": "#BAE6FD",
    "celeste": "#38BDF8"
  }'::jsonb);

  insert into public.coaches (brand_name, email, slug, theme, status, created_by)
  values (trim(p_brand_name), v_email, v_slug, v_theme, 'invited', auth.uid())
  returning id into v_coach_id;

  insert into public.coach_invitations (coach_id, email, created_by)
  values (v_coach_id, v_email, auth.uid())
  returning token into v_token;

  return json_build_object(
    'coach_id', v_coach_id,
    'token', v_token,
    'slug', v_slug
  );
end;
$$;

-- Actualizar paleta (admin)
create or replace function public.admin_update_coach_theme(
  p_coach_id uuid,
  p_theme jsonb
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'Forbidden: admin only';
  end if;

  update public.coaches
  set theme = p_theme, updated_at = now()
  where id = p_coach_id;
end;
$$;

-- Completar registro coach tras signUp
create or replace function public.complete_coach_onboarding(p_token text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_coach_id uuid;
  v_email text;
  v_brand text;
  v_user_email text;
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  select ci.coach_id, ci.email, c.brand_name
  into v_coach_id, v_email, v_brand
  from public.coach_invitations ci
  join public.coaches c on c.id = ci.coach_id
  where ci.token = p_token
    and ci.accepted_at is null
    and ci.expires_at > now();

  if v_coach_id is null then
    raise exception 'Invalid or expired invitation';
  end if;

  select email into v_user_email from auth.users where id = auth.uid();

  if lower(v_user_email) <> lower(v_email) then
    raise exception 'Email does not match invitation';
  end if;

  update public.coaches
  set user_id = auth.uid(), status = 'active', updated_at = now()
  where id = v_coach_id;

  update public.coach_invitations
  set accepted_at = now()
  where token = p_token;

  insert into public.profiles (id, role, full_name, email)
  values (auth.uid(), 'coach', v_brand, v_email)
  on conflict (id) do update
  set role = 'coach', full_name = excluded.full_name, email = excluded.email, updated_at = now();

  return v_coach_id;
end;
$$;

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------

alter table public.profiles enable row level security;
alter table public.coaches enable row level security;
alter table public.coach_invitations enable row level security;

-- profiles
drop policy if exists "profiles_select_own_or_admin" on public.profiles;
create policy "profiles_select_own_or_admin"
  on public.profiles for select
  to authenticated
  using (id = auth.uid() or public.is_admin());

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
  on public.profiles for update
  to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

-- coaches
drop policy if exists "coaches_select_admin_or_own" on public.coaches;
create policy "coaches_select_admin_or_own"
  on public.coaches for select
  to authenticated
  using (public.is_admin() or user_id = auth.uid());

drop policy if exists "coaches_update_admin_or_own_theme" on public.coaches;
create policy "coaches_update_admin_or_own_theme"
  on public.coaches for update
  to authenticated
  using (public.is_admin() or user_id = auth.uid())
  with check (public.is_admin() or user_id = auth.uid());

-- invitations: solo admin lee; creación vía RPC
drop policy if exists "invitations_select_admin" on public.coach_invitations;
create policy "invitations_select_admin"
  on public.coach_invitations for select
  to authenticated
  using (public.is_admin());

-- Grants RPC
grant execute on function public.get_coach_invitation(text) to anon, authenticated;
grant execute on function public.admin_create_coach(text, text, jsonb) to authenticated;
grant execute on function public.admin_update_coach_theme(uuid, jsonb) to authenticated;
grant execute on function public.complete_coach_onboarding(text) to authenticated;
grant execute on function public.is_admin() to authenticated;

comment on table public.coaches is 'Cuentas coach (Vania, etc.) con tema visual por marca';
comment on table public.coach_invitations is 'Links de invitación para registro de coaches';
