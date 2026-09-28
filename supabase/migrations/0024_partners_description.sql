-- A tabela partners já existia (name, logo_url, link_url, sort_order) mas
-- nunca tinha sido usada/exposta no admin nem no site público. Falta um
-- campo de texto pra descrever cada parceiro (o que hoje é só um parágrafo
-- solto na página estática de "Parceiros").

alter table public.partners add column if not exists description text;
