"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { publicEnv } from "@/lib/env";
import { caminhoNoStorage } from "@/lib/utils/storage";
import { gestaoSchema } from "@/lib/validators/schemas";
import { membroSchema } from "@/lib/validators/schemas-admin";
import { contextoAdmin, registrarAcao } from "@/server/admin/contexto";
import type { EstadoForm } from "./pedidos";
import { erroDoBanco, erroZod, numeroOuUndef, texto } from "./util";

export async function salvarGestao(id: string | null, fd: FormData): Promise<EstadoForm | void> {
  const ctx = await contextoAdmin("gestoes");
  const parsed = gestaoSchema.safeParse({
    nome: texto(fd, "nome"),
    slug: texto(fd, "slug"),
    ano: numeroOuUndef(fd, "ano"),
    descricao: texto(fd, "descricao"),
  });
  if (!parsed.success) return erroZod(parsed.error);
  const g = parsed.data;
  const dados = { nome: g.nome, slug: g.slug, ano: g.ano, descricao: g.descricao ?? null };

  if (id) {
    const { error } = await ctx.supabase.from("gestoes").update(dados).eq("id", id);
    if (error) return erroDoBanco(error) ?? undefined;
    await registrarAcao(ctx, "atualizar", "gestao", id);
    revalidatePath("/", "layout");
    redirect("/admin/gestoes");
  }

  const { data, error } = await ctx.supabase.from("gestoes").insert({ ...dados, ativa: false }).select("id").single();
  if (error || !data) return erroDoBanco(error) ?? { erro: "Não foi possível criar a gestão." };
  await registrarAcao(ctx, "criar", "gestao", data.id, { nome: g.nome });
  revalidatePath("/", "layout");
  redirect(`/admin/gestoes/${data.id}`);
}

export async function excluirGestao(id: string): Promise<void> {
  const ctx = await contextoAdmin("gestoes");
  const { data } = await ctx.supabase.from("gestoes").select("ativa").eq("id", id).maybeSingle();
  if (data?.ativa) redirect("/admin/gestoes?erro=ativa");
  const { error } = await ctx.supabase.from("gestoes").delete().eq("id", id);
  if (error) redirect("/admin/gestoes?erro=em-uso");
  await registrarAcao(ctx, "excluir", "gestao", id);
  revalidatePath("/", "layout");
  redirect("/admin/gestoes");
}

export async function definirLogoGestao(gestaoId: string, url: string): Promise<EstadoForm | void> {
  const ctx = await contextoAdmin("gestoes");
  if (!caminhoNoStorage(url, publicEnv.NEXT_PUBLIC_SUPABASE_URL, "gestoes")) return { erro: "URL de imagem inválida." };
  const { error } = await ctx.supabase.from("gestoes").update({ logo_url: url }).eq("id", gestaoId);
  if (error) return erroDoBanco(error) ?? undefined;
  await registrarAcao(ctx, "definir_logo", "gestao", gestaoId);
  revalidatePath("/", "layout");
}

export async function adicionarMembro(gestaoId: string, fd: FormData): Promise<EstadoForm | void> {
  const ctx = await contextoAdmin("gestoes");
  const parsed = membroSchema.safeParse({
    nome: texto(fd, "nome"),
    cargo: texto(fd, "cargo"),
    ordem: numeroOuUndef(fd, "ordem") ?? 0,
  });
  if (!parsed.success) return erroZod(parsed.error);

  const { error } = await ctx.supabase.from("membros_gestao").insert({ gestao_id: gestaoId, ...parsed.data });
  if (error) return erroDoBanco(error) ?? undefined;
  revalidatePath("/", "layout");
  revalidatePath(`/admin/gestoes/${gestaoId}`);
}

export async function removerMembro(gestaoId: string, membroId: string): Promise<void> {
  const ctx = await contextoAdmin("gestoes");
  await ctx.supabase.from("membros_gestao").delete().eq("id", membroId);
  revalidatePath("/", "layout");
  revalidatePath(`/admin/gestoes/${gestaoId}`);
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
