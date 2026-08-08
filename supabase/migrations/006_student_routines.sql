-- Rutinas nombradas por alumno + vínculo con sesiones del calendario

alter table public.students
  add column if not exists routines jsonb not null default '[]'::jsonb,
  add column if not exists active_routine_id text;

alter table public.coach_schedule
  add column if not exists routine_id text;

-- Migrar rutina única existente → lista nombrada
update public.students
set
  routines = jsonb_build_array(
    jsonb_build_object(
      'id', 'default',
      'name', 'Rutina principal',
      'exercises', coalesce(routine, '[]'::jsonb)
    )
  ),
  active_routine_id = 'default'
where jsonb_array_length(coalesce(routines, '[]'::jsonb)) = 0
  and jsonb_array_length(coalesce(routine, '[]'::jsonb)) > 0;

create or replace function public.sync_student_active_routine(p_student_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_routines jsonb;
  v_active_id text;
  v_exercises jsonb;
begin
  select routines, active_routine_id
  into v_routines, v_active_id
  from public.students
  where id = p_student_id;

  if v_active_id is not null then
    select elem->'exercises'
    into v_exercises
    from jsonb_array_elements(coalesce(v_routines, '[]'::jsonb)) elem
    where elem->>'id' = v_active_id
    limit 1;
  end if;

  if v_exercises is null and jsonb_array_length(coalesce(v_routines, '[]'::jsonb)) > 0 then
    v_exercises := v_routines->0->'exercises';
    v_active_id := v_routines->0->>'id';
  end if;

  update public.students
  set routine = coalesce(v_exercises, '[]'::jsonb),
      active_routine_id = v_active_id,
      updated_at = now()
  where id = p_student_id;
end;
$$;

create or replace function public.coach_update_student(
  p_student_id uuid,
  p_patch jsonb
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.coach_owns_student(p_student_id) and not public.is_admin() then
    raise exception 'Forbidden';
  end if;

  update public.students
  set
    payment_status = coalesce(p_patch->>'payment_status', payment_status),
    alerts = coalesce(p_patch->'alerts', alerts),
    pending_videos = coalesce(p_patch->'pending_videos', pending_videos),
    routine = coalesce(p_patch->'routine', routine),
    routines = coalesce(p_patch->'routines', routines),
    active_routine_id = coalesce(p_patch->>'active_routine_id', active_routine_id),
    payments = coalesce(p_patch->'payments', payments),
    next_session = case
      when p_patch ? 'next_session' then p_patch->'next_session'
      else next_session
    end,
    updated_at = now()
  where id = p_student_id;

  if p_patch ? 'routines' or p_patch ? 'active_routine_id' then
    perform public.sync_student_active_routine(p_student_id);
  end if;
end;
$$;

create or replace function public.coach_add_schedule(
  p_student_id uuid,
  p_date date,
  p_kind text,
  p_time time default null,
  p_place text default null,
  p_focus text default null,
  p_routine_id text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_coach_id uuid;
  v_id uuid;
  v_focus text;
  v_routine_name text;
begin
  if not public.coach_owns_student(p_student_id) then
    raise exception 'Forbidden';
  end if;

  select coach_id into v_coach_id from public.students where id = p_student_id;

  v_focus := p_focus;

  if p_routine_id is not null then
    select elem->>'name'
    into v_routine_name
    from public.students s,
         jsonb_array_elements(coalesce(s.routines, '[]'::jsonb)) elem
    where s.id = p_student_id and elem->>'id' = p_routine_id
    limit 1;

    if v_routine_name is not null then
      v_focus := coalesce(v_focus, v_routine_name);
    end if;
  end if;

  insert into public.coach_schedule (
    coach_id, student_id, schedule_date, schedule_time, kind, place, focus, routine_id
  )
  values (v_coach_id, p_student_id, p_date, p_time, p_kind, p_place, v_focus, p_routine_id)
  returning id into v_id;

  return v_id;
end;
$$;

grant execute on function public.sync_student_active_routine(uuid) to authenticated;
grant execute on function public.coach_add_schedule(uuid, date, text, time, text, text, text) to authenticated;
