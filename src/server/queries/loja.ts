import { createPublicClient } from "@/lib/supabase/public";
import type { Tables } from "@/types/helpers";

export type Lote = Tables<"lotes">;
export type Variacao = Pick<Tables<"variacoes">, "id" | "tamanho" | "cor" | "ordem">;
export type ProdutoComVariacoes = Tables<"produtos"> & { variacoes: Variacao[] };
export type ProdutoComLote = ProdutoComVariacoes & { lotes: Lote };

/** Lote aberto e dentro do prazo (o mais recente), ou null. */
export async function getLoteAberto(): Promise<Lote | null> {
  const supabase = createPublicClient();
  const agora = new Date().toISOString();
  const { data } = await supabase
    .from("lotes")
    .select("*")
    .eq("status", "aberto")
    .lte("abre_em", agora)
    .gt("fecha_em", agora)
    .order("abre_em", { ascending: false })
    .limit(1)
    .maybeSingle();
  return data;
}

/** Lote mais recente de qualquer status (para avisar que as vendas encerraram). */
export async function getUltimoLote(): Promise<Lote | null> {
  const supabase = createPublicClient();
  const { data } = await supabase.from("lotes").select("*").order("abre_em", { ascending: false }).limit(1).maybeSingle();
  return data;
}

const ordenar = (v: Variacao[]) => [...v].sort((a, b) => a.ordem - b.ordem);

export async function getProdutosDoLote(loteId: string): Promise<ProdutoComVariacoes[]> {
  const supabase = createPublicClient();
  const { data } = await supabase
    .from("produtos")
    .select("*, variacoes(id, tamanho, cor, ordem)")
    .eq("lote_id", loteId)
    .order("ordem", { ascending: true });
  return (data ?? []).map((p) => ({ ...p, variacoes: ordenar(p.variacoes) }));
}

export async function getProdutoPorSlug(slug: string): Promise<ProdutoComLote | null> {
  const supabase = createPublicClient();
  const { data } = await supabase
    .from("produtos")
    .select("*, variacoes(id, tamanho, cor, ordem), lotes(*)")
    .eq("slug", slug)
    .maybeSingle();
  if (!data || !data.lotes) return null;
  return { ...data, variacoes: ordenar(data.variacoes), lotes: data.lotes };
}

export async function listarSlugsProdutos(): Promise<string[]> {
  const supabase = createPublicClient();
  const { data } = await supabase.from("produtos").select("slug");
  return (data ?? []).map((p) => p.slug);
}

export function rotuloVariacao(v: Pick<Variacao, "tamanho" | "cor">): string {
  return [v.tamanho, v.cor].filter(Boolean).join(" / ");
}
