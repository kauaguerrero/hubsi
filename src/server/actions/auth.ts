"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { getClientIp } from "@/lib/utils/ip";
import type { EstadoForm } from "./pedidos";

const schemaLogin = z.object({
  email: z.string().trim().toLowerCase().pipe(z.email()),
  senha: z.string().min(1).max(200),
});

/** Login com e-mail e senha. Erro sempre genérico: não revela se o e-mail existe. */
export async function entrarComSenha(_anterior: EstadoForm, fd: FormData): Promise<EstadoForm> {
  const dados = schemaLogin.safeParse({ email: fd.get("email"), senha: fd.get("senha") });
  if (!dados.success) return { erro: "Informe e-mail e senha." };

  const admin = createAdminClient();
  const ip = await getClientIp();
  const { data: permitido } = await admin.rpc("checar_rate_limit", {
    p_chave: `login:${ip}`,
    p_limite: 10,
    p_janela_segundos: 600,
  });
  if (!permitido) return { erro: "Muitas tentativas. Aguarde alguns minutos." };

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email: dados.data.email,
    password: dados.data.senha,
  });
  if (error || !data.user) return { erro: "E-mail ou senha incorretos." };

  const { data: perfil } = await admin.from("perfis_admin").select("user_id").eq("user_id", data.user.id).maybeSingle();
  if (!perfil) {
    await supabase.auth.signOut();
    return { erro: "E-mail ou senha incorretos." };
  }
  redirect("/admin");
}

export async function sair(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}
