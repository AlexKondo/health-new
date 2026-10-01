-- Link do vídeo e thumbnail da seção "Um pouco sobre nós" viraram editáveis
-- no admin; precisam entrar na política pública igual todo o resto.

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
    'about_youtube_url',
    'about_youtube_thumb',
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
