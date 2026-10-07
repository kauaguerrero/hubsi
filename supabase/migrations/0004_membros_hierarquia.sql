-- Hierarquia livre do organograma: cada membro pode ter um superior (árvore).

alter table public.membros_gestao
  add column superior_id uuid references public.membros_gestao (id) on delete set null,
  add constraint membros_gestao_superior_diferente check (superior_id is null or superior_id <> id);

create index membros_gestao_superior_idx on public.membros_gestao (superior_id);

-- Preenche a hierarquia dos membros já cadastrados a partir do cargo (uma única vez).
create function public.cargo_chave(c text)
returns text
language sql
immutable
set search_path = ''
as $$
  select regexp_replace(
    translate(lower(c), 'áàâãäéèêëíìîïóòôõöúùûüç', 'aaaaaeeeeiiiiooooouuuuc'),
    '[^a-z]', '', 'g'
  );
$$;

do $$
declare
  g record;
  pres uuid; vp uuid; sec uuid; vsec uuid; tes uuid; vtes uuid;
begin
  for g in select id from public.gestoes loop
    select id into pres  from public.membros_gestao where gestao_id = g.id and public.cargo_chave(cargo) ~ '^president'      order by ordem limit 1;
    select id into vp    from public.membros_gestao where gestao_id = g.id and public.cargo_chave(cargo) ~ '^vicepresident'  order by ordem limit 1;
    select id into sec   from public.membros_gestao where gestao_id = g.id and public.cargo_chave(cargo) ~ '^secretar'       order by ordem limit 1;
    select id into vsec  from public.membros_gestao where gestao_id = g.id and public.cargo_chave(cargo) ~ '^vicesecretar'   order by ordem limit 1;
    select id into tes   from public.membros_gestao where gestao_id = g.id and public.cargo_chave(cargo) ~ '^tesour'         order by ordem limit 1;
    select id into vtes  from public.membros_gestao where gestao_id = g.id and public.cargo_chave(cargo) ~ '^vicetesour'    order by ordem limit 1;

    if vp   is not null then update public.membros_gestao set superior_id = pres                    where id = vp   and pres is not null; end if;
    if sec  is not null then update public.membros_gestao set superior_id = coalesce(vp, pres)      where id = sec; end if;
    if tes  is not null then update public.membros_gestao set superior_id = coalesce(vp, pres)      where id = tes; end if;
    if vsec is not null then update public.membros_gestao set superior_id = coalesce(sec, vp, pres) where id = vsec; end if;
    if vtes is not null then update public.membros_gestao set superior_id = coalesce(tes, vp, pres) where id = vtes; end if;

    pres := null; vp := null; sec := null; vsec := null; tes := null; vtes := null;
  end loop;
end;
$$;

drop function public.cargo_chave(text);
