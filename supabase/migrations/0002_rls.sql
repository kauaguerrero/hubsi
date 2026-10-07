-- Hub S.I. — funções de papel e Row Level Security.

create function public.papel_atual()
returns public.papel_admin
language sql
stable
security definer
set search_path = ''
as $$
  select papel from public.perfis_admin where user_id = (select auth.uid());
$$;

create function public.tem_papel(papeis public.papel_admin[])
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(public.papel_atual() = any (papeis), false);
$$;

revoke execute on function public.papel_atual() from public, anon;
revoke execute on function public.tem_papel(public.papel_admin[]) from public, anon;
grant execute on function public.papel_atual() to authenticated, service_role;
grant execute on function public.tem_papel(public.papel_admin[]) to authenticated, service_role;

-- RLS em todas as tabelas
alter table public.gestoes enable row level security;
alter table public.membros_gestao enable row level security;
alter table public.lotes enable row level security;
alter table public.produtos enable row level security;
alter table public.variacoes enable row level security;
alter table public.clientes enable row level security;
alter table public.pedidos enable row level security;
alter table public.itens_pedido enable row level security;
alter table public.webhook_eventos enable row level security;
alter table public.eventos enable row level security;
alter table public.palestrantes enable row level security;
alter table public.links_hub enable row level security;
alter table public.perfis_admin enable row level security;
alter table public.log_acoes enable row level security;
alter table public.rate_limits enable row level security;

-- Tabelas só acessíveis via service role
revoke all on public.webhook_eventos from anon, authenticated;
revoke all on public.rate_limits from anon, authenticated;

-- ---------------------------------------------------------------------------
-- Leitura pública
-- ---------------------------------------------------------------------------
create policy gestoes_leitura_publica on public.gestoes
  for select to anon, authenticated using (true);

create policy membros_gestao_leitura_publica on public.membros_gestao
  for select to anon, authenticated using (true);

create policy lotes_leitura_publica on public.lotes
  for select to anon, authenticated using (true);

create policy produtos_leitura_publica on public.produtos
  for select to anon, authenticated using (ativo);

create policy variacoes_leitura_publica on public.variacoes
  for select to anon, authenticated using (ativo);

create policy eventos_leitura_publica on public.eventos
  for select to anon, authenticated using (status in ('publicado', 'cancelado'));

create policy palestrantes_leitura_publica on public.palestrantes
  for select to anon, authenticated
  using (exists (
    select 1 from public.eventos e
    where e.id = palestrantes.evento_id and e.status in ('publicado', 'cancelado')
  ));

create policy links_hub_leitura_publica on public.links_hub
  for select to anon, authenticated using (ativo);

-- ---------------------------------------------------------------------------
-- Escrita e leitura completa: admin e superadmin
-- ---------------------------------------------------------------------------
create policy gestoes_admin on public.gestoes
  for all to authenticated
  using (public.tem_papel(array['admin', 'superadmin']::public.papel_admin[]))
  with check (public.tem_papel(array['admin', 'superadmin']::public.papel_admin[]));

create policy membros_gestao_admin on public.membros_gestao
  for all to authenticated
  using (public.tem_papel(array['admin', 'superadmin']::public.papel_admin[]))
  with check (public.tem_papel(array['admin', 'superadmin']::public.papel_admin[]));

create policy lotes_admin on public.lotes
  for all to authenticated
  using (public.tem_papel(array['admin', 'superadmin']::public.papel_admin[]))
  with check (public.tem_papel(array['admin', 'superadmin']::public.papel_admin[]));

create policy produtos_admin on public.produtos
  for all to authenticated
  using (public.tem_papel(array['admin', 'superadmin']::public.papel_admin[]))
  with check (public.tem_papel(array['admin', 'superadmin']::public.papel_admin[]));

create policy variacoes_admin on public.variacoes
  for all to authenticated
  using (public.tem_papel(array['admin', 'superadmin']::public.papel_admin[]))
  with check (public.tem_papel(array['admin', 'superadmin']::public.papel_admin[]));

