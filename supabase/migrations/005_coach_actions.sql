-- Acciones del coach sobre alumnos (pagos, videos, rutina, agenda)

create or replace function public.coach_owns_student(p_student_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.user_is_coach_for(
    (select coach_id from public.students where id = p_student_id)
  );
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
    payments = coalesce(p_patch->'payments', payments),
    next_session = case
      when p_patch ? 'next_session' then p_patch->'next_session'
      else next_session
    end,
    updated_at = now()
  where id = p_student_id;
end;
$$;

create or replace function public.coach_publish_video_feedback(
  p_student_id uuid,
  p_video_id text,
  p_body text,
  p_exercise text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_coach_id uuid;
  v_videos jsonb;
  v_video jsonb;
  v_exercise text;
  v_routine jsonb;
  v_alerts jsonb;
  v_video_count int;
begin
  if not public.coach_owns_student(p_student_id) then
    raise exception 'Forbidden';
  end if;

  select coach_id, pending_videos, routine, alerts
  into v_coach_id, v_videos, v_routine, v_alerts
  from public.students
  where id = p_student_id;

  v_video := (
    select elem from jsonb_array_elements(v_videos) elem
    where elem->>'id' = p_video_id
    limit 1
  );

  if v_video is null then
    raise exception 'Video not found';
  end if;

  v_exercise := coalesce(p_exercise, v_video->>'exercise');

  insert into public.student_feedback (student_id, coach_id, feedback_type, exercise, body)
  values (p_student_id, v_coach_id, 'video_feedback', v_exercise, trim(p_body));

  v_videos := coalesce(
    (select jsonb_agg(elem) from jsonb_array_elements(v_videos) elem where elem->>'id' <> p_video_id),
    '[]'::jsonb
  );

  v_routine := (
    select coalesce(jsonb_agg(
      case
        when elem->>'name' = v_exercise then jsonb_set(elem, '{videoStatus}', '"done"')
        else elem
      end
    ), '[]'::jsonb)
    from jsonb_array_elements(v_routine) elem
  );

  v_video_count := jsonb_array_length(v_videos);
  v_alerts := jsonb_set(coalesce(v_alerts, '{}'::jsonb), '{videos}', to_jsonb(v_video_count));

  update public.students
  set pending_videos = v_videos,
      routine = v_routine,
      alerts = v_alerts,
      updated_at = now()
  where id = p_student_id;
end;
$$;

create or replace function public.coach_mark_payment_paid(p_student_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_payments jsonb;
begin
  if not public.coach_owns_student(p_student_id) then
    raise exception 'Forbidden';
  end if;

  select payments into v_payments from public.students where id = p_student_id;

  v_payments := (
    select coalesce(jsonb_agg(
      case
        when elem->>'status' in ('pending', 'review', 'overdue')
        then elem || jsonb_build_object(
          'status', 'paid',
          'confirmedAt', to_char(now(), 'DD/MM')
        )
        else elem
      end
    ), '[]'::jsonb)
    from jsonb_array_elements(v_payments) elem
  );

  update public.students
  set payment_status = 'paid',
      payments = v_payments,
      alerts = jsonb_set(coalesce(alerts, '{}'::jsonb), '{receipt}', '0'),
      updated_at = now()
  where id = p_student_id;
end;
$$;

create or replace function public.coach_request_receipt(p_student_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.coach_owns_student(p_student_id) then
    raise exception 'Forbidden';
  end if;

  update public.students
  set payment_status = 'pending',
      alerts = jsonb_set(coalesce(alerts, '{}'::jsonb), '{receipt}', '1'),
      updated_at = now()
  where id = p_student_id;
end;
$$;

create or replace function public.coach_add_schedule(
  p_student_id uuid,
  p_date date,
  p_kind text,
  p_time time default null,
  p_place text default null,
  p_focus text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_coach_id uuid;
  v_id uuid;
begin
  if not public.coach_owns_student(p_student_id) then
    raise exception 'Forbidden';
  end if;

  select coach_id into v_coach_id from public.students where id = p_student_id;

  insert into public.coach_schedule (coach_id, student_id, schedule_date, schedule_time, kind, place, focus)
  values (v_coach_id, p_student_id, p_date, p_time, p_kind, p_place, p_focus)
  returning id into v_id;

  return v_id;
end;
$$;

create or replace function public.coach_create_student(
  p_full_name text,
  p_email text,
  p_modality text default 'online',
  p_monthly_fee integer default 70000
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_coach_id uuid;
  v_id uuid;
begin
  select id into v_coach_id from public.coaches where user_id = auth.uid();
  if v_coach_id is null and not public.is_admin() then
    raise exception 'Forbidden';
  end if;

  insert into public.students (coach_id, full_name, email, modality, monthly_fee, billing_day, payment_status, payments)
  values (
    v_coach_id,
    trim(p_full_name),
    lower(trim(p_email)),
    p_modality,
    p_monthly_fee,
    1,
    'pending',
    jsonb_build_array(jsonb_build_object(
      'month', to_char(now(), 'TMMonth YYYY'),
      'amount', p_monthly_fee,
      'status', 'pending'
    ))
  )
  on conflict (coach_id, email) do update
  set full_name = excluded.full_name,
      modality = excluded.modality,
      monthly_fee = excluded.monthly_fee,
      updated_at = now()
  returning id into v_id;

  return v_id;
end;
$$;

create or replace function public.student_submit_video(
  p_exercise text,
  p_routine text default '',
  p_note text default ''
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_student_id uuid;
  v_videos jsonb;
  v_routine jsonb;
  v_alerts jsonb;
  v_video_id text;
begin
  select id, pending_videos, routine, alerts
  into v_student_id, v_videos, v_routine, v_alerts
  from public.students
  where user_id = auth.uid();

  if v_student_id is null then
    raise exception 'Student profile not found';
  end if;

  v_video_id := 'v-' || substr(gen_random_uuid()::text, 1, 8);

  v_videos := coalesce(v_videos, '[]'::jsonb) || jsonb_build_array(jsonb_build_object(
    'id', v_video_id,
    'exercise', trim(p_exercise),
    'routine', coalesce(nullif(trim(p_routine), ''), p_exercise),
    'sentAt', 'Hoy, ' || to_char(now(), 'HH24:MI'),
    'note', coalesce(p_note, '')
  ));

  v_routine := (
    select coalesce(jsonb_agg(
      case
        when elem->>'name' = trim(p_exercise)
        then jsonb_set(elem, '{videoStatus}', '"pending"')
        else elem
      end
    ), '[]'::jsonb)
    from jsonb_array_elements(coalesce(v_routine, '[]'::jsonb)) elem
  );

  v_alerts := jsonb_set(
    coalesce(v_alerts, '{}'::jsonb),
    '{videos}',
    to_jsonb(jsonb_array_length(v_videos))
  );

  update public.students
  set pending_videos = v_videos,
      routine = v_routine,
      alerts = v_alerts,
      updated_at = now()
  where id = v_student_id;
end;
$$;

grant execute on function public.coach_update_student(uuid, jsonb) to authenticated;
grant execute on function public.coach_publish_video_feedback(uuid, text, text, text) to authenticated;
grant execute on function public.coach_mark_payment_paid(uuid) to authenticated;
grant execute on function public.coach_request_receipt(uuid) to authenticated;
grant execute on function public.coach_add_schedule(uuid, date, text, time, text, text) to authenticated;
grant execute on function public.coach_create_student(text, text, text, integer) to authenticated;
grant execute on function public.student_submit_video(text, text, text) to authenticated;

-- Alumnos: actualizar su propia fila (solo rutina de lectura; videos vía RPC)
drop policy if exists "students_update_self" on public.students;
create policy "students_update_self"
  on public.students for update
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());
