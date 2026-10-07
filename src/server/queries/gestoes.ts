import { createPublicClient } from "@/lib/supabase/public";

export type GestaoAtiva = { id: string; nome: string; ano: number; slug: string; logo_url: string | null };

export async function getGestaoAtiva(): Promise<GestaoAtiva | null> {
  const supabase = createPublicClient();
  const { data } = await supabase
    .from("gestoes")
    .select("id, nome, ano, slug, logo_url")
    .eq("ativa", true)
    .maybeSingle();
  return data;
}
