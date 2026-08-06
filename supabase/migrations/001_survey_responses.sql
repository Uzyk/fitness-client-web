-- Tabla genérica para encuestas / formularios de discovery
-- Ejecutar en Supabase → SQL Editor (o via CLI migration)

create table if not exists survey_responses (
  id            uuid primary key default gen_random_uuid(),
  created_at    timestamptz not null default now(),
  survey_slug   text not null,
  survey_title  text,
  nombre        text,
  email         text,
  telefono      text,
  marca         text,
  respuestas    jsonb not null default '[]'::jsonb,
  raw           jsonb
);

create index if not exists survey_responses_slug_idx on survey_responses (survey_slug);
create index if not exists survey_responses_created_at_idx on survey_responses (created_at desc);

alter table survey_responses enable row level security;

-- Solo INSERT público (formularios anónimos). Sin SELECT para anon.
drop policy if exists "survey_responses_insert_anon" on survey_responses;
create policy "survey_responses_insert_anon"
  on survey_responses
  for insert
  to anon, authenticated
  with check (true);

comment on table survey_responses is 'Respuestas de encuestas web (template reutilizable por survey_slug)';
