-- Comprobantes de pago: storage + RPC alumno

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'payment-receipts',
  'payment-receipts',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "payment_receipts_select" on storage.objects;
create policy "payment_receipts_select"
  on storage.objects for select
  to authenticated
  using (bucket_id = 'payment-receipts');

drop policy if exists "payment_receipts_insert" on storage.objects;
create policy "payment_receipts_insert"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'payment-receipts'
    and exists (
      select 1
      from public.students s
      where s.user_id = auth.uid()
        and (storage.foldername(name))[1] = s.id::text
    )
  );

create or replace function public.student_submit_receipt(p_receipt_url text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_student_id uuid;
  v_payments jsonb;
  v_new_payments jsonb := '[]'::jsonb;
  v_elem jsonb;
  v_found boolean := false;
  v_monthly_fee integer;
begin
  if nullif(trim(p_receipt_url), '') is null then
    raise exception 'URL de comprobante requerida';
  end if;

  select id, payments, monthly_fee
  into v_student_id, v_payments, v_monthly_fee
  from public.students
  where user_id = auth.uid();

  if v_student_id is null then
    raise exception 'Student profile not found';
  end if;

  for v_elem in
    select value from jsonb_array_elements(coalesce(v_payments, '[]'::jsonb))
  loop
    if not v_found and v_elem->>'status' in ('pending', 'overdue') then
      v_new_payments := v_new_payments || jsonb_build_array(
        v_elem || jsonb_build_object(
          'status', 'review',
          'receiptUrl', trim(p_receipt_url),
          'submittedAt', to_char(now(), 'DD/MM')
        )
      );
      v_found := true;
    else
      v_new_payments := v_new_payments || jsonb_build_array(v_elem);
    end if;
  end loop;

  if not v_found then
    v_new_payments := v_new_payments || jsonb_build_array(jsonb_build_object(
      'month', to_char(now(), 'TMMonth YYYY'),
      'amount', v_monthly_fee,
      'status', 'review',
      'receiptUrl', trim(p_receipt_url),
      'submittedAt', to_char(now(), 'DD/MM')
    ));
  end if;

  update public.students
  set payment_status = 'review',
      payments = v_new_payments,
      alerts = jsonb_set(coalesce(alerts, '{}'::jsonb), '{receipt}', '1'),
      updated_at = now()
  where id = v_student_id;
end;
$$;

create or replace function public.coach_request_receipt(p_student_id uuid)
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
        when elem->>'status' = 'review'
        then (elem - 'receiptUrl') || jsonb_build_object('status', 'pending')
        else elem
      end
    ), '[]'::jsonb)
    from jsonb_array_elements(coalesce(v_payments, '[]'::jsonb)) elem
  );

  update public.students
  set payment_status = 'pending',
      payments = v_payments,
      alerts = jsonb_set(coalesce(alerts, '{}'::jsonb), '{receipt}', '1'),
      updated_at = now()
  where id = p_student_id;
end;
$$;

grant execute on function public.student_submit_receipt(text) to authenticated;
