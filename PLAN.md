# Plano de implementação — Hub S.I. (MVP)

Execute em ordem. Cada fase termina com a validação indicada, atualização deste arquivo, `PROGRESS.md` e um commit. Regras gerais estão em `CLAUDE.md`.

---

## Fase 0 — Pré-requisitos (feitos por humano, antes do Claude Code)

O Claude Code não executa esta fase. Ao iniciar, apenas confira se `.env.local` existe e quais variáveis estão preenchidas; registre as ausentes em `PROGRESS.md` > Bloqueios.

- [ ] Node 20 LTS ou superior e pnpm instalados (`corepack enable`)
- [ ] Git instalado; repositório no GitHub da organização/conta do D.A.
- [ ] Projeto Supabase criado (conta do D.A.); anotar URL, anon/publishable key, service role key, project ref, senha do banco
- [ ] Supabase access token pessoal gerado (para a CLI)
- [ ] Chave de API do **sandbox** do Asaas e um token de webhook inventado (string longa aleatória)
- [ ] Conta Resend com chave de API (domínio pode ficar para depois; usar remetente de teste)
- [ ] `.env.local` preenchido conforme `.env.example` (gerado na Fase 1)

---

## Fase 1 — Bootstrap do projeto

**Tarefas**
- [x] Criar o app na pasta atual, sem prompts:
  ```bash
  pnpm create next-app@latest . --ts --tailwind --eslint --app --src-dir --import-alias "@/*" --use-pnpm --yes
  ```
  Se a pasta não estiver vazia (CLAUDE.md, PLAN.md), criar em `./_tmp`, mover o conteúdo para a raiz e apagar `_tmp`.
- [x] `.nvmrc` com `20`; campo `"engines": { "node": ">=20" }` no `package.json`
- [x] Instalar dependências:
  ```bash
  pnpm add @supabase/supabase-js @supabase/ssr zod server-only resend qrcode.react clsx
  pnpm add -D vitest @vitejs/plugin-react vite-tsconfig-paths prettier prettier-plugin-tailwindcss supabase
  ```
- [x] Scripts no `package.json`: `typecheck`, `test`, `format`, `db:push` (`supabase db push`), `db:types` (`supabase gen types typescript --linked > src/types/database.ts`)
- [x] `vitest.config.ts` com `vite-tsconfig-paths`; um teste trivial para validar o setup
- [x] `tsconfig.json` com `"strict": true` e `"noUncheckedIndexedAccess": true`
- [x] Criar a estrutura de pastas de `CLAUDE.md` (com `.gitkeep` onde vazio)
- [x] `.env.example` com todas as variáveis abaixo, sem valores; `.env.local` no `.gitignore`
  ```
  NEXT_PUBLIC_SITE_URL=
  NEXT_PUBLIC_SUPABASE_URL=
  NEXT_PUBLIC_SUPABASE_ANON_KEY=
  SUPABASE_SERVICE_ROLE_KEY=
  SUPABASE_PROJECT_REF=
  SUPABASE_ACCESS_TOKEN=
  SUPABASE_DB_PASSWORD=
  ASAAS_API_KEY=
  ASAAS_BASE_URL=https://api-sandbox.asaas.com/v3
  ASAAS_WEBHOOK_TOKEN=
  RESEND_API_KEY=
  EMAIL_FROM=
  CRON_SECRET=
  ```
- [x] `src/lib/env.ts`: valida variáveis com Zod, separando `serverEnv` (com `import "server-only"`) de `publicEnv`
- [x] `PROGRESS.md` com seções: Fases concluídas, Decisões, Bloqueios
- [x] `git init` (se necessário) e primeiro commit

**Validação:** `pnpm typecheck && pnpm lint && pnpm test && pnpm build`

---

## Fase 2 — Banco de dados (Supabase)

Se `SUPABASE_ACCESS_TOKEN` ou `SUPABASE_PROJECT_REF` faltar: escreva as migrations e o seed, **não** rode `db push` nem `db:types`, crie `src/types/database.ts` mínimo escrito à mão com aviso no topo, registre o bloqueio e siga.

**Tarefas**
- [x] `pnpm supabase init` (não interativo) — **`link` pendente** (bloqueio)
- [x] Migration `0001_schema.sql`:
  - enums: `status_lote` (aberto, fechado, em_producao, entregue), `status_pedido` (aguardando_pagamento, pago, em_producao, disponivel, retirado, expirado, cancelado, estornado), `forma_pagamento` (pix, cartao, indefinido), `status_evento` (rascunho, publicado, cancelado), `tipo_evento` (palestra, workshop, hackathon, social, semana_academica, outro), `papel_admin` (superadmin, admin, editor)
  - tabelas: `gestoes`, `membros_gestao`, `lotes`, `produtos`, `variacoes`, `clientes`, `pedidos`, `itens_pedido`, `webhook_eventos`, `eventos`, `palestrantes`, `links_hub`, `perfis_admin`, `log_acoes`, `rate_limits`
  - valores monetários em centavos (`integer`)
  - `pedidos.codigo`: único, formato `HSI-` + 6 caracteres alfanuméricos maiúsculos sem ambíguos (sem 0/O/1/I)
  - `itens_pedido.preco_unitario` gravado no momento da compra
  - `webhook_eventos.id_evento_asaas` único
  - índice único parcial: `create unique index gestoes_uma_ativa on gestoes (ativa) where ativa;`
  - `created_at`/`updated_at` com trigger de atualização
