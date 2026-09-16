-- Colunas do Kanban de agendamentos viram configuráveis (o admin pode criar
-- novas), e cada lead passa a registrar quem foi a última pessoa a mudar o
-- status e quando — pedido explícito pra rastrear quem moveu o card.

create table if not exists public.lead_statuses (
  id         uuid primary key default gen_random_uuid(),
  key        text not null unique,
  label      text not null,
  sort_order int not null default 0,
  is_default boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.lead_statuses enable row level security;

create policy lead_statuses_admin_all on public.lead_statuses
  for all to authenticated using (true) with check (true);

insert into public.lead_statuses (key, label, sort_order, is_default) values
  ('novo', 'Novo', 0, true),
  ('contatado', 'Contatado', 1, true),
  ('agendado', 'Agendado', 2, true),
  ('convertido', 'Convertido', 3, true),
  ('perdido', 'Perdido', 4, true)
on conflict (key) do nothing;

-- remove o check antigo (status in ('novo',...)) pra permitir colunas novas
do $$
declare
  con text;
begin
  select conname into con
    from pg_constraint
    where conrelid = 'public.leads'::regclass
      and contype = 'c'
      and pg_get_constraintdef(oid) ilike '%status%';
  if con is not null then
    execute format('alter table public.leads drop constraint %I', con);
  end if;
end $$;

alter table public.leads
  add column if not exists status_changed_by text,
  add column if not exists status_changed_at timestamptz;

alter table public.lead_statuses
  add column if not exists color text not null default '#e8f1f9',
  add column if not exists width_px int not null default 256;
