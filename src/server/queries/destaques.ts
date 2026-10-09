import { createPublicClient } from "@/lib/supabase/public";
import type { Tables } from "@/types/helpers";

export type Destaque = Tables<"destaques">;
export type ItemDestaque = Pick<
  Tables<"destaque_itens">,
  "id" | "nome" | "descricao" | "preco_centavos" | "foto_url" | "ordem"
>;
export type DestaqueComItens = Destaque & { itens: ItemDestaque[] };

/** Destaque publicado e não expirado que aparece na home (o mais recente). */
export async function getDestaqueAtivo(): Promise<Destaque | null> {
  const supabase = createPublicClient();
  const agora = new Date().toISOString();
  const { data } = await supabase
    .from("destaques")
    .select("*")
    .eq("status", "publicado")
    .or(`expira_em.is.null,expira_em.gt.${agora}`)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  return data;
}

/** Destaque publicado (mesmo expirado, para a página mostrar "encerrado"). */
export async function getDestaquePorSlug(slug: string): Promise<DestaqueComItens | null> {
  const supabase = createPublicClient();
  const { data } = await supabase
    .from("destaques")
    .select("*, itens:destaque_itens(id, nome, descricao, preco_centavos, foto_url, ordem)")
    .eq("slug", slug)
    .maybeSingle();
  if (!data) return null;
  return { ...data, itens: [...data.itens].sort((a, b) => a.ordem - b.ordem) };
}
