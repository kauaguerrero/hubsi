# Progresso — Hub S.I.

## Fases concluídas

- **Fase 1 — Bootstrap:** app Next 16 + Tailwind 4 na raiz, dependências do plano, scripts, vitest (1 teste), tsconfig estrito com `noUncheckedIndexedAccess`, estrutura de pastas, `.env.example`, `env.ts`. `typecheck`, `lint`, `test` e `build` verdes. `typecheck` roda `next typegen` antes do `tsc` (tipos globais `LayoutProps`).

- **Fase 2 — Banco:** migrations 0001–0003 aplicadas no projeto remoto, seed aplicado (`db push --include-seed`), `database.ts` gerado, `scripts/check-rls.mts` (rodar com `pnpm tsx --env-file=.env.local scripts/check-rls.mts`) confirma RLS: anon não lê pedidos/clientes/itens/webhook/rate_limits/log/perfis e lê o conteúdo público.
- **Fase 3:** clients Supabase (server/client/admin), validadores (CPF, Zod), utilitários (money, datas, código de pedido), `requireRole`. 20 testes verdes.
- **Fase 4:** tokens e fontes (Barlow/Barlow Condensed/JetBrains Mono), componentes ui e brand (logo, CircuitTrace, SeloGestao), Header/MenuMobile/Footer, layout público com revalidate 5 min, 404 StackOverflowError e console.log em produção. Build verde.
- **Fase 5:** home (hero, próximo evento com contagem, produtos do lote), /eventos em trilha, /eventos/[slug] (+ .ics, Google Agenda, OG), /sobre, /hub, /privacidade. Smoke test em produção local: todas as rotas 200, 404 ok. 24 testes.
- **Fase 6:** /loja, /loja/[slug] (galeria, variações, medidas, OG), carrinho, /checkout, server actions `criarPedido` (rate limit, preço do banco, cliente por CPF) e `consultarPedido`, /pedido/[codigo], /meus-pedidos. 36 testes (cálculo, lote fechado, preço manipulado, carrinho). Operações de banco validadas com script descartável.
- **Fase 7:** client Asaas tipado (customers, payments, pixQrCode, DELETE), `criarCobranca` real ligada ao `criarPedido`, página do pedido com QR/copia-e-cola/link de cartão e polling, webhook idempotente com token em tempo constante, e-mail Resend (sem chave só loga em dev), cron de expiração + `vercel.json`. 62 testes (client, webhook, cron, e-mail). Sem validação no sandbox real (standby).
- **Fase 8:** painel completo: login por link mágico + proxy, layout (nav lateral/inferior), dashboard, lotes, produtos (fotos, variações), pedidos (ações e cancelamento no Asaas), retirada, resumo/CSV da gráfica sem CPF, eventos/palestrantes, hub, gestões (membros, logo, tornar atual), usuários (convite, papel, remoção com trava do último superadmin), log_acoes, script criar-superadmin. 86 testes + `scripts/check-rls-papeis.mts` (24 checks de RLS por papel no banco real, todos ok).
- **Fase 9:** revisão de segurança (tabela abaixo), sem rolagem horizontal a 360 px (13 páginas), README com setup/variáveis/webhook/cron/superadmin/transição de gestão e `docs/teste-sandbox.md`. Removidos assets de boilerplate.

## Decisões

- **Catálogo real (2026-10):** `Camisa Hub S.I.` virou 1 produto com 4 modelos (Camiseta branca/Diretoria, Camiseta azul, Polo branca, Polo branca com circuitos) × P/M/G/GG = 16 variações; o modelo é guardado na coluna `variacoes.cor` e a interface o chama de "Modelo". Fotos em `produtos/<id-do-produto>/` com nomes descritivos. **Preços ainda são os de exemplo (camisa R$ 65,00, caneca R$ 35,00) — o D.A. vai informar os reais.** A tabela de medidas segue como referência (polo e camiseta podem diferir).

