-- Destaques: anúncios em evidência na home (save the date, formulário de interesse, link externo).
-- No tipo "formulario", alunos registram interesse em itens (pré-venda) e o D.A. mede a demanda.

create type public.tipo_destaque as enum ('save_the_date', 'formulario', 'link');
create type public.status_destaque as enum ('rascunho', 'publicado');

create table public.destaques (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  titulo text not null,
  descricao text,
  tipo public.tipo_destaque not null default 'save_the_date',
  status public.status_destaque not null default 'rascunho',
  data_evento timestamptz,
  expira_em timestamptz,
  cta_texto text,
  link_externo text,
  capa_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (tipo <> 'link' or link_externo is not null)
);
create index destaques_status_expira_idx on public.destaques (status, expira_em);

create table public.destaque_itens (
  id uuid primary key default gen_random_uuid(),
  destaque_id uuid not null references public.destaques (id) on delete cascade,
  nome text not null,
  descricao text,
  preco_centavos integer not null default 0 check (preco_centavos >= 0),
  foto_url text,
  ordem integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index destaque_itens_destaque_idx on public.destaque_itens (destaque_id, ordem);

create table public.destaque_interessados (
  id uuid primary key default gen_random_uuid(),
  destaque_id uuid not null references public.destaques (id) on delete cascade,
  nome text not null,
  email text not null,
  whatsapp text not null,
  turma text,
  observacao text,
  aceite_privacidade_em timestamptz not null default now(),
  contatado_em timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create unique index destaque_interessados_email_uidx on public.destaque_interessados (destaque_id, lower(email));

-- Preço copiado do item no momento do registro: a previsão de receita não muda se o preço mudar depois.
create table public.destaque_interesses (
  interessado_id uuid not null references public.destaque_interessados (id) on delete cascade,
  item_id uuid not null references public.destaque_itens (id) on delete cascade,
  quantidade integer not null default 1 check (quantidade between 1 and 20),
  preco_centavos integer not null check (preco_centavos >= 0),
  primary key (interessado_id, item_id)
);
create index destaque_interesses_item_idx on public.destaque_interesses (item_id);

create trigger destaques_set_updated_at before update on public.destaques
  for each row execute function public.set_updated_at();
create trigger destaque_itens_set_updated_at before update on public.destaque_itens
  for each row execute function public.set_updated_at();
create trigger destaque_interessados_set_updated_at before update on public.destaque_interessados
  for each row execute function public.set_updated_at();

alter table public.destaques enable row level security;
alter table public.destaque_itens enable row level security;
alter table public.destaque_interessados enable row level security;
alter table public.destaque_interesses enable row level security;

-- Leitura pública apenas do que está publicado (a expiração é filtrada na consulta).
create policy destaques_leitura_publica on public.destaques
  for select to anon, authenticated using (status = 'publicado');

create policy destaque_itens_leitura_publica on public.destaque_itens
  for select to anon, authenticated
  using (exists (
    select 1 from public.destaques d
    where d.id = destaque_itens.destaque_id and d.status = 'publicado'
  ));

create policy destaques_admin on public.destaques
  for all to authenticated
  using (public.tem_papel(array['admin', 'superadmin']::public.papel_admin[]))
  with check (public.tem_papel(array['admin', 'superadmin']::public.papel_admin[]));

create policy destaque_itens_admin on public.destaque_itens
  for all to authenticated
  using (public.tem_papel(array['admin', 'superadmin']::public.papel_admin[]))
  with check (public.tem_papel(array['admin', 'superadmin']::public.papel_admin[]));

-- Dados pessoais: só admin/superadmin leem. Inserções públicas passam pela server action (service role).
create policy destaque_interessados_admin on public.destaque_interessados
  for all to authenticated
  using (public.tem_papel(array['admin', 'superadmin']::public.papel_admin[]))
  with check (public.tem_papel(array['admin', 'superadmin']::public.papel_admin[]));

create policy destaque_interesses_admin on public.destaque_interesses
  for all to authenticated
  using (public.tem_papel(array['admin', 'superadmin']::public.papel_admin[]))
  with check (public.tem_papel(array['admin', 'superadmin']::public.papel_admin[]));

-- Capas e fotos dos destaques usam o bucket público "eventos" (subpasta destaques/).
