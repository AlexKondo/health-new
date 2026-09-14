-- Adiciona o tempo de exibição (em segundos) de cada slide do banner
-- rotativo da home, editável pelo admin junto com foto, ordem e status.
alter table public.banners
  add column if not exists duration_seconds int not null default 6
    check (duration_seconds between 1 and 60);