- [x] Migration `0002_rls.sql`:
  - função `public.papel_atual()` (security definer, `stable`) que lê `perfis_admin` pelo `auth.uid()`
  - função `public.tem_papel(papeis papel_admin[])`
  - RLS ligado em todas as tabelas
  - leitura pública: `gestoes`, `membros_gestao`, `lotes`, `produtos` e `variacoes` ativos, `eventos` publicados/cancelados, `palestrantes`, `links_hub`
  - `clientes`, `pedidos`, `itens_pedido`: leitura e escrita só `admin`/`superadmin`; `editor` sem acesso
  - `eventos`, `palestrantes`, `links_hub`: escrita por `editor`, `admin`, `superadmin`
  - `perfis_admin`: leitura do próprio perfil; escrita só `superadmin`
  - `webhook_eventos`, `rate_limits`: sem acesso via anon/authenticated (só service role)
- [x] Migration `0003_funcoes.sql`:
  - `ativar_gestao(p_id uuid)`: exige `superadmin`; desativa a atual e ativa a nova na mesma transação
  - `checar_rate_limit(chave text, limite int, janela_segundos int) returns boolean` (uso via service role)
- [x] Storage: buckets públicos `produtos`, `eventos`, `gestoes` com policies de escrita para admin/editor conforme o domínio
- [x] `supabase/seed.sql`: gestão OverFlow 2026 ativa, 1 lote aberto (fechamento em 30 dias), 2 produtos (camisa com P/M/G/GG em 2 cores, caneca sem variação de tamanho), 3 eventos (1 passado, 2 futuros), 5 links do hub
- [ ] `pnpm db:push` e `pnpm db:types` — **pendente** (bloqueio: faltam `SUPABASE_ACCESS_TOKEN` e `SUPABASE_PROJECT_REF`)

**Validação:** `pnpm typecheck`; migrations aplicadas sem erro; consulta anônima a `pedidos` retorna vazio/negado (testar com o client anon num script em `scripts/check-rls.ts`, rodado com `pnpm tsx`, e depois apagado ou mantido em `scripts/`).

---

## Fase 3 — Clients, utilitários e validações

**Tarefas**
- [ ] `src/lib/supabase/server.ts` (client com cookies via `@supabase/ssr`), `client.ts` (browser), `admin.ts` (service role, `server-only`)
- [ ] `src/lib/validators/cpf.ts`: normalização e validação de dígitos verificadores
- [ ] `src/lib/validators/schemas.ts`: schemas Zod de pedido (nome, CPF, e-mail, WhatsApp BR, turma, itens, aceite de privacidade), evento, produto, lote, gestão
- [ ] `src/lib/utils/money.ts`: centavos ↔ BRL
- [ ] `src/lib/utils/datas.ts`: formatação em `America/Sao_Paulo`
- [ ] `src/lib/utils/codigo-pedido.ts`: gerador do código `HSI-XXXXXX`
- [ ] `src/lib/auth/roles.ts`: `getPerfil()`, `requireRole(papeis)` que redireciona para `/admin/login`
- [ ] Testes: CPF (válidos, inválidos, repetidos tipo 111.111.111-11), money, código de pedido, schema de pedido

**Validação:** `pnpm typecheck && pnpm lint && pnpm test`

---

## Fase 4 — Design system e layout

**Tarefas**
- [ ] Tokens no `globals.css` conforme `CLAUDE.md` (acento numa única variável)
- [ ] Fontes com `next/font/google` no layout raiz
- [ ] `components/ui`: Button (primário com acento, secundário, ghost), Input, Select, Textarea, Checkbox, Card, Badge, Skeleton, EmptyState
- [ ] `components/brand`:
  - `LogoHubSI` em SVG inline (wordmark "HUB S.I." em condensada + ícone de circuito com nós)
  - `CircuitTrace` (trilha SVG reutilizável, com animação de "acender" via CSS e fallback estático em `prefers-reduced-motion`)
  - `SeloGestao` (server component: busca a gestão ativa; sem gestão ativa, não renderiza nada)
