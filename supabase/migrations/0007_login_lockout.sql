-- Bloqueio progressivo de login: erros seguidos bloqueiam por um tempo que
-- cresce a cada ciclo (1º ciclo: 3 erros -> 1min; ciclos seguintes: 5 erros
-- -> 5min, 20min, 1h; no 5º ciclo, bloqueia de vez — precisa ser
-- desbloqueado manualmente no banco). A lógica em si vive em
-- 0008_login_lockout_atomic.sql; esta migração só cria a tabela.

create table if not exists public.login_attempts (
  email                text primary key,
  fail_count           int not null default 0,
  lockout_stage        int not null default 0,
  locked_until         timestamptz,
  permanently_blocked  boolean not null default false,
  updated_at           timestamptz not null default now()
);

alter table public.login_attempts enable row level security;
-- Sem políticas públicas: só acessada via service role na API de login.
