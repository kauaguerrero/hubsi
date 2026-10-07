"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { moverEntreIrmaos, podeSerSuperior } from "@/lib/gestao/arvore";
import { superioresPadrao, type MembroOrg } from "@/lib/gestao/organograma";
import { publicEnv } from "@/lib/env";
import { caminhoNoStorage } from "@/lib/utils/storage";
import { gestaoSchema } from "@/lib/validators/schemas";
import { membroSchema } from "@/lib/validators/schemas-admin";
import {
  contextoAdmin,
  registrarAcao,
  type ContextoAdmin,
} from "@/server/admin/contexto";
import type { EstadoForm } from "./pedidos";
import { erroDoBanco, erroZod, numeroOuUndef, texto } from "./util";

function revalidarGestao(gestaoId: string) {
  revalidatePath("/", "layout");
  revalidatePath(`/admin/gestoes/${gestaoId}`);
}

async function membrosDaGestao(
  ctx: ContextoAdmin,
  gestaoId: string,
): Promise<MembroOrg[]> {
  const { data } = await ctx.supabase
    .from("membros_gestao")
    .select("id, nome, cargo, foto_url, ordem, superior_id")
    .eq("gestao_id", gestaoId);
  return data ?? [];
}

export async function salvarGestao(
  id: string | null,
  fd: FormData,
): Promise<EstadoForm | void> {
  const ctx = await contextoAdmin("gestoes");
  const parsed = gestaoSchema.safeParse({
    nome: texto(fd, "nome"),
    slug: texto(fd, "slug"),
    ano: numeroOuUndef(fd, "ano"),
    descricao: texto(fd, "descricao"),
  });
  if (!parsed.success) return erroZod(parsed.error);
  const g = parsed.data;
  const dados = {
    nome: g.nome,
    slug: g.slug,
    ano: g.ano,
    descricao: g.descricao ?? null,
  };

  if (id) {
    const { error } = await ctx.supabase
      .from("gestoes")
      .update(dados)
      .eq("id", id);
    if (error) return erroDoBanco(error) ?? undefined;
    await registrarAcao(ctx, "atualizar", "gestao", id);
    revalidatePath("/", "layout");
    redirect("/admin/gestoes");
  }

  const { data, error } = await ctx.supabase
    .from("gestoes")
    .insert({ ...dados, ativa: false })
    .select("id")
    .single();
  if (error || !data)
    return erroDoBanco(error) ?? { erro: "Não foi possível criar a gestão." };
  await registrarAcao(ctx, "criar", "gestao", data.id, { nome: g.nome });
  revalidatePath("/", "layout");
  redirect(`/admin/gestoes/${data.id}`);
}

export async function excluirGestao(id: string): Promise<void> {
  const ctx = await contextoAdmin("gestoes");
  const { data } = await ctx.supabase
    .from("gestoes")
    .select("ativa")
    .eq("id", id)
    .maybeSingle();
  if (data?.ativa) redirect("/admin/gestoes?erro=ativa");
  const { error } = await ctx.supabase.from("gestoes").delete().eq("id", id);
  if (error) redirect("/admin/gestoes?erro=em-uso");
  await registrarAcao(ctx, "excluir", "gestao", id);
  revalidatePath("/", "layout");
  redirect("/admin/gestoes");
}

export async function definirLogoGestao(
  gestaoId: string,
  url: string,
): Promise<EstadoForm | void> {
  const ctx = await contextoAdmin("gestoes");
  if (!caminhoNoStorage(url, publicEnv.NEXT_PUBLIC_SUPABASE_URL, "gestoes"))
    return { erro: "URL de imagem inválida." };
  const { error } = await ctx.supabase
    .from("gestoes")
    .update({ logo_url: url })
    .eq("id", gestaoId);
  if (error) return erroDoBanco(error) ?? undefined;
  await registrarAcao(ctx, "definir_logo", "gestao", gestaoId);
  revalidarGestao(gestaoId);
}

/** Lê o superior do formulário ("" = topo) e confere que não cria ciclo nem sai da gestão. */
function lerSuperior(
  fd: FormData,
  membroId: string | null,
  membros: MembroOrg[],
): { ok: true; id: string | null } | { ok: false } {
  const bruto = texto(fd, "superior_id");
  const id = bruto || null;
  if (id !== null && !membros.some((m) => m.id === id)) return { ok: false };
  if (membroId && !podeSerSuperior(membroId, id, membros)) return { ok: false };
  return { ok: true, id };
}

