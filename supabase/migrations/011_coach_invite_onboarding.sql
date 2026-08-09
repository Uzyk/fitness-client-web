-- Invitación coach: admin solo envía email; el coach configura nombre, marca y paleta al registrarse

create or replace function public.admin_create_coach(p_email text)
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
begin
  if not public.is_admin() then
    raise exception 'Forbidden: admin only';
  end if;

  v_email := lower(trim(p_email));
  if v_email = '' then
    raise exception 'Email requerido';
  end if;

  if exists (select 1 from public.coaches where lower(email) = v_email) then
    raise exception 'Ya existe un coach con ese email';
  end if;

  v_slug := 'invite-' || substr(replace(gen_random_uuid()::text, '-', ''), 1, 10);

  insert into public.coaches (brand_name, email, slug, status, created_by)
  values ('Pendiente', v_email, v_slug, 'invited', auth.uid())
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
    'brand_name', case when c.brand_name = 'Pendiente' then null else c.brand_name end,
    'theme', c.theme,
    'expires_at', ci.expires_at,
    'accepted_at', ci.accepted_at,
    'valid', (ci.accepted_at is null and ci.expires_at > now()),
    'pending_setup', (c.brand_name = 'Pendiente' and c.user_id is null)
  )
  into v_result
  from public.coach_invitations ci
  join public.coaches c on c.id = ci.coach_id
  where ci.token = p_token;

  return coalesce(v_result, '{}'::json);
end;
$$;

drop function if exists public.complete_coach_onboarding(text);

create or replace function public.complete_coach_onboarding(
  p_token text,
  p_full_name text,
  p_brand_name text,
  p_theme jsonb
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_coach_id uuid;
  v_email text;
  v_user_email text;
  v_slug text;
  v_full_name text;
  v_brand_name text;
  v_theme jsonb;
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  v_full_name := trim(p_full_name);
  v_brand_name := trim(p_brand_name);

  if v_full_name = '' then
    raise exception 'Nombre requerido';
  end if;

  if v_brand_name = '' then
    raise exception 'Nombre de marca requerido';
  end if;

  select ci.coach_id, ci.email
  into v_coach_id, v_email
  from public.coach_invitations ci
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

  v_theme := coalesce(p_theme, '{
    "rosado": "#E879A9",
    "rosadoPastel": "#FCE7F3",
    "moradoPastel": "#DDD6FE",
    "morado": "#A78BFA",
    "celestePastel": "#BAE6FD",
    "celeste": "#38BDF8"
  }'::jsonb);

  v_slug := public.slugify_coach(v_brand_name);
  if v_slug = '' then
    v_slug := 'coach-' || substr(v_coach_id::text, 1, 8);
  end if;

  if exists (select 1 from public.coaches where slug = v_slug and id <> v_coach_id) then
    v_slug := v_slug || '-' || substr(replace(v_coach_id::text, '-', ''), 1, 6);
  end if;

  update public.coaches
  set
    user_id = auth.uid(),
    brand_name = v_brand_name,
    slug = v_slug,
    theme = v_theme,
    status = 'active',
    updated_at = now()
  where id = v_coach_id;

  update public.coach_invitations
  set accepted_at = now()
  where token = p_token;

  insert into public.profiles (id, role, full_name, email)
  values (auth.uid(), 'coach', v_full_name, v_email)
  on conflict (id) do update
  set role = 'coach', full_name = v_full_name, email = v_email, updated_at = now();

  return v_coach_id;
end;
$$;

-- Compatibilidad con firma anterior (admin con marca+paleta predefinida)
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
  v_result json;
  v_coach_id uuid;
  v_theme jsonb;
begin
  v_result := public.admin_create_coach(p_email);
  v_coach_id := (v_result->>'coach_id')::uuid;

  v_theme := coalesce(p_theme, '{
    "rosado": "#E879A9",
    "rosadoPastel": "#FCE7F3",
    "moradoPastel": "#DDD6FE",
    "morado": "#A78BFA",
    "celestePastel": "#BAE6FD",
    "celeste": "#38BDF8"
  }'::jsonb);

  if nullif(trim(p_brand_name), '') is not null and trim(p_brand_name) <> 'Pendiente' then
    update public.coaches
    set
      brand_name = trim(p_brand_name),
      slug = public.slugify_coach(trim(p_brand_name)),
      theme = v_theme,
      updated_at = now()
    where id = v_coach_id;
  end if;

  return v_result;
end;
$$;

grant execute on function public.admin_create_coach(text) to authenticated;
grant execute on function public.admin_create_coach(text, text, jsonb) to authenticated;
grant execute on function public.complete_coach_onboarding(text, text, text, jsonb) to authenticated;