-- Dados pessoais e pedidos: editor sem acesso
create policy clientes_admin on public.clientes
  for all to authenticated
  using (public.tem_papel(array['admin', 'superadmin']::public.papel_admin[]))
  with check (public.tem_papel(array['admin', 'superadmin']::public.papel_admin[]));

create policy pedidos_admin on public.pedidos
  for all to authenticated
  using (public.tem_papel(array['admin', 'superadmin']::public.papel_admin[]))
  with check (public.tem_papel(array['admin', 'superadmin']::public.papel_admin[]));

create policy itens_pedido_admin on public.itens_pedido
  for all to authenticated
  using (public.tem_papel(array['admin', 'superadmin']::public.papel_admin[]))
  with check (public.tem_papel(array['admin', 'superadmin']::public.papel_admin[]));

-- ---------------------------------------------------------------------------
-- Conteúdo editorial: editor, admin e superadmin
-- ---------------------------------------------------------------------------
create policy eventos_editorial on public.eventos
  for all to authenticated
  using (public.tem_papel(array['editor', 'admin', 'superadmin']::public.papel_admin[]))
  with check (public.tem_papel(array['editor', 'admin', 'superadmin']::public.papel_admin[]));

create policy palestrantes_editorial on public.palestrantes
  for all to authenticated
  using (public.tem_papel(array['editor', 'admin', 'superadmin']::public.papel_admin[]))
  with check (public.tem_papel(array['editor', 'admin', 'superadmin']::public.papel_admin[]));

create policy links_hub_editorial on public.links_hub
  for all to authenticated
  using (public.tem_papel(array['editor', 'admin', 'superadmin']::public.papel_admin[]))
  with check (public.tem_papel(array['editor', 'admin', 'superadmin']::public.papel_admin[]));

-- ---------------------------------------------------------------------------
-- perfis_admin: leitura do próprio perfil; escrita só superadmin
-- ---------------------------------------------------------------------------
create policy perfis_admin_proprio on public.perfis_admin
  for select to authenticated
  using (user_id = (select auth.uid()));

create policy perfis_admin_superadmin on public.perfis_admin
  for all to authenticated
  using (public.tem_papel(array['superadmin']::public.papel_admin[]))
  with check (public.tem_papel(array['superadmin']::public.papel_admin[]));

-- ---------------------------------------------------------------------------
-- log_acoes: leitura admin/superadmin; inserção do próprio usuário admin
-- ---------------------------------------------------------------------------
create policy log_acoes_leitura on public.log_acoes
  for select to authenticated
  using (public.tem_papel(array['admin', 'superadmin']::public.papel_admin[]));

create policy log_acoes_insercao on public.log_acoes
  for insert to authenticated
  with check (
    user_id = (select auth.uid())
    and public.tem_papel(array['editor', 'admin', 'superadmin']::public.papel_admin[])
  );

-- ---------------------------------------------------------------------------
-- Storage: buckets públicos e policies de escrita
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('produtos', 'produtos', true), ('eventos', 'eventos', true), ('gestoes', 'gestoes', true)
on conflict (id) do nothing;

create policy storage_leitura_publica on storage.objects
  for select to anon, authenticated
  using (bucket_id in ('produtos', 'eventos', 'gestoes'));

create policy storage_produtos_gestoes_escrita on storage.objects
  for all to authenticated
  using (
    bucket_id in ('produtos', 'gestoes')
    and public.tem_papel(array['admin', 'superadmin']::public.papel_admin[])
  )
  with check (
    bucket_id in ('produtos', 'gestoes')
    and public.tem_papel(array['admin', 'superadmin']::public.papel_admin[])
  );

create policy storage_eventos_escrita on storage.objects
  for all to authenticated
  using (
    bucket_id = 'eventos'
    and public.tem_papel(array['editor', 'admin', 'superadmin']::public.papel_admin[])
  )
  with check (
    bucket_id = 'eventos'
    and public.tem_papel(array['editor', 'admin', 'superadmin']::public.papel_admin[])
  );
