import { resumirGrafica, type LinhaResumo } from "@/lib/pedidos/grafica";
import type { SupabaseServer } from "@/server/admin/contexto";

const STATUS_PAGOS = ["pago", "em_producao", "disponivel", "retirado"] as const;

/** Resumo por produto/variação dos pedidos pagos de um lote. Sem dados pessoais. */
export async function buscarResumoGrafica(supabase: SupabaseServer, loteId: string): Promise<LinhaResumo[]> {
  const { data } = await supabase
    .from("itens_pedido")
    .select("quantidade, produtos(nome), variacoes(tamanho, cor), pedidos!inner(lote_id, status)")
    .eq("pedidos.lote_id", loteId)
    .in("pedidos.status", [...STATUS_PAGOS]);

  return resumirGrafica(
    (data ?? []).map((i) => ({
      produto: i.produtos?.nome ?? "Produto removido",
      tamanho: i.variacoes?.tamanho ?? null,
      cor: i.variacoes?.cor ?? null,
      quantidade: i.quantidade,
    })),
  );
}
