import { PAPEIS_POR_AREA, type AreaAdmin } from "@/lib/auth/permissoes";
import { requireRole, type PerfilAdmin } from "@/lib/auth/roles";
import { createClient } from "@/lib/supabase/server";
import type { Json } from "@/types/database";

export type SupabaseServer = Awaited<ReturnType<typeof createClient>>;
export type ContextoAdmin = { perfil: PerfilAdmin; supabase: SupabaseServer };

/** Exige o papel da área e devolve o client com a sessão do usuário (RLS aplica). */
export async function contextoAdmin(area: AreaAdmin): Promise<ContextoAdmin> {
  const perfil = await requireRole(PAPEIS_POR_AREA[area]);
  return { perfil, supabase: await createClient() };
}

/** Grava em `log_acoes` (nunca inclua CPF/e-mail/WhatsApp em `detalhes`). */
export async function registrarAcao(
  ctx: ContextoAdmin,
  acao: string,
  entidade: string,
  entidadeId?: string,
  detalhes?: Record<string, unknown>,
): Promise<void> {
  await ctx.supabase.from("log_acoes").insert({
    user_id: ctx.perfil.userId,
    acao,
    entidade,
    entidade_id: entidadeId ?? null,
    detalhes: (detalhes ?? null) as Json,
  });
}
