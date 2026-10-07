import "server-only";
import { codigoPedidoValido, normalizarCodigoPedido } from "@/lib/utils/codigo-pedido";
import { createAdminClient } from "@/lib/supabase/admin";

/** Só campos públicos: nunca CPF, e-mail ou WhatsApp. */
export async function getPedidoPublico(codigoBruto: string) {
  const codigo = normalizarCodigoPedido(codigoBruto);
  if (!codigoPedidoValido(codigo)) return null;

  const admin = createAdminClient();
  const { data } = await admin
    .from("pedidos")
    .select(
      `id, codigo, status, forma_pagamento, total_centavos, invoice_url, asaas_payment_id, created_at, pago_em,
       lotes(nome, fecha_em, local_retirada, data_retirada),
       itens_pedido(id, quantidade, preco_unitario, produtos(nome, aceita_cartao), variacoes(tamanho, cor))`,
    )
    .eq("codigo", codigo)
    .maybeSingle();
  return data;
}

export type PedidoPublico = NonNullable<Awaited<ReturnType<typeof getPedidoPublico>>>;
