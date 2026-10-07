import { createPublicClient } from "@/lib/supabase/public";
import type { Tables } from "@/types/helpers";

export type Lote = Tables<"lotes">;
export type Variacao = Pick<Tables<"variacoes">, "id" | "tamanho" | "cor" | "ordem">;
export type ProdutoComVariacoes = Tables<"produtos"> & { variacoes: Variacao[] };

/** Lote aberto e dentro do prazo (o mais recente), ou null. */
export async function getLoteAberto(): Promise<Lote | null> {
  const supabase = createPublicClient();
  const { data } = await supabase
    .from("lotes")
    .select("*")
    .eq("status", "aberto")
    .lte("abre_em", new Date().toISOString())
    .gt("fecha_em", new Date().toISOString())
    .order("abre_em", { ascending: false })
    .limit(1)
    .maybeSingle();
  return data;
}

export async function getProdutosDoLote(loteId: string): Promise<ProdutoComVariacoes[]> {
  const supabase = createPublicClient();
  const { data } = await supabase
    .from("produtos")
    .select("*, variacoes(id, tamanho, cor, ordem)")
    .eq("lote_id", loteId)
    .order("ordem", { ascending: true });
  return (data ?? []).map((p) => ({ ...p, variacoes: [...p.variacoes].sort((a, b) => a.ordem - b.ordem) }));
}

export function aPartirDe(produtos: Pick<Tables<"produtos">, "preco_centavos">[]): number | null {
  return produtos.length ? Math.min(...produtos.map((p) => p.preco_centavos)) : null;
}
