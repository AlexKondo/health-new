-- Números editáveis da faixa de estatísticas (StatsStrip) na home.

create table if not exists public.stats (
  id          uuid primary key default gen_random_uuid(),
  value       int  not null default 0,
  suffix      text not null default '',
  label       text not null,
  sort_order  int  not null default 0,
  created_at  timestamptz not null default now()
);

alter table public.stats enable row level security;

create policy stats_read on public.stats for select using (true);
create policy stats_admin_write on public.stats for all to authenticated using (true) with check (true);

insert into public.stats (value, suffix, label, sort_order) values
  (30, '+', 'anos de história', 0),
  (150, '+', 'alunos', 1),
  (18, '', 'atividades', 2),
  (5, '★', 'avaliação das famílias', 3)
on conflict do nothing;
