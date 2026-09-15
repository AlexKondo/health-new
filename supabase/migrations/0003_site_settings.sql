-- Configurações simples do site, chave/valor (ex.: intervalo do carrossel de depoimentos).

create table if not exists public.site_settings (
  key   text primary key,
  value text
);

alter table public.site_settings enable row level security;

create policy site_settings_read on public.site_settings for select using (true);
create policy site_settings_admin_write on public.site_settings for all to authenticated using (true) with check (true);

insert into public.site_settings (key, value) values
  ('testimonials_interval_seconds', '3')
on conflict do nothing;