- **Logo principal e favicon:** o emblema oficial do D.A. (JPG 150×150 fornecido, recortado em círculo com fundo transparente) é o logo ao lado de "Hub S.I." (`public/logo-si.png`, `LogoHubSI`) e o favicon (`src/app/icon.png`, `apple-icon.png`, `favicon.ico`). A origem tem só 150 px: se houver versão em alta resolução (ou SVG), substituir esses arquivos melhora a nitidez em telas retina.

- **Logo da chapa:** o selo do cabeçalho/rodapé/menu mostra o logo na proporção original (h-16 no cabeçalho, h-20 no rodapé/menu). O upload de logo da gestão agora **recorta margens e torna o fundo branco transparente** (`recortarMargens`, PNG); o logo já cadastrado (JPG quadrado com margens) foi recortado uma vez por script. Observação: mudanças feitas direto no banco (fora do painel) só aparecem após a revalidação de 5 min do cache.

- **Organograma livre:** `membros_gestao.superior_id` (migration `0004`, backfill pelos cargos) forma uma árvore; `ordem` ordena irmãos. Admin (`/admin/gestoes/[id]`): foto por membro (upload direto ao bucket `gestoes`, pasta `<gestao>/membros`), superior, ↑/↓, remover (filhos sobem um nível), "Organizar pelos cargos" e prévia ao vivo. Ciclos são recusados no servidor (`podeSerSuperior`) e ignorados na renderização (`montarArvore`). Público: mobile = lista indentada; a partir de `sm` = árvore com conectores (CSS `.org-tree`).

- **Redesign (2026-10):** o tema escuro azul-marinho foi trocado por tema claro moderno com degradê ciano→violeta (pedido do D.A.). Tokens em `globals.css` (`--color-accent` violeta + `--color-accent-2` ciano, utilitários `bg-brand`, `text-gradient`, `bg-brand-soft`), fontes Bricolage Grotesque + Inter + JetBrains Mono, hero com `AuroraBackground` (CSS puro, sem `framer-motion`), cartões com sombra e elevação no hover, títulos sem caixa alta. OG images e e-mail também ficaram claros. `CLAUDE.md` atualizado. Sem rolagem horizontal em 360 px (12 páginas).

- Dependências fora da lista do plano: `tsx` (devDependency) para rodar `scripts/*.mts`, como o próprio plano pressupõe. Nenhuma outra.

- Admin: `src/proxy.ts` (Next 16) exige sessão em `/admin/*`; o papel é checado por `requireRole` em cada página/action (RLS é a barreira real). Formulários usam `FormAcao` (chama a action manualmente para não resetar campos em erro). Uploads de imagem vão do navegador direto ao Storage (sessão do admin) e a action só grava a URL após validar o prefixo do bucket. Datas do painel são em horário de Brasília (offset fixo -03:00). Remover variação já vendida apenas a desativa.
- **Config manual no Supabase (Auth) para o login funcionar:** Site URL e Redirect URLs com `<SITE>/auth/callback`; nos templates de e-mail (Magic Link e Invite user) usar `{{ .SiteURL }}/auth/callback?token_hash={{ .TokenHash }}&type=magiclink` (invite: `type=invite`). Ver README (Fase 9).
- Primeiro acesso: `pnpm tsx --env-file=.env.local scripts/criar-superadmin.mts <email> "Nome"`.

- Asaas: auth pelo header `access_token` (+ `User-Agent`), `billingType` `UNDEFINED` (ou `PIX` se algum produto não aceita cartão), `notificationDisabled: true` no cliente (avisos saem do Hub S.I.). Webhook: se o processamento falha após registrar o evento, o registro é removido e responde 500 para o Asaas reenviar; falha de e-mail não gera 500. `PAYMENT_REFUNDED` só estorna pedidos pago/em_producao/disponivel.

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

