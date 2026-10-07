"use server";

import { revalidatePath } from "next/cache";
import { linkHubSchema } from "@/lib/validators/schemas-admin";
import { contextoAdmin } from "@/server/admin/contexto";
import type { EstadoForm } from "./pedidos";
import { erroDoBanco, erroZod, marcado, numeroOuUndef, texto } from "./util";

export async function salvarLinkHub(id: string | null, fd: FormData): Promise<EstadoForm | void> {
  const ctx = await contextoAdmin("hub");
  const parsed = linkHubSchema.safeParse({
    titulo: texto(fd, "titulo"),
    url: texto(fd, "url"),
    categoria: texto(fd, "categoria"),
    descricao: texto(fd, "descricao"),
    ordem: numeroOuUndef(fd, "ordem") ?? 0,
    ativo: marcado(fd, "ativo"),
  });
  if (!parsed.success) return erroZod(parsed.error);
  const l = parsed.data;

  const dados = {
    titulo: l.titulo,
    url: l.url,
    categoria: l.categoria,
    descricao: l.descricao ?? null,
    ordem: l.ordem,
    ativo: l.ativo,
  };
  const { error } = id
    ? await ctx.supabase.from("links_hub").update(dados).eq("id", id)
    : await ctx.supabase.from("links_hub").insert(dados);
  if (error) return erroDoBanco(error) ?? undefined;

  revalidatePath("/", "layout");
  revalidatePath("/admin/hub");
}

export async function excluirLinkHub(id: string): Promise<void> {
  const ctx = await contextoAdmin("hub");
  await ctx.supabase.from("links_hub").delete().eq("id", id);
  revalidatePath("/", "layout");
  revalidatePath("/admin/hub");
}