- [ ] `components/layout`: Header (desktop: logo, nav, selo à direita; mobile: logo + botão de menu, selo dentro do menu), MenuMobile, Footer (redes, contato, selo, link de privacidade)
- [ ] Página `not-found.tsx` com tema `StackOverflowError` e stack trace falso, com link de volta
- [ ] `console.log` de boas-vindas para quem abrir o DevTools (uma vez, no client, só em produção)

**Validação:** `pnpm typecheck && pnpm lint && pnpm build`

---

## Fase 5 — Páginas públicas (exceto loja)

**Tarefas**
- [ ] `/` Home: hero, próximo evento com contagem regressiva (client component pequeno), produtos do lote aberto, atalhos para eventos/sobre/hub
- [ ] `/eventos`: próximos e realizados em trilha vertical (nós; próximo evento destacado com acento)
- [ ] `/eventos/[slug]`: detalhes, palestrantes, link de inscrição externo, botão Google Agenda (URL template) e rota `/eventos/[slug]/ics` que devolve `.ics`
- [ ] `/sobre`: o que o D.A. faz, gestão atual com membros, gestões anteriores
- [ ] `/hub`: links por categoria vindos de `links_hub`
- [ ] `/privacidade`: finalidade dos dados, quem acessa, prazo de guarda (texto marcado como "a definir pelo D.A." onde não há decisão), contato
- [ ] Metadata por página e imagem Open Graph dinâmica para produto e evento (`opengraph-image.tsx`)
- [ ] Revalidação: páginas públicas com `revalidate` curto ou `revalidateTag` disparado pelas ações do admin

**Validação:** `pnpm typecheck && pnpm lint && pnpm build`

---

## Fase 6 — Loja e checkout (sem chamar o Asaas ainda)

**Tarefas**
- [ ] `/loja`: lote aberto, catálogo filtrável por categoria; lote fechado mostra aviso e esconde compra
- [ ] `/loja/[slug]`: galeria, seleção de variação, tabela de medidas (camisa), prazo do lote, botão adicionar
- [ ] Carrinho client-side (React context + `sessionStorage` com try/catch), restrito a itens do mesmo lote
- [ ] `/checkout`: formulário com validação Zod no client e no server; aceite do aviso de privacidade obrigatório
- [ ] Server action `criarPedido`:
  1. `checar_rate_limit` por IP (ex.: 5 pedidos / 10 min)
  2. valida lote aberto e limite de unidades
  3. recalcula preços a partir do banco
  4. upsert de `clientes` por CPF, cria `pedidos` + `itens_pedido` com status `aguardando_pagamento`
  5. chama `criarCobranca(pedido)` (Fase 7); até lá, stub que lança erro controlado
  6. redireciona para `/pedido/[codigo]`
- [ ] `/pedido/[codigo]`: dados públicos mínimos (itens, valor, status), sem CPF
- [ ] `/meus-pedidos`: formulário e-mail + código; consulta via service role retornando só os campos públicos; rate limit
- [ ] Testes: cálculo de total, rejeição de lote fechado, rejeição de preço manipulado

**Validação:** `pnpm typecheck && pnpm lint && pnpm test && pnpm build`

---

## Fase 7 — Integração Asaas, webhook, e-mail e cron

Se `ASAAS_API_KEY` faltar: implemente tudo com o client tipado, cubra com testes usando `fetch` mockado e registre o bloqueio.

**Tarefas**
- [ ] `src/lib/asaas/client.ts` (`server-only`): `fetch` para `ASAAS_BASE_URL`, header `access_token`, timeout, erros tipados sem vazar a chave
  - `buscarClientePorCpf(cpf)` → `GET /customers?cpfCnpj=`
  - `criarCliente(dados)` → `POST /customers`
  - `criarCobranca({ customer, value, dueDate, billingType, externalReference, description })` → `POST /payments`
  - `obterQrCodePix(paymentId)` → `GET /payments/{id}/pixQrCode`
  - `cancelarCobranca(paymentId)` → `DELETE /payments/{id}`
  - Antes de escrever, confira os campos na documentação oficial atual do Asaas e ajuste os tipos.
- [ ] Regras da cobrança: valor em reais (converter de centavos), `dueDate` = data de fechamento do lote, `externalReference` = `pedidos.id`, `billingType` = `UNDEFINED` se todos os produtos aceitam cartão, senão `PIX`
- [ ] Ligar `criarPedido` à criação real da cobrança; gravar `asaas_customer_id` e `asaas_payment_id`; em falha do Asaas, marcar pedido como `cancelado` e mostrar erro amigável
- [ ] `/pedido/[codigo]`: se aguardando, mostrar QR Pix (`qrcode.react` ou imagem base64 do Asaas) + copia-e-cola com botão copiar; se cartão permitido, botão para a `invoiceUrl`; polling leve (a cada 5 s, até 10 min) do status
- [ ] `POST /api/webhooks/asaas`:
  1. valida `asaas-access-token` com `crypto.timingSafeEqual`; inválido → 401
  2. insere em `webhook_eventos`; conflito de chave única → 200 sem efeito
  3. localiza pedido por `externalReference`
  4. `PAYMENT_RECEIVED`/`PAYMENT_CONFIRMED` → `pago` + `pago_em` + e-mail de confirmação
  5. `PAYMENT_OVERDUE` → `expirado`; `PAYMENT_REFUNDED` → `estornado`
  6. transições inválidas (ex.: pago → expirado) ignoradas e registradas
  7. responde 200 rápido; erros internos → 500 para o Asaas reenviar
