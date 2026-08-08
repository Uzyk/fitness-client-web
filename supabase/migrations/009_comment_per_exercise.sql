-- Comentarios del coach vinculados a un ejercicio

create or replace function public.coach_add_comment(
  p_student_id uuid,
  p_body text,
  p_exercise text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_coach_id uuid;
  v_feedback_id uuid;
begin
  if nullif(trim(p_body), '') is null then
    raise exception 'El comentario no puede estar vacío';
  end if;

  select coach_id into v_coach_id
  from public.students
  where id = p_student_id;

  if v_coach_id is null then
    raise exception 'Student not found';
  end if;

  if not public.coach_owns_student(p_student_id) and not public.is_admin() then
    raise exception 'Forbidden';
  end if;

  insert into public.student_feedback (student_id, coach_id, feedback_type, exercise, body)
  values (
    p_student_id,
    v_coach_id,
    'comment',
    nullif(trim(p_exercise), ''),
    trim(p_body)
  )
  returning id into v_feedback_id;

  return v_feedback_id;
end;
$$;
