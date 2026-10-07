"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { publicEnv } from "@/lib/env";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { getClientIp } from "@/lib/utils/ip";
import type { EstadoForm } from "./pedidos";

const MENSAGEM_PADRAO = "Se este e-mail tiver acesso ao painel, enviamos um link de login. Confira sua caixa de entrada.";

/** Envia o link mágico. Resposta sempre genérica: não revela se o e-mail tem acesso. */
export async function enviarLinkLogin(_anterior: EstadoForm, fd: FormData): Promise<EstadoForm> {
  const email = z.string().trim().toLowerCase().pipe(z.email()).safeParse(fd.get("email"));
  if (!email.success) return { erro: "Informe um e-mail válido." };

  const admin = createAdminClient();
  const ip = await getClientIp();
  const { data: permitido } = await admin.rpc("checar_rate_limit", {
    p_chave: `login:${ip}`,
    p_limite: 5,
    p_janela_segundos: 600,
  });
  if (!permitido) return { erro: "Muitas tentativas. Aguarde alguns minutos." };

  const { data: perfil } = await admin.from("perfis_admin").select("user_id").eq("email", email.data).maybeSingle();
  if (perfil) {
    const supabase = await createClient();
    await supabase.auth.signInWithOtp({
      email: email.data,
      options: {
        shouldCreateUser: false,
        emailRedirectTo: `${publicEnv.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "")}/auth/callback`,
      },
    });
  }
  return { ok: MENSAGEM_PADRAO };
}

export async function sair(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}
