-- Admin: eliminar coaches/alumnos y listar alumnos sin datos de precios

create or replace function public.admin_delete_coach(p_coach_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid;
begin
  if not public.is_admin() then
    raise exception 'Forbidden: admin only';
  end if;

  select user_id into v_user_id
  from public.coaches
  where id = p_coach_id;

  if not found then
    raise exception 'Coach not found';
  end if;

  delete from public.coaches where id = p_coach_id;

  if v_user_id is not null then
    update public.profiles
    set role = 'student', updated_at = now()
    where id = v_user_id and role = 'coach';
  end if;
end;
$$;

create or replace function public.admin_delete_student(p_student_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid;
begin
  if not public.is_admin() then
    raise exception 'Forbidden: admin only';
  end if;

  select user_id into v_user_id
  from public.students
  where id = p_student_id;

  if not found then
    raise exception 'Alumno not found';
  end if;

  delete from public.students where id = p_student_id;

  if v_user_id is not null then
    update public.profiles
    set role = 'student', updated_at = now()
    where id = v_user_id and role = 'student';
  end if;
end;
$$;

create or replace function public.admin_list_coach_students(p_coach_id uuid)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_result json;
begin
  if not public.is_admin() then
    raise exception 'Forbidden: admin only';
  end if;

  if not exists (select 1 from public.coaches where id = p_coach_id) then
    raise exception 'Coach not found';
  end if;

  select coalesce(json_agg(row_to_json(t) order by t.created_at desc), '[]'::json)
  into v_result
  from (
    select
      s.id,
      s.full_name,
      s.email,
      s.modality,
      s.user_id is not null as has_account,
      s.created_at,
      (
        select json_build_object(
          'token', si.token,
          'accepted_at', si.accepted_at,
          'expires_at', si.expires_at
        )
        from public.student_invitations si
        where si.student_id = s.id
        order by si.created_at desc
        limit 1
      ) as invitation
    from public.students s
    where s.coach_id = p_coach_id
  ) t;

  return v_result;
end;
$$;

grant execute on function public.admin_delete_coach(uuid) to authenticated;
grant execute on function public.admin_delete_student(uuid) to authenticated;
grant execute on function public.admin_list_coach_students(uuid) to authenticated;
