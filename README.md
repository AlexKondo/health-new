# Escola Saúde — site + painel administrativo

Reformulação do site **escolasaude.com.br** em **Next.js 16 + Supabase**, com painel
administrativo próprio e três recursos novos:

1. **Banner principal programável** — o admin sobe a imagem e define um intervalo de
   datas (de/até) para datas comemorativas; o hero exibe automaticamente os banners vigentes.
2. **Depoimentos editáveis** pelo painel (migrados 60 depoimentos reais do site atual).
3. **WhatsApp com agente de IA** — bot (Claude) que responde dúvidas via WhatsApp Business API.

O conteúdo das 46 páginas e as imagens foram migrados do site original (WordPress).

## Stack

- Next.js 16 (App Router) + TypeScript + Tailwind v4
- Supabase: Postgres, Auth (login do admin), Storage (uploads)
- Claude API (`@anthropic-ai/sdk`) para o agente de WhatsApp
- WhatsApp Cloud API (Meta)
- Deploy: Docker (Coolify) — `output: standalone`

## Como funciona o conteúdo

As páginas leem de `lib/content.ts`, que busca no Supabase quando configurado e, caso
contrário, **cai para os JSON de seed** em `content/seed/`. Assim o site roda localmente
para preview mesmo sem credenciais.

## Rodando localmente

```bash
npm install
cp .env.example .env.local   # preencha quando tiver as credenciais
npm run dev                  # http://localhost:3000  (usa o seed se não houver Supabase)
```

## Configurando o Supabase

1. Crie um projeto em supabase.com e copie URL + anon key + service_role key para `.env.local`.
2. Rode o schema: cole `supabase/migrations/0001_init.sql` no **SQL Editor** do Supabase.
3. Semeie o banco e crie os buckets de Storage:
   ```bash
   npm run seed            # popula segmentos, atividades, FAQ, depoimentos, banners
   # npm run seed -- --force   # limpa e resemeia
   ```
4. Crie o usuário admin em **Authentication → Users → Add user** (email + senha).
5. Acesse `/admin/login`.

## Re-scraping do conteúdo (opcional)

```bash
npm run scrape                            # baixa imagens (public/images) + extrai páginas
npx tsx scripts/scrape-testimonials.ts    # extrai os depoimentos
npx tsx scripts/build-seed.ts             # recompila content/seed/*.json
```
> Observação: a rota `/depoimentos` é protegida por WAF; o `scrape-testimonials` lê o HTML
> salvo via `Invoke-WebRequest` (ver comentário no script).

## Agente de WhatsApp

- Configure um app no **Meta for Developers** com o produto WhatsApp.
- Webhook (callback URL): `https://SEU_DOMINIO/api/whatsapp/webhook`
- Verify token: o valor de `WHATSAPP_VERIFY_TOKEN` (você define).
- Assine o campo `messages`.
- Env: `WHATSAPP_TOKEN`, `WHATSAPP_PHONE_NUMBER_ID`, `WHATSAPP_VERIFY_TOKEN`,
  `ANTHROPIC_API_KEY`, `WHATSAPP_AGENT_MODEL` (padrão `claude-haiku-4-5`).
- A base de conhecimento (`lib/knowledge.ts`) é montada de FAQ + segmentos + dados fixos.
  O agente **não inventa valores/vagas** — encaminha para a secretaria.
- No painel `/admin/whatsapp` é possível **pausar o bot** por contato (atendimento humano).

## Deploy (Coolify)

1. Aponte o Coolify para o repositório; build via `Dockerfile`.
2. Passe as `NEXT_PUBLIC_*` como **build args** (são embutidas no bundle) e as demais como
   variáveis de ambiente de runtime.
3. Porta interna: `3000`.
4. Aponte o domínio `escolasaude.com.br` para o serviço.

As URLs seguem os mesmos slugs do site atual (`/bercario`, `/nossa-historia`, …), preservando o SEO.

## Estrutura

```
app/(site)         site público (home + rotas migradas)
app/admin          painel (login + (panel): banners, depoimentos, leads, whatsapp)
app/api            leads + webhook do WhatsApp
components/site     Header, Footer, Hero, carrosséis, formulário, etc.
components/admin    formulários do painel
lib/               supabase clients, content, agent, whatsapp, knowledge
content/seed       dados migrados (fallback + fonte do seeder)
public/images      224 imagens do site (originais, sem duplicatas)
scripts/           scrape, build-seed, seed-from-scrape
supabase/migrations  schema + RLS
```
