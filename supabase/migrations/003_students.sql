-- Alumnos vinculados a coaches + agenda y comentarios

create table if not exists public.students (
  id              uuid primary key default gen_random_uuid(),
  coach_id        uuid not null references public.coaches(id) on delete cascade,
  user_id         uuid references auth.users(id) on delete set null,
  full_name       text not null,
  email           text not null,
  modality        text not null default 'online'
                  check (modality in ('online', 'presencial', 'mixto')),
  monthly_fee     integer not null default 0,
  billing_day     smallint,
  payment_status  text not null default 'pending'
                  check (payment_status in ('paid', 'pending', 'overdue', 'review')),
  alerts          jsonb not null default '{"videos":0,"receipt":0}'::jsonb,
  next_session    jsonb,
  routine         jsonb not null default '[]'::jsonb,
  payments        jsonb not null default '[]'::jsonb,
  pending_videos  jsonb not null default '[]'::jsonb,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  unique (coach_id, email)
);

create index if not exists students_coach_id_idx on public.students (coach_id);
create index if not exists students_user_id_idx on public.students (user_id);

create table if not exists public.student_feedback (
  id              uuid primary key default gen_random_uuid(),
  student_id      uuid not null references public.students(id) on delete cascade,
  coach_id        uuid not null references public.coaches(id) on delete cascade,
  feedback_type   text not null default 'comment'
                  check (feedback_type in ('comment', 'video_feedback', 'correction')),
  exercise        text,
  body            text not null,
  created_at      timestamptz not null default now()
);

create index if not exists student_feedback_student_id_idx on public.student_feedback (student_id);

create table if not exists public.coach_schedule (
  id              uuid primary key default gen_random_uuid(),
  coach_id        uuid not null references public.coaches(id) on delete cascade,
  student_id      uuid not null references public.students(id) on delete cascade,
  schedule_date   date not null,
  schedule_time   time,
  kind            text not null check (kind in ('presencial', 'online')),
  place           text,
  focus           text,
  created_at      timestamptz not null default now()
);

create index if not exists coach_schedule_coach_date_idx on public.coach_schedule (coach_id, schedule_date);

-- ---------------------------------------------------------------------------
-- Helpers
-- ---------------------------------------------------------------------------

create or replace function public.coach_add_comment(p_student_id uuid, p_body text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_coach_id uuid;
  v_feedback_id uuid;
begin
  select coach_id into v_coach_id
  from public.students
  where id = p_student_id;

  if v_coach_id is null then
    raise exception 'Student not found';
  end if;

  if not exists (
    select 1 from public.coaches c
    where c.id = v_coach_id and c.user_id = auth.uid()
  ) and not public.is_admin() then
    raise exception 'Forbidden';
  end if;

  insert into public.student_feedback (student_id, coach_id, feedback_type, body)
  values (p_student_id, v_coach_id, 'comment', trim(p_body))
  returning id into v_feedback_id;

  return v_feedback_id;
end;
$$;

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------

alter table public.students enable row level security;
alter table public.student_feedback enable row level security;
alter table public.coach_schedule enable row level security;

drop policy if exists "students_select_coach_or_self" on public.students;
create policy "students_select_coach_or_self"
  on public.students for select
  to authenticated
  using (
    public.is_admin()
    or exists (
      select 1 from public.coaches c
      where c.id = students.coach_id and c.user_id = auth.uid()
    )
    or user_id = auth.uid()
  );

drop policy if exists "students_update_coach" on public.students;
create policy "students_update_coach"
  on public.students for update
  to authenticated
  using (
    exists (
      select 1 from public.coaches c
      where c.id = students.coach_id and c.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.coaches c
      where c.id = students.coach_id and c.user_id = auth.uid()
    )
  );

drop policy if exists "feedback_select_coach_or_self" on public.student_feedback;
create policy "feedback_select_coach_or_self"
  on public.student_feedback for select
  to authenticated
  using (
    public.is_admin()
    or exists (
      select 1 from public.coaches c
      where c.id = student_feedback.coach_id and c.user_id = auth.uid()
    )
    or exists (
      select 1 from public.students s
      where s.id = student_feedback.student_id and s.user_id = auth.uid()
    )
  );

drop policy if exists "feedback_insert_coach" on public.student_feedback;
create policy "feedback_insert_coach"
  on public.student_feedback for insert
  to authenticated
  with check (
    exists (
      select 1 from public.coaches c
      where c.id = student_feedback.coach_id and c.user_id = auth.uid()
    )
  );

drop policy if exists "schedule_select_coach_or_self" on public.coach_schedule;
create policy "schedule_select_coach_or_self"
  on public.coach_schedule for select
  to authenticated
  using (
    public.is_admin()
    or exists (
      select 1 from public.coaches c
      where c.id = coach_schedule.coach_id and c.user_id = auth.uid()
    )
    or exists (
      select 1 from public.students s
      where s.id = coach_schedule.student_id and s.user_id = auth.uid()
    )
  );

grant execute on function public.coach_add_comment(uuid, text) to authenticated;

comment on table public.students is 'Alumnos asignados a un coach';
comment on table public.student_feedback is 'Comentarios y correcciones del coach al alumno';
comment on table public.coach_schedule is 'Agenda presencial y entrenamientos online';
