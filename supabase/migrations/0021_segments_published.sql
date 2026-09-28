-- Mesmo padrão de "Publicar página" que Diferenciais e que já existe em
-- testimonials/faq: segmentos (Berçário, Educação Infantil, Ensino
-- Fundamental I) agora podem ser tirados do ar pelo admin sem apagar o
-- conteúdo. Default true pra não esconder nada que já está publicado.

alter table public.segments add column if not exists published boolean not null default true;
