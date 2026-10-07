# Progresso — Hub S.I.

## Fases concluídas

- **Fase 1 — Bootstrap:** app Next 16 + Tailwind 4 na raiz, dependências do plano, scripts, vitest (1 teste), tsconfig estrito com `noUncheckedIndexedAccess`, estrutura de pastas, `.env.example`, `env.ts`. `typecheck`, `lint`, `test` e `build` verdes. `typecheck` roda `next typegen` antes do `tsc` (tipos globais `LayoutProps`).

- **Fase 2 — Banco (parcial):** migrations `0001_schema`, `0002_rls`, `0003_funcoes`, `seed.sql`, `src/types/database.ts` mínimo (à mão, com aviso) e `scripts/check-rls.ts`. `supabase init` feito; `link`, `db:push` e `db:types` NÃO rodados. SQL não validado localmente (sem Docker).

## Decisões

- Next.js 16.3.8 (App Router). `create-next-app` recusou o nome `HubSI` (maiúsculas), então o app foi gerado em pasta irmã e movido para a raiz; `package.json` usa o nome `hubsi`.
- `tsx` adicionado às devDependencies (necessário para rodar `scripts/*.ts` conforme o plano).
- `pnpm-workspace.yaml`: `allowBuilds` liberado para `esbuild` e `supabase` (a CLI baixa o binário no postinstall).
- MCP do Supabase configurado em `.mcp.json` (escopo de projeto, project_ref `eaugpdoziwhulzjybdpw`); autenticação via `/mcp` pendente.
- `checar_rate_limit` usa parâmetros `p_chave`, `p_limite`, `p_janela_segundos` (evita ambiguidade com a coluna `chave`). Policies de admin usam `for all`; `log_acoes` aceita insert de qualquer papel admin.
- `src/lib/env.ts` (público) e `src/lib/env.server.ts` (`server-only`, validação sob demanda via `getServerEnv()`).

## Bloqueios

- Fase 2: `SUPABASE_ACCESS_TOKEN` e `SUPABASE_PROJECT_REF` vazios no `.env.local` → falta `supabase link`, `pnpm db:push`, `pnpm db:types` e rodar `pnpm tsx --env-file=.env.local scripts/check-rls.ts`.

- `.env.local` não existe. Faltam todas as variáveis da Fase 0 (Supabase URL/keys/token/senha, Asaas, Resend, `CRON_SECRET`).
