-- Largura de coluna do Kanban vira preferência por usuário (cada admin
-- redimensiona do seu jeito sem afetar a tela dos outros), em vez de um
-- valor único compartilhado em lead_statuses.

create table if not exists public.user_column_prefs (
  user_email text not null,
  column_id  uuid not null references public.lead_statuses(id) on delete cascade,
  width_px   int not null,
  updated_at timestamptz not null default now(),
  primary key (user_email, column_id)
);

alter table public.user_column_prefs enable row level security;

create policy user_column_prefs_own on public.user_column_prefs
  for all to authenticated
  using (user_email = auth.email())
  with check (user_email = auth.email());
