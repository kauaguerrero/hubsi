import "server-only";
import { enviarConfirmacaoPedido } from "@/lib/email/resend";
import { publicEnv } from "@/lib/env";
import { createAdminClient } from "@/lib/supabase/admin";

/** Busca os dados do pedido pago e envia o e-mail de confirmação. */
export async function notificarPagamentoConfirmado(pedidoId: string): Promise<void> {
  const admin = createAdminClient();
  const { data: pedido } = await admin
    .from("pedidos")
    .select(
      `codigo, total_centavos,
       clientes(nome, email),
       lotes(local_retirada, data_retirada),
       itens_pedido(quantidade, preco_unitario, produtos(nome), variacoes(tamanho, cor))`,
    )
    .eq("id", pedidoId)
    .maybeSingle();
  if (!pedido?.clientes) return;

  await enviarConfirmacaoPedido(pedido.clientes.email, {
    nome: pedido.clientes.nome,
    codigo: pedido.codigo,
    totalCentavos: pedido.total_centavos,
    itens: pedido.itens_pedido.map((i) => {
      const variacao = [i.variacoes?.tamanho, i.variacoes?.cor].filter(Boolean).join(" / ");
      return {
        descricao: `${i.produtos?.nome ?? "Produto"}${variacao ? ` (${variacao})` : ""}`,
        quantidade: i.quantidade,
        precoUnitario: i.preco_unitario,
      };
    }),
    retirada: pedido.lotes
      ? { local: pedido.lotes.local_retirada, data: pedido.lotes.data_retirada }
      : undefined,
    urlPedido: `${publicEnv.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "")}/pedido/${pedido.codigo}`,
  });
}
