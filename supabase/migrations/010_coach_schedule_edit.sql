-- Editar o eliminar sesiones ya agendadas

create or replace function public.coach_owns_schedule(p_schedule_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.coach_owns_student(
    (select student_id from public.coach_schedule where id = p_schedule_id)
  );
$$;

create or replace function public.coach_update_schedule(
  p_schedule_id uuid,
  p_patch jsonb
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_student_id uuid;
  v_kind text;
  v_routine_id text;
  v_routine_name text;
  v_focus text;
begin
  if not public.coach_owns_schedule(p_schedule_id) and not public.is_admin() then
    raise exception 'Forbidden';
  end if;

  select student_id into v_student_id
  from public.coach_schedule
  where id = p_schedule_id;

  if v_student_id is null then
    raise exception 'Schedule entry not found';
  end if;

  v_kind := coalesce(p_patch->>'kind', (
    select kind from public.coach_schedule where id = p_schedule_id
  ));

  v_routine_id := case
    when p_patch ? 'routine_id' then nullif(p_patch->>'routine_id', '')
    else (select routine_id from public.coach_schedule where id = p_schedule_id)
  end;

  v_focus := case
    when p_patch ? 'focus' then nullif(p_patch->>'focus', '')
    else (select focus from public.coach_schedule where id = p_schedule_id)
  end;

  if v_routine_id is not null then
    select elem->>'name'
    into v_routine_name
    from public.students s,
         jsonb_array_elements(coalesce(s.routines, '[]'::jsonb)) elem
    where s.id = v_student_id and elem->>'id' = v_routine_id
    limit 1;

    if v_routine_name is not null then
      v_focus := coalesce(v_focus, v_routine_name);
    end if;
  end if;

  update public.coach_schedule
  set
    kind = v_kind,
    schedule_date = coalesce((p_patch->>'schedule_date')::date, schedule_date),
    schedule_time = case
      when v_kind = 'online' then null
      when p_patch ? 'schedule_time' then nullif(p_patch->>'schedule_time', '')::time
      else schedule_time
    end,
    place = case
      when v_kind = 'online' then null
      when p_patch ? 'place' then nullif(p_patch->>'place', '')
      else place
    end,
    focus = v_focus,
    routine_id = v_routine_id
  where id = p_schedule_id;
end;
$$;

create or replace function public.coach_delete_schedule(p_schedule_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.coach_owns_schedule(p_schedule_id) and not public.is_admin() then
    raise exception 'Forbidden';
  end if;

  delete from public.coach_schedule
  where id = p_schedule_id;
end;
$$;

grant execute on function public.coach_owns_schedule(uuid) to authenticated;
grant execute on function public.coach_update_schedule(uuid, jsonb) to authenticated;
grant execute on function public.coach_delete_schedule(uuid) to authenticated;
