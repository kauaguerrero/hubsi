-- Hub S.I. — funções de negócio.

-- Troca de gestão ativa numa única transação (a função inteira é atômica).
create function public.ativar_gestao(p_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.tem_papel(array['superadmin']::public.papel_admin[]) then
    raise exception 'Apenas superadmin pode ativar uma gestão' using errcode = '42501';
  end if;

  if not exists (select 1 from public.gestoes where id = p_id) then
    raise exception 'Gestão não encontrada' using errcode = 'P0002';
  end if;

  update public.gestoes set ativa = false where ativa and id <> p_id;
  update public.gestoes set ativa = true where id = p_id;
end;
$$;

revoke execute on function public.ativar_gestao(uuid) from public, anon;
grant execute on function public.ativar_gestao(uuid) to authenticated;

-- Rate limit de janela fixa. Retorna true se a requisição está dentro do limite.
-- Uso exclusivo via service role.
create function public.checar_rate_limit(p_chave text, p_limite integer, p_janela_segundos integer)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_contagem integer;
begin
  insert into public.rate_limits as r (chave, janela_inicio, contagem)
  values (p_chave, now(), 1)
  on conflict (chave) do update
    set janela_inicio = case
          when r.janela_inicio < now() - make_interval(secs => p_janela_segundos) then now()
          else r.janela_inicio
        end,
        contagem = case
          when r.janela_inicio < now() - make_interval(secs => p_janela_segundos) then 1
          else r.contagem + 1
        end
  returning r.contagem into v_contagem;

  return v_contagem <= p_limite;
end;
$$;

revoke execute on function public.checar_rate_limit(text, integer, integer)
  from public, anon, authenticated;
grant execute on function public.checar_rate_limit(text, integer, integer) to service_role;
