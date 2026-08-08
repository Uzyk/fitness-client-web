-- Fix RLS recursion between students <-> coaches policies

create or replace function public.user_is_coach_for(p_coach_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.coaches
    where id = p_coach_id and user_id = auth.uid()
  );
$$;

create or replace function public.user_is_student_of_coach(p_coach_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.students
    where coach_id = p_coach_id and user_id = auth.uid()
  );
$$;

create or replace function public.user_owns_student(p_student_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.students
    where id = p_student_id and user_id = auth.uid()
  );
$$;

drop policy if exists "students_select_coach_or_self" on public.students;
create policy "students_select_coach_or_self"
  on public.students for select
  to authenticated
  using (
    public.is_admin()
    or public.user_is_coach_for(coach_id)
    or user_id = auth.uid()
  );

drop policy if exists "students_update_coach" on public.students;
create policy "students_update_coach"
  on public.students for update
  to authenticated
  using (public.user_is_coach_for(coach_id))
  with check (public.user_is_coach_for(coach_id));

drop policy if exists "coaches_select_assigned_student" on public.coaches;
create policy "coaches_select_assigned_student"
  on public.coaches for select
  to authenticated
  using (public.user_is_student_of_coach(id));

drop policy if exists "feedback_select_coach_or_self" on public.student_feedback;
create policy "feedback_select_coach_or_self"
  on public.student_feedback for select
  to authenticated
  using (
    public.is_admin()
    or public.user_is_coach_for(coach_id)
    or public.user_owns_student(student_id)
  );

drop policy if exists "feedback_insert_coach" on public.student_feedback;
create policy "feedback_insert_coach"
  on public.student_feedback for insert
  to authenticated
  with check (public.user_is_coach_for(coach_id));

drop policy if exists "schedule_select_coach_or_self" on public.coach_schedule;
create policy "schedule_select_coach_or_self"
  on public.coach_schedule for select
  to authenticated
  using (
    public.is_admin()
    or public.user_is_coach_for(coach_id)
    or public.user_owns_student(student_id)
  );

grant execute on function public.user_is_coach_for(uuid) to authenticated;
grant execute on function public.user_is_student_of_coach(uuid) to authenticated;
grant execute on function public.user_owns_student(uuid) to authenticated;
