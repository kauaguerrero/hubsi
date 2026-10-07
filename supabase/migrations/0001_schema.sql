-- Hub S.I. — schema base. Valores monetários em centavos (integer).

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------
create type public.status_lote as enum ('aberto', 'fechado', 'em_producao', 'entregue');
create type public.status_pedido as enum (
  'aguardando_pagamento', 'pago', 'em_producao', 'disponivel',
  'retirado', 'expirado', 'cancelado', 'estornado'
);
create type public.forma_pagamento as enum ('pix', 'cartao', 'indefinido');
create type public.status_evento as enum ('rascunho', 'publicado', 'cancelado');
create type public.tipo_evento as enum (
  'palestra', 'workshop', 'hackathon', 'social', 'semana_academica', 'outro'
);
create type public.papel_admin as enum ('superadmin', 'admin', 'editor');

-- ---------------------------------------------------------------------------
-- Utilitários
-- ---------------------------------------------------------------------------
create function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Código HSI-XXXXXX, alfabeto sem ambíguos (sem 0/O/1/I).
create function public.gerar_codigo_pedido()
returns text
language plpgsql
volatile
set search_path = ''
as $$
declare
  alfabeto constant text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  resultado text := 'HSI-';
  i int;
begin
  for i in 1..6 loop
    resultado := resultado || substr(alfabeto, 1 + floor(random() * length(alfabeto))::int, 1);
  end loop;
  return resultado;
end;
$$;

-- ---------------------------------------------------------------------------
-- Gestões
-- ---------------------------------------------------------------------------
create table public.gestoes (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  slug text not null unique,
  ano integer not null,
  descricao text,
  logo_url text,
  ativa boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create unique index gestoes_uma_ativa on public.gestoes (ativa) where ativa;

create table public.membros_gestao (
  id uuid primary key default gen_random_uuid(),
  gestao_id uuid not null references public.gestoes (id) on delete cascade,
  nome text not null,
  cargo text not null,
  foto_url text,
  ordem integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index membros_gestao_gestao_idx on public.membros_gestao (gestao_id, ordem);

-- ---------------------------------------------------------------------------
-- Loja
-- ---------------------------------------------------------------------------
create table public.lotes (
  id uuid primary key default gen_random_uuid(),
  gestao_id uuid references public.gestoes (id) on delete set null,
  nome text not null,
  status public.status_lote not null default 'aberto',
  abre_em timestamptz not null default now(),
  fecha_em timestamptz not null,
  limite_unidades integer check (limite_unidades is null or limite_unidades > 0),
  local_retirada text,
  data_retirada timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (fecha_em > abre_em)
);
create index lotes_status_idx on public.lotes (status);

create table public.produtos (
  id uuid primary key default gen_random_uuid(),
  lote_id uuid not null references public.lotes (id) on delete cascade,
  slug text not null unique,
  nome text not null,
  descricao text,
  categoria text not null default 'geral',
  preco_centavos integer not null check (preco_centavos >= 0),
  aceita_cartao boolean not null default true,
  fotos text[] not null default '{}',
  ativo boolean not null default true,
  ordem integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index produtos_lote_idx on public.produtos (lote_id, ordem);

create table public.variacoes (
  id uuid primary key default gen_random_uuid(),
  produto_id uuid not null references public.produtos (id) on delete cascade,
  tamanho text,
  cor text,
  ativo boolean not null default true,
  ordem integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index variacoes_produto_idx on public.variacoes (produto_id, ordem);

create table public.clientes (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  cpf text not null unique check (cpf ~ '^[0-9]{11}$'),
  email text not null,
  whatsapp text not null,
  turma text,
  asaas_customer_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index clientes_email_idx on public.clientes (lower(email));

create table public.pedidos (
  id uuid primary key default gen_random_uuid(),
  codigo text not null unique default public.gerar_codigo_pedido()
    check (codigo ~ '^HSI-[A-HJ-NP-Z2-9]{6}$'),
  lote_id uuid not null references public.lotes (id),
  cliente_id uuid not null references public.clientes (id),
  status public.status_pedido not null default 'aguardando_pagamento',
  forma_pagamento public.forma_pagamento not null default 'indefinido',
  total_centavos integer not null check (total_centavos >= 0),
  asaas_payment_id text unique,
  invoice_url text,
  aceite_privacidade_em timestamptz not null default now(),
  pago_em timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index pedidos_lote_status_idx on public.pedidos (lote_id, status);
create index pedidos_cliente_idx on public.pedidos (cliente_id);

create table public.itens_pedido (
  id uuid primary key default gen_random_uuid(),
  pedido_id uuid not null references public.pedidos (id) on delete cascade,
  produto_id uuid not null references public.produtos (id),
  variacao_id uuid references public.variacoes (id),
  quantidade integer not null check (quantidade > 0),
  -- preço gravado no momento da compra
  preco_unitario integer not null check (preco_unitario >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index itens_pedido_pedido_idx on public.itens_pedido (pedido_id);

create table public.webhook_eventos (
  id uuid primary key default gen_random_uuid(),
  id_evento_asaas text not null unique,
  tipo text not null,
  payload jsonb not null,
  resultado text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Eventos e hub
-- ---------------------------------------------------------------------------
create table public.eventos (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  titulo text not null,
  descricao text,
  tipo public.tipo_evento not null default 'outro',
  status public.status_evento not null default 'rascunho',
  inicio timestamptz not null,
  fim timestamptz,
  local text,
  capa_url text,
  link_inscricao text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (fim is null or fim >= inicio)
);
create index eventos_status_inicio_idx on public.eventos (status, inicio);

create table public.palestrantes (
  id uuid primary key default gen_random_uuid(),
  evento_id uuid not null references public.eventos (id) on delete cascade,
  nome text not null,
  bio text,
  foto_url text,
  ordem integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index palestrantes_evento_idx on public.palestrantes (evento_id, ordem);

create table public.links_hub (
  id uuid primary key default gen_random_uuid(),
  titulo text not null,
  url text not null,
  categoria text not null default 'geral',
  descricao text,
  ordem integer not null default 0,
  ativo boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Admin e infraestrutura
-- ---------------------------------------------------------------------------
create table public.perfis_admin (
  user_id uuid primary key references auth.users (id) on delete cascade,
  nome text not null,
  email text not null unique,
  papel public.papel_admin not null default 'editor',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.log_acoes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete set null,
  acao text not null,
  entidade text not null,
  entidade_id text,
  detalhes jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index log_acoes_created_idx on public.log_acoes (created_at desc);

create table public.rate_limits (
  chave text primary key,
  janela_inicio timestamptz not null default now(),
  contagem integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Triggers de updated_at
-- ---------------------------------------------------------------------------
do $$
declare
  t text;
begin
  foreach t in array array[
    'gestoes', 'membros_gestao', 'lotes', 'produtos', 'variacoes', 'clientes',
    'pedidos', 'itens_pedido', 'webhook_eventos', 'eventos', 'palestrantes',
    'links_hub', 'perfis_admin', 'log_acoes', 'rate_limits'
  ] loop
    execute format(
      'create trigger %I before update on public.%I
         for each row execute function public.set_updated_at()',
      t || '_set_updated_at', t
    );
  end loop;
end;
$$;
