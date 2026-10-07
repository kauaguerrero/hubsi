import { createPublicClient } from "@/lib/supabase/public";
import type { Tables } from "@/types/helpers";

export type LinkHub = Tables<"links_hub">;

export async function listarLinksHub(): Promise<LinkHub[]> {
  const supabase = createPublicClient();
  const { data } = await supabase
    .from("links_hub")
    .select("*")
    .order("categoria", { ascending: true })
    .order("ordem", { ascending: true });
  return data ?? [];
}

export function agruparPorCategoria(links: LinkHub[]): [string, LinkHub[]][] {
  const mapa = new Map<string, LinkHub[]>();
  for (const l of links) mapa.set(l.categoria, [...(mapa.get(l.categoria) ?? []), l]);
  return [...mapa.entries()];
}
