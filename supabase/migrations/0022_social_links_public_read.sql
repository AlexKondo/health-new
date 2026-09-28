-- Links de redes sociais (editáveis em /admin/redes-sociais) usados no
-- rodapé e no menu — mesma pegadinha de RLS já corrigida antes: sem essas
-- chaves na política pública, o site sempre cai nos valores padrão.

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
    'diferenciais_body',
    'social_instagram',
    'social_facebook',
    'social_youtube'
  ));
