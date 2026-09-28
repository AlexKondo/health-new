-- As chaves about_* (bloco "Um pouco sobre nós" da home) também precisam de
-- leitura pública, igual meta_pixel_id/google_tag_id/testimonials_interval_seconds
-- (ver 0009_site_settings_rls.sql) — sem isso, o site público sempre caía nos
-- valores padrão do código (a imagem em branco, por exemplo), mesmo com o
-- valor certo salvo no banco.

drop policy if exists site_settings_public_read on public.site_settings;

create policy site_settings_public_read on public.site_settings for select
  using (key in (
    'meta_pixel_id',
    'google_tag_id',
    'testimonials_interval_seconds',
    'about_title',
    'about_text',
    'about_cta_text',
    'about_cta_href',
    'about_image_url'
  ));
