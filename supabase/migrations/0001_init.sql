-- Escola Saúde — schema inicial
-- Tabelas de conteúdo + leads + histórico WhatsApp, com RLS.

-- ---------------------------------------------------------------------------
-- Tabelas
-- ---------------------------------------------------------------------------

create table if not exists public.banners (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  image_url   text not null,
  link_url    text,
  alt         text,
  sort_order  int  not null default 0,
  starts_at   date,             -- null = sem início definido
  ends_at     date,             -- null = sem fim definido
  active      boolean not null default true,
  created_at  timestamptz not null default now()
);

create table if not exists public.testimonials (
  id           uuid primary key default gen_random_uuid(),
  author_name  text not null,
  role         text not null default 'pai_responsavel'
                 check (role in ('pai_responsavel','ex_aluno','colaborador')),
  photo_url    text,
  rating       int  not null default 5 check (rating between 1 and 5),
  text         text not null,
  published    boolean not null default true,
  sort_order   int  not null default 0,
  created_at   timestamptz not null default now()
);

create table if not exists public.segments (
  id          uuid primary key default gen_random_uuid(),
  slug        text unique not null,
  title       text not null,
  hero_image  text,
  age_range   text,
  intro       text,
  schedule    jsonb not null default '[]'::jsonb,  -- [{label,from,to}]
  body        text,                                -- markdown
  gallery     jsonb not null default '[]'::jsonb,  -- [url,...]
  card_image  text,                                -- foto 16:9 para cards
  sort_order  int  not null default 0,
  created_at  timestamptz not null default now()
);

create table if not exists public.activities (
  id          uuid primary key default gen_random_uuid(),
  slug        text unique not null,
  title       text not null,
  category    text not null default 'extracurricular'
                 check (category in ('curricular','extracurricular')),
  hero_image  text,
  tile_image  text,                                -- foto quadrada para tiles
  body        text,
  sort_order  int  not null default 0,
  created_at  timestamptz not null default now()
);

create table if not exists public.faq (
  id          uuid primary key default gen_random_uuid(),
  question    text not null,
  answer      text not null,
  sort_order  int  not null default 0,
  published   boolean not null default true,
  created_at  timestamptz not null default now()
);

create table if not exists public.team (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  role        text,
  photo_url   text,
  sort_order  int  not null default 0,
  created_at  timestamptz not null default now()
);

create table if not exists public.partners (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  logo_url    text,
  link_url    text,
  sort_order  int  not null default 0,
  created_at  timestamptz not null default now()
);

create table if not exists public.leads (
  id           uuid primary key default gen_random_uuid(),
  name         text not null,
  email        text,
  phone        text,
  child_grade  text,
  period       text,
  message      text,
  status       text not null default 'novo'
                 check (status in ('novo','contatado','agendado','convertido','perdido')),
  created_at   timestamptz not null default now()
);

create table if not exists public.wa_contacts (
  phone        text primary key,
  name         text,
  bot_paused   boolean not null default false,
  updated_at   timestamptz not null default now()
);

create table if not exists public.wa_messages (
  id           bigint generated always as identity primary key,
  phone        text not null references public.wa_contacts(phone) on delete cascade,
  direction    text not null check (direction in ('in','out')),
  content      text not null,
  created_at   timestamptz not null default now()
);

create index if not exists wa_messages_phone_idx on public.wa_messages (phone, created_at);
create index if not exists banners_window_idx on public.banners (active, starts_at, ends_at);

-- View: banners vigentes hoje (consumida pelo hero público).
create or replace view public.active_banners as
  select * from public.banners
  where active
    and (starts_at is null or starts_at <= current_date)
    and (ends_at   is null or ends_at   >= current_date)
  order by sort_order, created_at;

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------
alter table public.banners       enable row level security;
alter table public.testimonials  enable row level security;
alter table public.segments      enable row level security;
alter table public.activities    enable row level security;
alter table public.faq           enable row level security;
alter table public.team          enable row level security;
alter table public.partners      enable row level security;
alter table public.leads         enable row level security;
alter table public.wa_contacts   enable row level security;
alter table public.wa_messages   enable row level security;

-- Leitura pública (anon + authenticated) das tabelas de conteúdo.
-- Banners: só os vigentes para o público; admin lê tudo.
create policy banners_public_read on public.banners for select
  using ( active
          and (starts_at is null or starts_at <= current_date)
          and (ends_at   is null or ends_at   >= current_date) );
create policy banners_admin_read on public.banners for select to authenticated using (true);

create policy testimonials_public_read on public.testimonials for select using (published);
create policy testimonials_admin_read on public.testimonials for select to authenticated using (true);

create policy segments_read   on public.segments   for select using (true);
create policy activities_read  on public.activities  for select using (true);
create policy team_read        on public.team        for select using (true);
create policy partners_read    on public.partners    for select using (true);
create policy faq_public_read  on public.faq         for select using (published);
create policy faq_admin_read   on public.faq         for select to authenticated using (true);

-- Escrita: apenas usuários autenticados (admin).
do $$
declare t text;
begin
  foreach t in array array['banners','testimonials','segments','activities','faq','team','partners','leads']
  loop
    execute format('create policy %1$s_admin_write on public.%1$s for all to authenticated using (true) with check (true);', t);
  end loop;
end $$;

-- leads / wa_*: leitura só admin (insert acontece via service-role nas API routes).
create policy leads_admin_read   on public.leads       for select to authenticated using (true);
create policy wa_contacts_admin  on public.wa_contacts for all    to authenticated using (true) with check (true);
create policy wa_messages_admin  on public.wa_messages for select to authenticated using (true);