- **STANDBY — Asaas/e-mail/cron (retomar depois):** `.env.local` sem `ASAAS_API_KEY`, `ASAAS_WEBHOOK_TOKEN` (mín. 32 caracteres), `RESEND_API_KEY`, `EMAIL_FROM` e `CRON_SECRET`. A Fase 7 está implementada e testada só com `fetch`/repositórios mockados. Falta, quando houver chaves: (1) criar cobrança Pix e cartão no sandbox e conferir `invoiceUrl`/QR; (2) cadastrar o webhook no painel do Asaas (URL `/api/webhooks/asaas`, token = `ASAAS_WEBHOOK_TOKEN`, eventos de cobrança) e conferir o header `asaas-access-token`; (3) validar o e-mail no Resend (domínio/remetente); (4) configurar `CRON_SECRET` e as variáveis na Vercel e conferir o cron diário (`vercel.json`, 08:00 UTC); (5) conferir o payload real dos webhooks (campo `id` do evento).


- `.env.local` não existe. Faltam todas as variáveis da Fase 0 (Supabase URL/keys/token/senha, Asaas, Resend, `CRON_SECRET`).

## Revisão de segurança (Fase 9)

| # | Regra | Onde | Resultado |
|---|---|---|---|
| 1 | `ASAAS_API_KEY` e service role só no servidor | `src/lib/env.server.ts`, `src/lib/supabase/admin.ts`, `src/lib/asaas/*` (todos `server-only`); `grep NEXT_PUBLIC_` só lista URL do site, URL e anon key do Supabase | ok |
| 2 | Webhook rejeita sem `asaas-access-token` (tempo constante) | `src/server/webhooks/asaas.ts` (`tokenValido`: sha256 + `timingSafeEqual`), `src/app/api/webhooks/asaas/route.ts` (sem token configurado → 401); testes de token ausente/errado | ok |
| 3 | Webhook idempotente | `webhook_eventos.id_evento_asaas` único + `registrarEvento`; evento repetido → 200 sem efeito; falha interna remove o registro e responde 500 para reenvio; testes | ok |
| 4 | Status só muda por webhook, cron ou admin | `grep .update(` com status: webhook (`asaas-repo.ts`), cron, `pedidos-admin.ts` e cancelamento server-side em `criarPedido` quando a criação falha; RLS: só admin/superadmin escrevem em `pedidos`; nenhuma rota aceita status do navegador | ok |
| 5 | Valor calculado no servidor | `src/server/pedidos/calculo.ts` (`montarPedido`) usa preços do banco; entrada nem tem campo de preço; testes de preço manipulado | ok |
| 6 | RLS em todas as tabelas; CPF/e-mail/WhatsApp só admin/superadmin | `0002_rls.sql`; `scripts/check-rls.mts` (anon) e `scripts/check-rls-papeis.mts` (24 checks por papel) rodados no banco real; nenhum `select` público toca `clientes`; `getPedidoPublico` não seleciona dados do cliente | ok |
| 7 | CSV e lista de retirada sem CPF | `src/lib/pedidos/grafica.ts` (só produto/tamanho/cor/qtd, com proteção contra injeção de fórmula; teste); `retirada/page.tsx` seleciona só nome | ok |
| 8 | Nenhum segredo em código/log/erro | `.env*` ignorados (exceto `.env.example`); `AsaasError`/`AsaasIndisponivelError` nunca incluem a chave (teste); logs só com `error.name`; e-mail de dev não loga conteúdo | ok |

Outras verificações: links do Hub só `http(s)` (schema + teste); URLs de imagem validadas contra o prefixo do bucket antes de gravar; login por link mágico responde sempre a mesma mensagem e tem rate limit; `/pedido/[codigo]` e `/api/pedidos/*/status` sem cache; `/admin/*` protegido por proxy + `requireRole`; acessibilidade: `label` em todos os campos (`Field`), foco visível global, `alt` nas imagens, contraste do acento ciano ≥ 10:1 sobre o fundo, alvos de toque ≥ 44 px, sem rolagem horizontal em 360 px (medido com Edge headless em 13 páginas).

**Pendente (não bloqueia o código):** tudo que depende de chaves reais — ver "STANDBY — Asaas" em Bloqueios e `docs/teste-sandbox.md`; configurar o Auth do Supabase (README); confirmar medidas da camisa e textos "a definir" em `/privacidade`; configurar variáveis na Vercel.
