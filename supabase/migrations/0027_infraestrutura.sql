-- "Infraestrutura" vira página editável no admin: título/texto/banner em
-- site_settings (mesmo padrão de Nossa História) e a galeria de fotos em
-- uma tabela dedicada (mesmo padrão de parceiros), já que é uma lista.

create table if not exists public.infra_photos (
  id          uuid primary key default gen_random_uuid(),
  image_url   text not null,
  sort_order  int  not null default 0,
  created_at  timestamptz not null default now()
);

alter table public.infra_photos enable row level security;

create policy infra_photos_read on public.infra_photos for select using (true);
create policy infra_photos_admin_write on public.infra_photos for all to authenticated using (true) with check (true);

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
    'infra_title',
    'infra_hero_image',
    'infra_body'
  ));
