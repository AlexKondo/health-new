-- Carrossel de fotos por página interna (atividades, segmentos e páginas
-- institucionais) + edição das páginas estáticas pelo admin.

alter table public.activities add column if not exists show_carousel boolean not null default true;
alter table public.activities add column if not exists carousel_interval_seconds int not null default 3;
alter table public.segments add column if not exists show_carousel boolean not null default true;
alter table public.segments add column if not exists carousel_interval_seconds int not null default 3;

-- Fotos do carrossel de qualquer página, identificadas pelo slug da página.
create table if not exists public.page_photos (
  id          uuid primary key default gen_random_uuid(),
  page_slug   text not null,
  image_url   text not null,
  sort_order  int  not null default 0,
  created_at  timestamptz not null default now()
);
create index if not exists page_photos_slug_idx on public.page_photos (page_slug, sort_order);

alter table public.page_photos enable row level security;
create policy page_photos_read on public.page_photos for select using (true);
create policy page_photos_admin_write on public.page_photos for all to authenticated using (true) with check (true);

-- Conteúdo editável das páginas estáticas (Missão/Visão, Política, etc.).
-- Se não houver linha para o slug, o site usa o texto original do build.
create table if not exists public.site_pages (
  id                          uuid primary key default gen_random_uuid(),
  slug                        text unique not null,
  title                       text not null,
  hero_image                  text,
  body                        text,
  show_carousel               boolean not null default true,
  carousel_interval_seconds   int not null default 3,
  updated_at                  timestamptz not null default now()
);

alter table public.site_pages enable row level security;
create policy site_pages_read on public.site_pages for select using (true);
create policy site_pages_admin_write on public.site_pages for all to authenticated using (true) with check (true);

-- Bucket público para fotos/banners das páginas internas.
insert into storage.buckets (id, name, public) values ('pages', 'pages', true) on conflict (id) do nothing;
