import { createPublicClient } from "@/lib/supabase/public";
import type { Tables } from "@/types/helpers";

export type GestaoAtiva = {
  id: string;
  nome: string;
  ano: number;
  slug: string;
  logo_url: string | null;
};
export type Membro = Pick<
  Tables<"membros_gestao">,
  "id" | "nome" | "cargo" | "foto_url" | "ordem" | "superior_id"
>;
export type GestaoComMembros = Tables<"gestoes"> & { membros_gestao: Membro[] };

export async function getGestaoAtiva(): Promise<GestaoAtiva | null> {
  const supabase = createPublicClient();
  const { data } = await supabase
    .from("gestoes")
    .select("id, nome, ano, slug, logo_url")
    .eq("ativa", true)
    .maybeSingle();
  return data;
}

/** Todas as gestões (mais recentes primeiro) com seus membros ordenados. */
export async function listarGestoes(): Promise<GestaoComMembros[]> {
  const supabase = createPublicClient();
  const { data } = await supabase
    .from("gestoes")
    .select("*, membros_gestao(id, nome, cargo, foto_url, ordem, superior_id)")
    .order("ano", { ascending: false });
  return (data ?? []).map((g) => ({
    ...g,
    membros_gestao: [...g.membros_gestao].sort((a, b) => a.ordem - b.ordem),
  }));
}
