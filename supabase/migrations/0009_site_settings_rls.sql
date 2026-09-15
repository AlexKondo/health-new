-- site_settings tinha leitura pública para TODAS as chaves (necessário para
-- meta_pixel_id / google_tag_id / testimonials_interval_seconds, que o site
-- público precisa ler sem login). Os overrides do dashboard (visits_override,
-- avg_duration_override_seconds) não deveriam estar nessa mesma exposição.

drop policy if exists site_settings_read on public.site_settings;

create policy site_settings_public_read on public.site_settings for select
  using (key in ('meta_pixel_id', 'google_tag_id', 'testimonials_interval_seconds'));

create policy site_settings_admin_read on public.site_settings for select to authenticated using (true);
