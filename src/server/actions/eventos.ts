"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { publicEnv } from "@/lib/env";
import { caminhoNoStorage } from "@/lib/utils/storage";
import { eventoSchema } from "@/lib/validators/schemas";
import { palestranteSchema } from "@/lib/validators/schemas-admin";
import { contextoAdmin, registrarAcao } from "@/server/admin/contexto";
import type { EstadoForm } from "./pedidos";
import { dataLocal, erroDoBanco, erroZod, numeroOuUndef, texto } from "./util";

export async function salvarEvento(id: string | null, fd: FormData): Promise<EstadoForm | void> {
  const ctx = await contextoAdmin("eventos");

  const parsed = eventoSchema.safeParse({
    slug: texto(fd, "slug"),
    titulo: texto(fd, "titulo"),
    descricao: texto(fd, "descricao"),
    tipo: texto(fd, "tipo"),
    status: texto(fd, "status"),
    inicio: dataLocal(fd, "inicio"),
    fim: dataLocal(fd, "fim"),
    local: texto(fd, "local"),
    linkInscricao: texto(fd, "link_inscricao"),
  });
  if (!parsed.success) return erroZod(parsed.error);
  const e = parsed.data;

  const dados = {
    slug: e.slug,
    titulo: e.titulo,
    descricao: e.descricao ?? null,
    tipo: e.tipo,
    status: e.status,
    inicio: e.inicio.toISOString(),
    fim: e.fim?.toISOString() ?? null,
    local: e.local ?? null,
    link_inscricao: e.linkInscricao ?? null,
  };

  if (id) {
    const { error } = await ctx.supabase.from("eventos").update(dados).eq("id", id);
    if (error) return erroDoBanco(error) ?? undefined;
    await registrarAcao(ctx, "atualizar", "evento", id, { status: e.status });
    revalidatePath("/", "layout");
    redirect("/admin/eventos");
  }

  const { data, error } = await ctx.supabase.from("eventos").insert(dados).select("id").single();
  if (error || !data) return erroDoBanco(error) ?? { erro: "Não foi possível criar o evento." };
  await registrarAcao(ctx, "criar", "evento", data.id, { titulo: e.titulo });
  revalidatePath("/", "layout");
  redirect(`/admin/eventos/${data.id}`);
}

export async function excluirEvento(id: string): Promise<void> {
  const ctx = await contextoAdmin("eventos");
  await ctx.supabase.from("eventos").delete().eq("id", id);
  await registrarAcao(ctx, "excluir", "evento", id);
  revalidatePath("/", "layout");
  redirect("/admin/eventos");
}

export async function definirCapaEvento(eventoId: string, url: string): Promise<EstadoForm | void> {
  const ctx = await contextoAdmin("eventos");
  if (!caminhoNoStorage(url, publicEnv.NEXT_PUBLIC_SUPABASE_URL, "eventos")) return { erro: "URL de imagem inválida." };
  const { error } = await ctx.supabase.from("eventos").update({ capa_url: url }).eq("id", eventoId);
  if (error) return erroDoBanco(error) ?? undefined;
  revalidatePath("/", "layout");
}

export async function adicionarPalestrante(eventoId: string, fd: FormData): Promise<EstadoForm | void> {
  const ctx = await contextoAdmin("eventos");
  const parsed = palestranteSchema.safeParse({
    nome: texto(fd, "nome"),
    bio: texto(fd, "bio"),
    ordem: numeroOuUndef(fd, "ordem") ?? 0,
  });
  if (!parsed.success) return erroZod(parsed.error);

  const { error } = await ctx.supabase
    .from("palestrantes")
    .insert({ evento_id: eventoId, nome: parsed.data.nome, bio: parsed.data.bio ?? null, ordem: parsed.data.ordem });
  if (error) return erroDoBanco(error) ?? undefined;
  revalidatePath("/", "layout");
  revalidatePath(`/admin/eventos/${eventoId}`);
}

export async function removerPalestrante(eventoId: string, palestranteId: string): Promise<void> {
  const ctx = await contextoAdmin("eventos");
  await ctx.supabase.from("palestrantes").delete().eq("id", palestranteId);
  revalidatePath("/", "layout");
  revalidatePath(`/admin/eventos/${eventoId}`);
}
