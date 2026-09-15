-- Contador de visitas e tempo no site (rastreamento próprio, sem serviço externo).

create table if not exists public.visits (
  session_id        text primary key,
  first_seen        timestamptz not null default now(),
  last_seen         timestamptz not null default now(),
  duration_seconds  int not null default 0,
  pageviews         int not null default 1
);

alter table public.visits enable row level security;
create policy visits_admin_read on public.visits for select to authenticated using (true);

-- IDs de pixel/tag para tráfego pago (Meta Ads / Google Ads), configuráveis no admin.
insert into public.site_settings (key, value) values
  ('meta_pixel_id', ''),
  ('google_tag_id', '')
on conflict do nothing;
