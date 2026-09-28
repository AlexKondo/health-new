-- Página "Diferenciais" virou conteúdo editável (site_settings), igual o
-- bloco "Sobre nós" — precisa das mesmas chaves na política de leitura
-- pública, senão o site cai sempre nos valores padrão do código (mesmo bug
-- de 0018_about_settings_public_read.sql).

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
    'about_image_url',
    'diferenciais_published',
    'diferenciais_title',
    'diferenciais_hero_image',
    'diferenciais_body'
  ));
