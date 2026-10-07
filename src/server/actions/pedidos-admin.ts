"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { cancelarCobranca } from "@/lib/asaas/client";
import { podeTransicionarAdmin, statusDaAcao, type AcaoAdminPedido } from "@/lib/pedidos/transicoes";
import { contextoAdmin, registrarAcao } from "@/server/admin/contexto";

type Voltar = "pedido" | "retirada";

async function aplicar(id: string, acao: AcaoAdminPedido, voltar: Voltar): Promise<void> {
  const ctx = await contextoAdmin("pedidos");
  const destino = voltar === "retirada" ? "/admin/retirada" : `/admin/pedidos/${id}`;

  const { data: pedido } = await ctx.supabase
    .from("pedidos")
    .select("id, status, asaas_payment_id")
    .eq("id", id)
    .maybeSingle();
  if (!pedido || !podeTransicionarAdmin(pedido.status, acao)) redirect(`${destino}?erro=transicao`);

  // Cancelar o pedido cancela a cobrança no Asaas; se falhar, o pedido NÃO é cancelado.
  if (acao === "cancelar" && pedido.asaas_payment_id) {
    try {
      await cancelarCobranca(pedido.asaas_payment_id);
    } catch {
      redirect(`${destino}?erro=asaas`);
    }
  }

  const { data: atualizados } = await ctx.supabase
    .from("pedidos")
    .update({ status: statusDaAcao(acao) })
    .eq("id", id)
    .eq("status", pedido.status)
    .select("id");
  if (!atualizados?.length) redirect(`${destino}?erro=transicao`);

  await registrarAcao(ctx, acao, "pedido", id, { de: pedido.status, para: statusDaAcao(acao) });
  revalidatePath("/admin", "layout");
  redirect(destino);
}

export async function marcarDisponivel(id: string, voltar: Voltar = "pedido"): Promise<void> {
  return aplicar(id, "disponivel", voltar);
}

export async function marcarRetirado(id: string, voltar: Voltar = "pedido"): Promise<void> {
  return aplicar(id, "retirado", voltar);
}

export async function cancelarPedido(id: string): Promise<void> {
  return aplicar(id, "cancelar", "pedido");
}