- [ ] `src/lib/email/resend.ts` + template de confirmação (código, itens, valor, data/local de retirada se houver); sem `RESEND_API_KEY`, apenas loga em dev
- [ ] `GET /api/cron/expirar-pedidos`: exige `Authorization: Bearer $CRON_SECRET`; cancela no Asaas e marca `expirado` os pedidos aguardando de lotes fechados
- [ ] `vercel.json` com o cron diário
- [ ] Testes do webhook: token ausente, token errado, evento repetido, pagamento confirmado, estorno, transição inválida, pedido inexistente

**Validação:** `pnpm typecheck && pnpm lint && pnpm test && pnpm build`

---

## Fase 8 — Painel admin

**Tarefas**
- [ ] `/admin/login`: link mágico do Supabase Auth; só e-mails com registro em `perfis_admin` acessam (demais recebem mensagem genérica)
- [ ] Proteção das rotas `/admin/(painel)` no middleware/proxy (conforme a versão do Next) + `requireRole` em cada página e action
- [ ] Layout do painel: navegação lateral no desktop, inferior no mobile; mostra nome e papel
- [ ] Dashboard: lote ativo, arrecadado, pagos vs pendentes, próximo evento
- [ ] Lotes: CRUD, mudança de status
- [ ] Produtos: CRUD com upload de fotos (Storage), variações, preço, aceita cartão, vínculo ao lote
- [ ] Pedidos: lista filtrável por lote/status, detalhe com dados do cliente, ações "marcar disponível", "marcar retirado", "cancelar" (só não pagos; cancela no Asaas também)
- [ ] Resumo da gráfica: quantidade por produto/variação dos pedidos pagos; exportar CSV **sem CPF**
- [ ] Lista de retirada: pagos/disponíveis do lote em ordem alfabética, botão grande "retirado", pensada para celular
- [ ] Eventos e palestrantes: CRUD com rascunho/publicação e upload de capa
- [ ] Hub: CRUD de links com ordenação
- [ ] Gestões: CRUD, membros, upload de logos; botão "Tornar gestão atual" chamando `ativar_gestao` (só superadmin) e revalidando o layout
- [ ] Usuários (só superadmin): convidar por e-mail (`auth.admin.inviteUserByEmail` via service role), mudar papel, remover; impedir remover o último superadmin
- [ ] `log_acoes` gravado em toda ação de pedidos, lotes, gestões e usuários
- [ ] Script `scripts/criar-superadmin.ts` (rodado manualmente com e-mail como argumento) para o primeiro acesso
- [ ] Testes: `requireRole` por papel, editor sem acesso a pedidos, bloqueio de remover último superadmin

**Validação:** `pnpm typecheck && pnpm lint && pnpm test && pnpm build`

---

## Fase 9 — Revisão final e preparação do deploy

**Tarefas**
- [ ] Revisar cada item de "Regras de segurança" do `CLAUDE.md` contra o código e registrar o resultado em `PROGRESS.md` (item, arquivo, ok/corrigido)
- [ ] `grep` por `NEXT_PUBLIC_` e garantir que nenhum segredo usa o prefixo
- [ ] Conferir que nenhum `select` público retorna `cpf`, `email` ou `whatsapp`
- [ ] Acessibilidade: labels em todos os inputs, foco visível, `alt` nas imagens, contraste do acento sobre o fundo
- [ ] Testar visualmente em 360 px (dev server em background + screenshot, se disponível) e corrigir rolagem horizontal
- [ ] `README.md`: setup local, variáveis, comandos, como criar o primeiro superadmin, como configurar o webhook no painel do Asaas (URL `/api/webhooks/asaas` + token), checklist de transição de gestão
- [ ] Checklist manual de testes no sandbox em `docs/teste-sandbox.md`: Pix pago, cartão pago, vencido, estornado, webhook repetido, webhook sem token

**Validação:** `pnpm typecheck && pnpm lint && pnpm test && pnpm build` + commit `chore(fase-9): revisao final`

---

## Depois do MVP (não executar agora)

V2: guia do calouro, notificação por WhatsApp, galeria de eventos, command palette (Ctrl+K), tela de consulta de logs. V3: inscrição própria em eventos com QR Code de check-in, ingressos pagos.
