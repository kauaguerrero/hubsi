# Hub S.I.

Site do D.A. de Sistemas de Informação da FAFRAM: loja de produtos do curso em pré-venda por lotes (pagamento via Asaas), agenda de eventos, página Sobre com a gestão atual e painel administrativo.

Stack: Next.js 16 (App Router) · TypeScript estrito · Tailwind 4 · Supabase (Postgres + RLS, Auth, Storage) · Asaas · Resend · Vercel.
Contexto e regras do projeto: [`CLAUDE.md`](CLAUDE.md). Plano e andamento: [`PLAN.md`](PLAN.md) e [`PROGRESS.md`](PROGRESS.md).

## Setup local

Requisitos: Node 20+ e pnpm (`corepack enable`).

```bash
pnpm install
cp .env.example .env.local   # preencha as variáveis (tabela abaixo)
pnpm supabase link --project-ref $SUPABASE_PROJECT_REF   # uma vez
pnpm db:push                                              # aplica as migrations
pnpm db:types                                             # gera src/types/database.ts
pnpm dev
```

Seed de desenvolvimento (gestão, lote, produtos, eventos, links): `pnpm supabase db push --include-seed`.

### Variáveis de ambiente

| Variável | Onde obter | Exposta ao navegador |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | URL do site (`http://localhost:3000` em dev) | sim |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Project Settings → API | sim |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → API (anon/publishable key) | sim |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → API (service role) | **não** |
| `SUPABASE_PROJECT_REF` | Supabase → General → Reference ID | não |
| `SUPABASE_ACCESS_TOKEN` | supabase.com/dashboard/account/tokens (CLI) | **não** |
| `SUPABASE_DB_PASSWORD` | Senha do banco definida na criação do projeto | **não** |
| `ASAAS_API_KEY` | Asaas → Integrações → API (use a do **sandbox** em dev) | **não** |
| `ASAAS_BASE_URL` | `https://api-sandbox.asaas.com/v3` (sandbox) ou `https://api.asaas.com/v3` | não |
| `ASAAS_WEBHOOK_TOKEN` | String aleatória com 32+ caracteres que você inventa | **não** |
| `RESEND_API_KEY` / `EMAIL_FROM` | Painel do Resend | **não** |
| `CRON_SECRET` | String aleatória com 16+ caracteres (a Vercel envia como `Bearer`) | **não** |

Gerar segredos: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`.
Nenhum segredo usa o prefixo `NEXT_PUBLIC_`. Sem as chaves do Asaas/Resend/cron o site funciona, mas o pagamento, o e-mail e o cron ficam indisponíveis.

## Comandos

```bash
pnpm dev         # servidor de desenvolvimento
pnpm typecheck   # next typegen + tsc --noEmit
pnpm lint
pnpm test        # vitest run
pnpm build
pnpm db:push     # aplica migrations no projeto linkado
pnpm db:types    # regenera src/types/database.ts (não edite à mão)
pnpm format
```

Scripts de verificação (rodam contra o projeto Supabase do `.env.local`; os dois se limpam sozinhos):

```bash
pnpm tsx --env-file=.env.local scripts/check-rls.mts          # anon não lê dados sensíveis
pnpm tsx --env-file=.env.local scripts/check-rls-papeis.mts   # RLS por papel (editor/admin/superadmin)
```

## Primeiro superadmin

1. Configure o Auth no Supabase (ver abaixo).
2. Crie o superadmin (usa a service role; rode só na sua máquina):

   ```bash
   pnpm tsx --env-file=.env.local scripts/criar-superadmin.mts voce@exemplo.com "Seu Nome"
   ```
3. Abra `/admin/login`, informe o e-mail e entre pelo link mágico. Os demais usuários são convidados em **Painel → Usuários**.

### Configuração do Auth no Supabase (obrigatória para o login)

Em **Authentication → URL Configuration**: defina **Site URL** (`NEXT_PUBLIC_SITE_URL`) e adicione em **Redirect URLs** `<SITE_URL>/auth/callback` (e `http://localhost:3000/auth/callback` em dev).

Em **Authentication → Email Templates**, ajuste os links para o fluxo por `token_hash` (funciona em convites e links mágicos):

- *Magic Link*: `<a href="{{ .SiteURL }}/auth/callback?token_hash={{ .TokenHash }}&type=magiclink">Entrar no painel</a>`
- *Invite user*: `<a href="{{ .SiteURL }}/auth/callback?token_hash={{ .TokenHash }}&type=invite">Aceitar convite</a>`

## Webhook do Asaas

No painel do Asaas (sandbox primeiro), em **Integrações → Webhooks**, crie um webhook com:

- **URL**: `https://SEU-DOMINIO/api/webhooks/asaas`
- **Token de autenticação**: o mesmo valor de `ASAAS_WEBHOOK_TOKEN` (o Asaas o envia no header `asaas-access-token`)
- **Eventos**: cobranças (`PAYMENT_RECEIVED`, `PAYMENT_CONFIRMED`, `PAYMENT_OVERDUE`, `PAYMENT_REFUNDED`)

O endpoint rejeita com 401 qualquer chamada sem o token, é idempotente (evento repetido é ignorado com 200) e só aplica transições válidas de status.

## Cron

`vercel.json` agenda `/api/cron/expirar-pedidos` diariamente (08:00 UTC). A Vercel envia `Authorization: Bearer $CRON_SECRET`; sem o segredo a rota responde 401. Ela cancela no Asaas e marca como `expirado` os pedidos aguardando pagamento de lotes fechados.

## Deploy (Vercel)

1. Importe o repositório e configure todas as variáveis acima em **Settings → Environment Variables** (Production e Preview; `ASAAS_BASE_URL` de produção só quando for ao ar).
2. Aplique as migrations no projeto Supabase de produção (`pnpm db:push`).
3. Cadastre o webhook do Asaas apontando para o domínio final.
4. Rode o checklist de [`docs/teste-sandbox.md`](docs/teste-sandbox.md) antes de abrir a loja.

## Checklist de transição de gestão

1. **Painel → Gestões → Nova gestão**: nome da chapa, slug, ano, descrição, logo e membros.
2. Um **superadmin** abre a gestão nova e clica em **Tornar gestão atual** (a anterior é desativada na mesma transação; o selo do site muda).
3. Convide os novos membros em **Usuários** e remova os acessos da gestão anterior (o sistema impede remover o último superadmin).
4. Confira a página **Sobre** e o selo no cabeçalho/rodapé.
5. Revise lotes abertos, produtos e links do Hub.

## Estrutura

```
src/app/           rotas (público em (public), painel em admin/(painel), APIs em api/)
src/components/    ui, brand, layout, loja, eventos, admin
src/lib/           supabase, asaas, email, validators, auth, utils
src/server/        actions, queries, webhooks, cron
supabase/          migrations e seed
scripts/           verificações de RLS e criação do superadmin
```
