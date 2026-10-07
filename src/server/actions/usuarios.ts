"use server";

import { revalidatePath } from "next/cache";
import { podeAlterarUsuario } from "@/lib/auth/permissoes";
import { publicEnv } from "@/lib/env";
import { createAdminClient } from "@/lib/supabase/admin";
import { conviteUsuarioSchema, papelSchema } from "@/lib/validators/schemas-admin";
import { contextoAdmin, registrarAcao } from "@/server/admin/contexto";
import type { EstadoForm } from "./pedidos";
import { erroZod, texto } from "./util";

async function contarSuperadmins(): Promise<number> {
  const { count } = await createAdminClient()
    .from("perfis_admin")
    .select("user_id", { count: "exact", head: true })
    .eq("papel", "superadmin");
  return count ?? 0;
}

export async function convidarUsuario(fd: FormData): Promise<EstadoForm | void> {
  const ctx = await contextoAdmin("usuarios");
  const parsed = conviteUsuarioSchema.safeParse({
    nome: texto(fd, "nome"),
    email: texto(fd, "email"),
    papel: texto(fd, "papel"),
  });
  if (!parsed.success) return erroZod(parsed.error);
  const { nome, email, papel } = parsed.data;

  const admin = createAdminClient();
  const { data, error } = await admin.auth.admin.inviteUserByEmail(email, {
    redirectTo: `${publicEnv.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "")}/auth/callback`,
  });
  if (error || !data.user) {
    return { erro: "Não foi possível enviar o convite. O e-mail pode já ter uma conta." };
  }

  const { error: erroPerfil } = await admin
    .from("perfis_admin")
    .insert({ user_id: data.user.id, nome, email, papel });
  if (erroPerfil) {
    await admin.auth.admin.deleteUser(data.user.id); // desfaz o convite
    return { erro: "Não foi possível registrar o perfil. Tente novamente." };
  }

  await registrarAcao(ctx, "convidar", "usuario", data.user.id, { papel });
  revalidatePath("/admin/usuarios");
  return { ok: "Convite enviado." };
}

export async function alterarPapel(userId: string, fd: FormData): Promise<EstadoForm | void> {
  const ctx = await contextoAdmin("usuarios");
  const novo = papelSchema.safeParse(texto(fd, "papel"));
  if (!novo.success) return { erro: "Papel inválido." };

  const admin = createAdminClient();
  const { data: alvo } = await admin.from("perfis_admin").select("papel").eq("user_id", userId).maybeSingle();
  if (!alvo) return { erro: "Usuário não encontrado." };

  const regra = podeAlterarUsuario({
    alvoId: userId,
    alvoPapel: alvo.papel,
    acao: { novoPapel: novo.data },
    executorId: ctx.perfil.userId,
    totalSuperadmins: await contarSuperadmins(),
  });
  if (!regra.ok) return { erro: regra.erro };

  const { error } = await admin.from("perfis_admin").update({ papel: novo.data }).eq("user_id", userId);
  if (error) return { erro: "Não foi possível alterar o papel." };
  await registrarAcao(ctx, "alterar_papel", "usuario", userId, { de: alvo.papel, para: novo.data });
  revalidatePath("/admin/usuarios");
  return { ok: "Papel atualizado." };
}

export async function removerUsuario(userId: string): Promise<void> {
  const ctx = await contextoAdmin("usuarios");
  const admin = createAdminClient();
  const { data: alvo } = await admin.from("perfis_admin").select("papel").eq("user_id", userId).maybeSingle();
  if (!alvo) return;

  const regra = podeAlterarUsuario({
    alvoId: userId,
    alvoPapel: alvo.papel,
    acao: "remover",
    executorId: ctx.perfil.userId,
    totalSuperadmins: await contarSuperadmins(),
  });
  if (!regra.ok) return; // a página não oferece o botão nesses casos; defesa em profundidade

  await admin.from("perfis_admin").delete().eq("user_id", userId);
  await admin.auth.admin.deleteUser(userId);
  await registrarAcao(ctx, "remover", "usuario", userId);
  revalidatePath("/admin/usuarios");
}
