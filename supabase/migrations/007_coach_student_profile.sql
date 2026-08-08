-- Campos de perfil editables por el coach en coach_update_student

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

  if p_patch ? 'modality'
     and p_patch->>'modality' not in ('online', 'presencial', 'mixto') then
    raise exception 'Modalidad inválida';
  end if;

  if p_patch ? 'payment_status'
     and p_patch->>'payment_status' not in ('paid', 'pending', 'overdue', 'review') then
    raise exception 'Estado de pago inválido';
  end if;

  if p_patch ? 'full_name' and nullif(trim(p_patch->>'full_name'), '') is null then
    raise exception 'El nombre no puede estar vacío';
  end if;

  if p_patch ? 'email' and nullif(trim(p_patch->>'email'), '') is null then
    raise exception 'El email no puede estar vacío';
  end if;

  update public.students
  set
    full_name = coalesce(nullif(trim(p_patch->>'full_name'), ''), full_name),
    email = coalesce(nullif(trim(p_patch->>'email'), ''), email),
    modality = case
      when p_patch ? 'modality' then p_patch->>'modality'
      else modality
    end,
    monthly_fee = case
      when p_patch ? 'monthly_fee' then greatest(0, (p_patch->>'monthly_fee')::integer)
      else monthly_fee
    end,
    billing_day = case
      when p_patch ? 'billing_day' and (p_patch->>'billing_day') is null then null
      when p_patch ? 'billing_day' and nullif(trim(p_patch->>'billing_day'), '') is null then null
      when p_patch ? 'billing_day' then
        least(28, greatest(1, (p_patch->>'billing_day')::smallint))
      else billing_day
    end,
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
