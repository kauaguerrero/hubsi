# Progresso — Hub S.I.

## Fases concluídas

- **Fase 1 — Bootstrap:** app Next 16 + Tailwind 4 na raiz, dependências do plano, scripts, vitest (1 teste), tsconfig estrito com `noUncheckedIndexedAccess`, estrutura de pastas, `.env.example`, `env.ts`. `typecheck`, `lint`, `test` e `build` verdes. `typecheck` roda `next typegen` antes do `tsc` (tipos globais `LayoutProps`).

- **Fase 2 — Banco:** migrations 0001–0003 aplicadas no projeto remoto, seed aplicado (`db push --include-seed`), `database.ts` gerado, `scripts/check-rls.mts` (rodar com `pnpm tsx --env-file=.env.local scripts/check-rls.mts`) confirma RLS: anon não lê pedidos/clientes/itens/webhook/rate_limits/log/perfis e lê o conteúdo público.
- **Fase 3:** clients Supabase (server/client/admin), validadores (CPF, Zod), utilitários (money, datas, código de pedido), `requireRole`. 20 testes verdes.
- **Fase 4:** tokens e fontes (Barlow/Barlow Condensed/JetBrains Mono), componentes ui e brand (logo, CircuitTrace, SeloGestao), Header/MenuMobile/Footer, layout público com revalidate 5 min, 404 StackOverflowError e console.log em produção. Build verde.
- **Fase 5:** home (hero, próximo evento com contagem, produtos do lote), /eventos em trilha, /eventos/[slug] (+ .ics, Google Agenda, OG), /sobre, /hub, /privacidade. Smoke test em produção local: todas as rotas 200, 404 ok. 24 testes.
- **Fase 6:** /loja, /loja/[slug] (galeria, variações, medidas, OG), carrinho, /checkout, server actions `criarPedido` (rate limit, preço do banco, cliente por CPF) e `consultarPedido`, /pedido/[codigo], /meus-pedidos. 36 testes (cálculo, lote fechado, preço manipulado, carrinho). Operações de banco validadas com script descartável.

## Decisões

- Carrinho: store em módulo + `useSyncExternalStore` (`src/lib/carrinho-store.ts`, hook `use-carrinho.ts`), com `sessionStorage` em try/catch. `/pedido/[codigo]` usa `revalidate = 0` (o layout público tem 300).
- `env.server.ts` separado por domínio (`getSupabaseServerEnv`, `getAsaasEnv`, `getEmailEnv`, `getCronEnv`) para a falta do Asaas não derrubar o resto.
- Com o stub do Asaas, `criarPedido` cancela o pedido e mostra "pagamento ainda não disponível" (comportamento definitivo de falha previsto na Fase 7). Limite de unidades do lote é checado sem lock: corrida possível em compras simultâneas no limite (aceito no MVP).
- **A confirmar com o D.A.:** medidas da tabela de camisa (`tabela-medidas.tsx`) são valores de referência.

- OG dinâmica: feita para eventos na Fase 5; a de produto entra na Fase 6 junto com `/loja/[slug]`. `next.config.ts` libera `*.supabase.co` para `next/image`. Revalidação: `revalidate = 300` no layout público; as actions do admin (Fase 8) devem chamar `revalidatePath("/", "layout")`.

- Leituras públicas usam `createPublicClient()` (`src/lib/supabase/public.ts`, anon sem cookies) para permitir ISR; o client com cookies fica para áreas autenticadas.

- Next.js 16.3.8 (App Router). `create-next-app` recusou o nome `HubSI` (maiúsculas), então o app foi gerado em pasta irmã e movido para a raiz; `package.json` usa o nome `hubsi`.
- `tsx` adicionado às devDependencies (necessário para rodar `scripts/*.ts` conforme o plano).
- `pnpm-workspace.yaml`: `allowBuilds` liberado para `esbuild` e `supabase` (a CLI baixa o binário no postinstall).
- MCP do Supabase configurado em `.mcp.json` (escopo de projeto, project_ref `eaugpdoziwhulzjybdpw`); autenticação via `/mcp` pendente.
- `checar_rate_limit` usa parâmetros `p_chave`, `p_limite`, `p_janela_segundos` (evita ambiguidade com a coluna `chave`). Policies de admin usam `for all`; `log_acoes` aceita insert de qualquer papel admin.
- `src/lib/env.ts` (público) e `src/lib/env.server.ts` (`server-only`, validação sob demanda via `getServerEnv()`).

## Bloqueios

- **STANDBY — Asaas/e-mail/cron (retomar depois):** `.env.local` sem `ASAAS_API_KEY`, `ASAAS_WEBHOOK_TOKEN`, `RESEND_API_KEY`, `EMAIL_FROM` e `CRON_SECRET`. Fase 7 será implementada com `fetch` mockado (sem teste contra o sandbox real). Pendente para quando houver chaves: testar cobrança Pix/cartão no sandbox, configurar webhook no painel do Asaas (URL `/api/webhooks/asaas` + token), validar envio de e-mail e cron na Vercel, conferir campos da API do Asaas na documentação vigente.


- `.env.local` não existe. Faltam todas as variáveis da Fase 0 (Supabase URL/keys/token/senha, Asaas, Resend, `CRON_SECRET`).
