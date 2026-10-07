"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { loteSchema } from "@/lib/validators/schemas";
import { contextoAdmin, registrarAcao } from "@/server/admin/contexto";
import type { EstadoForm } from "./pedidos";
import { dataLocal, erroDoBanco, erroZod, numeroOuUndef, texto } from "./util";

export async function salvarLote(id: string | null, fd: FormData): Promise<EstadoForm | void> {
  const ctx = await contextoAdmin("lotes");

  const parsed = loteSchema.safeParse({
    nome: texto(fd, "nome"),
    status: texto(fd, "status"),
    abreEm: dataLocal(fd, "abre_em"),
    fechaEm: dataLocal(fd, "fecha_em"),
    limiteUnidades: numeroOuUndef(fd, "limite_unidades"),
    localRetirada: texto(fd, "local_retirada"),
    dataRetirada: dataLocal(fd, "data_retirada"),
  });
  if (!parsed.success) return erroZod(parsed.error);
  const l = parsed.data;

  const dados = {
    nome: l.nome,
    status: l.status,
    abre_em: l.abreEm.toISOString(),
    fecha_em: l.fechaEm.toISOString(),
    limite_unidades: l.limiteUnidades ?? null,
    local_retirada: l.localRetirada ?? null,
    data_retirada: l.dataRetirada?.toISOString() ?? null,
  };

  if (id) {
    const { error } = await ctx.supabase.from("lotes").update(dados).eq("id", id);
    if (error) return erroDoBanco(error) ?? undefined;
    await registrarAcao(ctx, "atualizar", "lote", id, { status: l.status });
  } else {
    const { data: gestao } = await ctx.supabase.from("gestoes").select("id").eq("ativa", true).maybeSingle();
    const { data, error } = await ctx.supabase
      .from("lotes")
      .insert({ ...dados, gestao_id: gestao?.id ?? null })
      .select("id")
      .single();
    if (error || !data) return erroDoBanco(error) ?? { erro: "Não foi possível criar o lote." };
    await registrarAcao(ctx, "criar", "lote", data.id, { nome: l.nome });
  }

  revalidatePath("/", "layout");
  redirect("/admin/lotes");
}

export async function excluirLote(id: string): Promise<void> {
  const ctx = await contextoAdmin("lotes");
  const { error } = await ctx.supabase.from("lotes").delete().eq("id", id);
  if (error) redirect("/admin/lotes?erro=em-uso");
  await registrarAcao(ctx, "excluir", "lote", id);
  revalidatePath("/", "layout");
  redirect("/admin/lotes");
}
