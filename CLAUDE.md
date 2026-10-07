# Hub S.I. — Contexto do projeto

Site do D.A. de Sistemas de Informação da FAFRAM. Loja de produtos do curso em pré-venda por lotes (pagamento via Asaas), agenda de eventos, página Sobre com a gestão atual e painel admin. O site pertence ao curso; a chapa em exercício (hoje: OverFlow 2026) aparece como selo configurável no banco.

O plano de execução está em `PLAN.md`. O progresso fica registrado em `PROGRESS.md`.

## Stack

- Next.js (App Router, versão mais recente estável), TypeScript estrito, Tailwind CSS
- Supabase: Postgres + RLS, Auth (link mágico), Storage
- Asaas API v3 (pagamentos) + webhooks
- Resend (e-mail transacional)
- Vercel (hospedagem + Cron)
- Zod (validação), Vitest (testes unitários)
- Gerenciador de pacotes: **pnpm**. Nunca usar npm ou yarn.

## Comandos

```bash
pnpm typecheck   # tsc --noEmit
pnpm lint
pnpm test        # vitest run
pnpm build
pnpm db:push     # aplica migrations no projeto Supabase linkado
pnpm db:types    # gera src/types/database.ts
```

## Estrutura

```
src/
  app/
    (public)/            # home, loja, eventos, sobre, hub, privacidade, pedido, meus-pedidos
    admin/login/
    admin/(painel)/      # dashboard, lotes, produtos, pedidos, eventos, gestoes, hub, usuarios
    api/webhooks/asaas/route.ts
    api/cron/expirar-pedidos/route.ts
  components/
    ui/                  # botões, inputs, cards, badges
    brand/               # logo Hub S.I., trilhas de circuito, selo da gestão
    layout/              # header, footer, menu mobile
  lib/
    supabase/            # server.ts, client.ts, admin.ts (service role, server-only)
    asaas/               # client.ts, types.ts
    email/               # resend.ts + templates
    validators/          # cpf.ts, schemas zod
    auth/                # roles.ts (requireRole)
    utils/
  server/
    actions/             # server actions agrupadas por domínio
    queries/             # leituras agrupadas por domínio
  types/database.ts      # gerado, nunca editar à mão
supabase/
  migrations/
  seed.sql
```

## Convenções

- Server Components por padrão. `"use client"` só onde há estado ou evento do navegador.
- Mutações via Server Actions em `src/server/actions/`, sempre validando entrada com Zod.
- Todo arquivo em `src/lib/supabase/admin.ts`, `src/lib/asaas/` e `src/lib/email/` começa com `import "server-only"`.
- Nomes de tabelas, colunas e rotas em português, sem acento (`pedidos`, `itens_pedido`, `/loja`).
- Dinheiro em centavos (`integer`) no banco e no código. Formatação para BRL só na exibição.
- Datas em `timestamptz`; exibição em `America/Sao_Paulo`.
- Antes de usar uma API do Next.js, confira a versão instalada em `package.json` e siga a convenção dela (por exemplo, nome do arquivo de middleware/proxy, `cookies()` assíncrono). Na dúvida, consulte a documentação oficial da versão instalada.

## Identidade visual

- Tema **claro e moderno** (decisão de 2026-10: o azul-marinho escuro foi abandonado). Tokens em `src/app/globals.css` (Tailwind `@theme`):
  - Fundo `--color-bg: #F8F8FC`, cartões `--color-surface: #FFFFFF`, texto `--color-fg: #12122A`, apoio `--color-muted`.
  - Acento em degradê **ciano → violeta**: `--color-accent` (violeta, usado em texto/links/foco, AA sobre branco) e `--color-accent-2` (ciano). O degradê dos botões é o utilitário `bg-brand` (pontas escuras o bastante para texto branco). Texto sobre acento usa `text-on-accent`.
- Fontes via `next/font/google`: Bricolage Grotesque (títulos, sem caixa alta), Inter (texto), JetBrains Mono (preços, labels).
- Linguagem de circuito: trilhas SVG e nós circulares em degradê; hero com aurora (`AuroraBackground`), cartões com sombra suave e hover com elevação. Animações respeitam `prefers-reduced-motion`.
- Mobile first. Nada pode gerar rolagem horizontal em 360 px. Contraste WCAG AA.
- O estilo nunca atrapalha a compra: produto → pagamento em poucos toques.

## Regras de segurança (inegociáveis)

1. `ASAAS_API_KEY` e `SUPABASE_SERVICE_ROLE_KEY` só no servidor. Nunca com prefixo `NEXT_PUBLIC_`.
2. O webhook do Asaas rejeita com 401 qualquer requisição sem header `asaas-access-token` igual a `ASAAS_WEBHOOK_TOKEN` (comparação em tempo constante).
3. Webhook idempotente: evento já registrado em `webhook_eventos` é ignorado com 200.
4. Status de pedido só muda via webhook, cron ou ação de admin. Nunca por input do navegador.
5. Valor da cobrança calculado no servidor a partir do banco. Nunca confiar em preço vindo do front.
6. RLS ativo em todas as tabelas. CPF, e-mail e WhatsApp só legíveis por `admin` e `superadmin`.
7. CSV da gráfica e lista de retirada nunca incluem CPF.
8. Nenhum segredo em código, commit, log ou mensagem de erro.

## Regras de trabalho (modo auto)

- Siga `PLAN.md` na ordem. Uma fase por vez.
- Leia um arquivo antes de editá-lo.
- Nunca rode comandos interativos ou que ficam presos (`pnpm dev` em primeiro plano, prompts de CLI). Use flags não interativas. Se precisar do servidor de dev, rode em background com timeout e mate o processo depois.
- Ao fim de cada fase: `pnpm typecheck && pnpm lint && pnpm test` (e `pnpm build` quando a fase pedir). Só avance com tudo verde.
- Ao fim de cada fase: marque as tarefas em `PLAN.md`, adicione 2 a 5 linhas em `PROGRESS.md` (o que foi feito, decisões, pendências) e faça commit `feat(fase-N): <resumo>`.
- Variável de ambiente ausente: não invente valor. Use o fallback descrito no plano, registre em `PROGRESS.md` na seção "Bloqueios" e siga para o que não depende dela.
- Não instale dependência fora da lista do plano sem registrar o motivo em `PROGRESS.md`.
- Não edite `src/types/database.ts` à mão; regenere com `pnpm db:types`.
- Não altere migrations já aplicadas; crie uma nova.

## Fora do escopo

Login de aluno, frete/Correios, estoque contínuo, fórum/blog, tema configurável por gestão, inscrição própria em eventos (V3).
