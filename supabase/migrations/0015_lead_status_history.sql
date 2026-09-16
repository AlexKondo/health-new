-- Histórico completo de mudanças de status por lead (não só a última) —
-- cada arraste de card grava uma linha, então o card pode mostrar tudo
-- que já aconteceu com aquele agendamento.

create table if not exists public.lead_status_history (
  id         uuid primary key default gen_random_uuid(),
  lead_id    uuid not null references public.leads(id) on delete cascade,
  from_status text,
  to_status  text not null,
  changed_by text,
  changed_at timestamptz not null default now()
);

create index if not exists lead_status_history_lead_idx on public.lead_status_history (lead_id, changed_at);

alter table public.lead_status_history enable row level security;

create policy lead_status_history_admin_read on public.lead_status_history
  for select to authenticated using (true);

create policy lead_status_history_admin_write on public.lead_status_history
  for insert to authenticated with check (true);
