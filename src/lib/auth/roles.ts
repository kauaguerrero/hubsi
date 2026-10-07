import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";

export type PapelAdmin = Database["public"]["Enums"]["papel_admin"];

export type PerfilAdmin = {
  userId: string;
  nome: string;
  email: string;
  papel: PapelAdmin;
};

export function papelPermitido(
  papel: PapelAdmin | null | undefined,
  permitidos: readonly PapelAdmin[],
): boolean {
  return !!papel && permitidos.includes(papel);
}

/** Perfil do usuário logado, ou null se não houver sessão/perfil. */
export async function getPerfil(): Promise<PerfilAdmin | null> {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return null;

  const { data } = await supabase
    .from("perfis_admin")
    .select("user_id, nome, email, papel")
    .eq("user_id", auth.user.id)
    .maybeSingle();
  if (!data) return null;

  return { userId: data.user_id, nome: data.nome, email: data.email, papel: data.papel };
}

/** Exige um dos papéis; caso contrário redireciona para /admin/login. */
export async function requireRole(papeis: readonly PapelAdmin[]): Promise<PerfilAdmin> {
  const perfil = await getPerfil();
  if (!perfil || !papelPermitido(perfil.papel, papeis)) {
    redirect("/admin/login");
  }
  return perfil;
}