const ERRO_SUPERIOR = {
  erro: "Superior inválido: escolha alguém da mesma gestão que não esteja abaixo deste membro.",
};

export async function adicionarMembro(
  gestaoId: string,
  fd: FormData,
): Promise<EstadoForm | void> {
  const ctx = await contextoAdmin("gestoes");
  const membros = await membrosDaGestao(ctx, gestaoId);
  const superior = lerSuperior(fd, null, membros);
  if (!superior.ok) return ERRO_SUPERIOR;

  const parsed = membroSchema.safeParse({
    nome: texto(fd, "nome"),
    cargo: texto(fd, "cargo"),
    ordem:
      Math.max(
        0,
        ...membros
          .filter((m) => m.superior_id === superior.id)
          .map((m) => m.ordem),
      ) + 1,
    superiorId: superior.id,
  });
  if (!parsed.success) return erroZod(parsed.error);

  const { nome, cargo, ordem, superiorId } = parsed.data;
  const { error } = await ctx.supabase
    .from("membros_gestao")
    .insert({
      gestao_id: gestaoId,
      nome,
      cargo,
      ordem,
      superior_id: superiorId,
    });
  if (error) return erroDoBanco(error) ?? undefined;
  await registrarAcao(ctx, "criar", "membro", gestaoId, { cargo });
  revalidarGestao(gestaoId);
  return { ok: "Membro adicionado." };
}

export async function salvarMembro(
  gestaoId: string,
  membroId: string,
  fd: FormData,
): Promise<EstadoForm | void> {
  const ctx = await contextoAdmin("gestoes");
  const membros = await membrosDaGestao(ctx, gestaoId);
  const atual = membros.find((m) => m.id === membroId);
  if (!atual) return { erro: "Membro não encontrado." };

  const superior = lerSuperior(fd, membroId, membros);
  if (!superior.ok) return ERRO_SUPERIOR;

  // Mudou de superior: vai para o fim da fila dos novos irmãos.
  const mudouDeSuperior = superior.id !== atual.superior_id;
  const ordem = mudouDeSuperior
    ? Math.max(
        0,
        ...membros
          .filter((m) => m.superior_id === superior.id)
          .map((m) => m.ordem),
      ) + 1
    : atual.ordem;

  const parsed = membroSchema.safeParse({
    nome: texto(fd, "nome"),
    cargo: texto(fd, "cargo"),
    ordem,
    superiorId: superior.id,
  });
  if (!parsed.success) return erroZod(parsed.error);

  const { nome, cargo, superiorId } = parsed.data;
  const { error } = await ctx.supabase
    .from("membros_gestao")
    .update({ nome, cargo, ordem, superior_id: superiorId })
    .eq("id", membroId)
    .eq("gestao_id", gestaoId);
  if (error) return erroDoBanco(error) ?? undefined;
  await registrarAcao(ctx, "atualizar", "membro", membroId);
  revalidarGestao(gestaoId);
  return { ok: "Membro salvo." };
}

/** Remove o membro; quem estava abaixo dele sobe para o superior dele (a árvore não quebra). */
export async function removerMembro(
  gestaoId: string,
  membroId: string,
): Promise<void> {
  const ctx = await contextoAdmin("gestoes");
  const membros = await membrosDaGestao(ctx, gestaoId);
  const alvo = membros.find((m) => m.id === membroId);
  if (!alvo) return;

  await ctx.supabase
    .from("membros_gestao")
    .update({ superior_id: alvo.superior_id })
    .eq("superior_id", membroId)
    .eq("gestao_id", gestaoId);
  await ctx.supabase
    .from("membros_gestao")
    .delete()
    .eq("id", membroId)
    .eq("gestao_id", gestaoId);

  const caminho = alvo.foto_url
    ? caminhoNoStorage(
        alvo.foto_url,
        publicEnv.NEXT_PUBLIC_SUPABASE_URL,
        "gestoes",
      )
    : null;
  if (caminho) await ctx.supabase.storage.from("gestoes").remove([caminho]);
  await registrarAcao(ctx, "excluir", "membro", membroId);
  revalidarGestao(gestaoId);
}

