# Progresso — Hub S.I.

## Fases concluídas

- **Fase 1 — Bootstrap:** app Next 16 + Tailwind 4 na raiz, dependências do plano, scripts, vitest (1 teste), tsconfig estrito com `noUncheckedIndexedAccess`, estrutura de pastas, `.env.example`, `env.ts`. `typecheck`, `lint`, `test` e `build` verdes. `typecheck` roda `next typegen` antes do `tsc` (tipos globais `LayoutProps`).

## Decisões

- Next.js 16.3.8 (App Router). `create-next-app` recusou o nome `HubSI` (maiúsculas), então o app foi gerado em pasta irmã e movido para a raiz; `package.json` usa o nome `hubsi`.
- `tsx` adicionado às devDependencies (necessário para rodar `scripts/*.ts` conforme o plano).
- `pnpm-workspace.yaml`: `allowBuilds` liberado para `esbuild` e `supabase` (a CLI baixa o binário no postinstall).
- MCP do Supabase configurado em `.mcp.json` (escopo de projeto, project_ref `eaugpdoziwhulzjybdpw`); autenticação via `/mcp` pendente.
- `src/lib/env.ts` (público) e `src/lib/env.server.ts` (`server-only`, validação sob demanda via `getServerEnv()`).

## Bloqueios

- `.env.local` não existe. Faltam todas as variáveis da Fase 0 (Supabase URL/keys/token/senha, Asaas, Resend, `CRON_SECRET`).
