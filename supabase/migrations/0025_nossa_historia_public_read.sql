-- "Nossa História" virou conteúdo editável (site_settings), mesmo padrão
-- de Diferenciais/Sobre nós — já incluindo as chaves na política pública
-- desde o início dessa vez (histórico: isso já foi esquecido 3 vezes).

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
    'social_youtube',
    'contact_phone',
    'contact_whatsapp_display',
    'contact_whatsapp_number',
    'contact_address',
    'nossa_historia_title',
    'nossa_historia_hero_image',
    'nossa_historia_body'
  ));
