-- Carrossel de fotos na página "Nossa História": galeria em tabela dedicada
-- (mesmo padrão de infra_photos/partners) + intervalo de troca configurável.

create table if not exists public.nossa_historia_photos (
  id          uuid primary key default gen_random_uuid(),
  image_url   text not null,
  sort_order  int  not null default 0,
  created_at  timestamptz not null default now()
);

alter table public.nossa_historia_photos enable row level security;

create policy nossa_historia_photos_read on public.nossa_historia_photos for select using (true);
create policy nossa_historia_photos_admin_write on public.nossa_historia_photos for all to authenticated using (true) with check (true);

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
    'nossa_historia_body',
    'nossa_historia_carousel_interval_seconds',
    'infra_title',
    'infra_hero_image',
    'infra_body'
  ));