/** Sobe ou desce o membro entre os irmãos (mesmo superior). */
export async function moverMembro(
  gestaoId: string,
  membroId: string,
  direcao: "cima" | "baixo",
): Promise<void> {
  const ctx = await contextoAdmin("gestoes");
  const membros = await membrosDaGestao(ctx, gestaoId);
  const alvo = membros.find((m) => m.id === membroId);
  if (!alvo) return;

  const irmaos = membros.filter((m) => m.superior_id === alvo.superior_id);
  const novas = moverEntreIrmaos(membroId, direcao, irmaos);
  await Promise.all(
    novas.map((n) =>
      ctx.supabase
        .from("membros_gestao")
        .update({ ordem: n.ordem })
        .eq("id", n.id)
        .eq("gestao_id", gestaoId),
    ),
  );
  revalidarGestao(gestaoId);
}

export async function definirFotoMembro(
  gestaoId: string,
  membroId: string,
  url: string,
): Promise<EstadoForm | void> {
  const ctx = await contextoAdmin("gestoes");
  if (!caminhoNoStorage(url, publicEnv.NEXT_PUBLIC_SUPABASE_URL, "gestoes"))
    return { erro: "URL de imagem inválida." };

  const { data: anterior } = await ctx.supabase
    .from("membros_gestao")
    .select("foto_url")
    .eq("id", membroId)
    .eq("gestao_id", gestaoId)
    .maybeSingle();
  if (!anterior) return { erro: "Membro não encontrado." };

  const { error } = await ctx.supabase
    .from("membros_gestao")
    .update({ foto_url: url })
    .eq("id", membroId)
    .eq("gestao_id", gestaoId);
  if (error) return erroDoBanco(error) ?? undefined;

  const antigo = anterior.foto_url
    ? caminhoNoStorage(
        anterior.foto_url,
        publicEnv.NEXT_PUBLIC_SUPABASE_URL,
        "gestoes",
      )
    : null;
  if (antigo) await ctx.supabase.storage.from("gestoes").remove([antigo]);
  await registrarAcao(ctx, "definir_foto", "membro", membroId);
  revalidarGestao(gestaoId);
}

export async function removerFotoMembro(
  gestaoId: string,
  membroId: string,
): Promise<void> {
  const ctx = await contextoAdmin("gestoes");
  const { data } = await ctx.supabase
    .from("membros_gestao")
    .select("foto_url")
    .eq("id", membroId)
    .eq("gestao_id", gestaoId)
    .maybeSingle();
  if (!data) return;

  await ctx.supabase
    .from("membros_gestao")
    .update({ foto_url: null })
    .eq("id", membroId)
    .eq("gestao_id", gestaoId);
  const caminho = data.foto_url
    ? caminhoNoStorage(
        data.foto_url,
        publicEnv.NEXT_PUBLIC_SUPABASE_URL,
        "gestoes",
      )
    : null;
  if (caminho) await ctx.supabase.storage.from("gestoes").remove([caminho]);
  await registrarAcao(ctx, "remover_foto", "membro", membroId);
  revalidarGestao(gestaoId);
}

/** Refaz a hierarquia a partir dos cargos (presidente → vice → secretaria/tesouraria). */
export async function organizarPorCargo(gestaoId: string): Promise<void> {
  const ctx = await contextoAdmin("gestoes");
  const membros = await membrosDaGestao(ctx, gestaoId);
  const sugestao = superioresPadrao(membros);

  await Promise.all(
    membros.map((m) =>
      ctx.supabase
        .from("membros_gestao")
        .update({ superior_id: sugestao.get(m.id) ?? null })
        .eq("id", m.id)
        .eq("gestao_id", gestaoId),
    ),
  );
  await registrarAcao(ctx, "organizar_por_cargo", "gestao", gestaoId);
  revalidarGestao(gestaoId);
}

/** Só superadmin (a função SQL também confere). Troca a gestão ativa atomicamente. */
export async function tornarGestaoAtual(id: string): Promise<void> {
  const ctx = await contextoAdmin("usuarios");
  const { error } = await ctx.supabase.rpc("ativar_gestao", { p_id: id });
  if (error) redirect("/admin/gestoes?erro=ativar");
  await registrarAcao(ctx, "ativar", "gestao", id);
  revalidatePath("/", "layout");
  redirect("/admin/gestoes");
}
