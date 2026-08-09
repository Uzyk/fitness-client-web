-- Invitaciones de alumno: el coach define email/modalidad/cuota; el alumno completa nombre y contraseña

create table if not exists public.student_invitations (
  id            uuid primary key default gen_random_uuid(),
  student_id    uuid not null references public.students(id) on delete cascade,
  coach_id      uuid not null references public.coaches(id) on delete cascade,
  email         text not null,
  token         text not null unique default encode(gen_random_bytes(24), 'hex'),
  expires_at    timestamptz not null default (now() + interval '14 days'),
  accepted_at   timestamptz,
  created_at    timestamptz not null default now()
);

create index if not exists student_invitations_token_idx on public.student_invitations (token);
create index if not exists student_invitations_student_id_idx on public.student_invitations (student_id);

alter table public.student_invitations enable row level security;

drop policy if exists "student_invitations_select_coach" on public.student_invitations;
create policy "student_invitations_select_coach"
  on public.student_invitations for select
  to authenticated
  using (
    public.is_admin()
    or exists (
      select 1 from public.coaches c
      where c.id = student_invitations.coach_id and c.user_id = auth.uid()
    )
  );

create or replace function public.get_student_invitation(p_token text)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_result json;
begin
  select json_build_object(
    'kind', 'student',
    'email', si.email,
    'modality', s.modality,
    'monthly_fee', s.monthly_fee,
    'coach_brand_name', c.brand_name,
    'theme', c.theme,
    'expires_at', si.expires_at,
    'accepted_at', si.accepted_at,
    'valid', (si.accepted_at is null and si.expires_at > now()),
    'pending_setup', (s.full_name = 'Pendiente' and s.user_id is null)
  )
  into v_result
  from public.student_invitations si
  join public.students s on s.id = si.student_id
  join public.coaches c on c.id = s.coach_id
  where si.token = p_token;

  return coalesce(v_result, '{}'::json);
end;
$$;

create or replace function public.coach_invite_student(
  p_email text,
  p_modality text default 'online',
  p_monthly_fee integer default 70000
)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_coach_id uuid;
  v_student_id uuid;
  v_token text;
  v_email text;
  v_modality text;
begin
  select id into v_coach_id from public.coaches where user_id = auth.uid();
  if v_coach_id is null and not public.is_admin() then
    raise exception 'Forbidden';
  end if;

  v_email := lower(trim(p_email));
  if v_email = '' then
    raise exception 'Email requerido';
  end if;

  v_modality := coalesce(nullif(trim(p_modality), ''), 'online');
  if v_modality not in ('online', 'presencial', 'mixto') then
    raise exception 'Modalidad inválida';
  end if;

  if exists (
    select 1 from public.students
    where coach_id = v_coach_id
      and lower(email) = v_email
      and user_id is not null
  ) then
    raise exception 'Este alumno ya tiene cuenta activa';
  end if;

  insert into public.students (
    coach_id, full_name, email, modality, monthly_fee, billing_day, payment_status, payments
  )
  values (
    v_coach_id,
    'Pendiente',
    v_email,
    v_modality,
    coalesce(p_monthly_fee, 70000),
    1,
    'pending',
    jsonb_build_array(jsonb_build_object(
      'month', to_char(now(), 'TMMonth YYYY'),
      'amount', coalesce(p_monthly_fee, 70000),
      'status', 'pending'
    ))
  )
  on conflict (coach_id, email) do update
  set
    modality = excluded.modality,
    monthly_fee = excluded.monthly_fee,
    full_name = case
      when public.students.user_id is null then 'Pendiente'
      else public.students.full_name
    end,
    updated_at = now()
  where public.students.user_id is null
  returning id into v_student_id;

  if v_student_id is null then
    select id into v_student_id
    from public.students
    where coach_id = v_coach_id and lower(email) = v_email;
  end if;

  delete from public.student_invitations
  where student_id = v_student_id and accepted_at is null;

  insert into public.student_invitations (student_id, coach_id, email)
  values (v_student_id, v_coach_id, v_email)
  returning token into v_token;

  return json_build_object(
    'student_id', v_student_id,
    'token', v_token
  );
end;
$$;

drop function if exists public.complete_student_onboarding(text);

create or replace function public.complete_student_onboarding(
  p_token text,
  p_full_name text
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_student_id uuid;
  v_email text;
  v_user_email text;
  v_full_name text;
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  v_full_name := trim(p_full_name);
  if v_full_name = '' then
    raise exception 'Nombre requerido';
  end if;

  select si.student_id, si.email
  into v_student_id, v_email
  from public.student_invitations si
  where si.token = p_token
    and si.accepted_at is null
    and si.expires_at > now();

  if v_student_id is null then
    raise exception 'Invalid or expired invitation';
  end if;

  select email into v_user_email from auth.users where id = auth.uid();

  if lower(v_user_email) <> lower(v_email) then
    raise exception 'Email does not match invitation';
  end if;

  update public.students
  set
    user_id = auth.uid(),
    full_name = v_full_name,
    updated_at = now()
  where id = v_student_id;

  update public.student_invitations
  set accepted_at = now()
  where token = p_token;

  insert into public.profiles (id, role, full_name, email)
  values (auth.uid(), 'student', v_full_name, v_email)
  on conflict (id) do update
  set role = 'student', full_name = v_full_name, email = v_email, updated_at = now();

  return v_student_id;
end;
$$;

grant execute on function public.get_student_invitation(text) to anon, authenticated;
grant execute on function public.coach_invite_student(text, text, integer) to authenticated;
grant execute on function public.complete_student_onboarding(text, text) to authenticated;

comment on table public.student_invitations is 'Links de invitación para registro de alumnos';
