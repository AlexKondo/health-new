-- Histórico de envios de convite por e-mail, pra mostrar na tela de
-- Usuários quando cada convite foi mandado (inclui reenvios). Supabase não
-- guarda esse histórico sozinho; cada chamada a inviteUserByEmail() grava
-- uma linha aqui.

create table if not exists public.invite_sends (
  id      uuid primary key default gen_random_uuid(),
  email   text not null,
  sent_at timestamptz not null default now()
);

create index if not exists invite_sends_email_idx on public.invite_sends (email, sent_at desc);

alter table public.invite_sends enable row level security;
-- Sem políticas públicas: só acessada via service role no painel admin.
