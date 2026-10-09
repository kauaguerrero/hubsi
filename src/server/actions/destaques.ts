"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { publicEnv } from "@/lib/env";
import { createAdminClient } from "@/lib/supabase/admin";
import { getClientIp } from "@/lib/utils/ip";
import { parseBRLParaCentavos } from "@/lib/utils/money";
import { caminhoNoStorage } from "@/lib/utils/storage";
import { destaqueSchema, interesseSchema, itemDestaqueSchema } from "@/lib/validators/destaques";
import { contextoAdmin, registrarAcao } from "@/server/admin/contexto";
import type { EstadoForm } from "./pedidos";
import { dataLocal, erroDoBanco, erroZod, numeroOuUndef, texto } from "./util";

function revalidar(id?: string) {
  revalidatePath("/", "layout");
  revalidatePath("/admin/destaques");
  if (id) revalidatePath(`/admin/destaques/${id}`);
}

export async function salvarDestaque(id: string | null, fd: FormData): Promise<EstadoForm | void> {
  const ctx = await contextoAdmin("destaques");

  const parsed = destaqueSchema.safeParse({
    slug: texto(fd, "slug"),
    titulo: texto(fd, "titulo"),
    descricao: texto(fd, "descricao"),
    tipo: texto(fd, "tipo"),
    status: texto(fd, "status"),
    dataEvento: dataLocal(fd, "data_evento"),
    expiraEm: dataLocal(fd, "expira_em"),
    ctaTexto: texto(fd, "cta_texto"),
    linkExterno: texto(fd, "link_externo"),
  });
  if (!parsed.success) return erroZod(parsed.error);
  const d = parsed.data;

  const dados = {
    slug: d.slug,
    titulo: d.titulo,
    descricao: d.descricao ?? null,
    tipo: d.tipo,
    status: d.status,
    data_evento: d.dataEvento?.toISOString() ?? null,
    expira_em: d.expiraEm?.toISOString() ?? null,
    cta_texto: d.ctaTexto ?? null,
    link_externo: d.tipo === "link" ? (d.linkExterno ?? null) : null,
  };

  if (id) {
    const { error } = await ctx.supabase.from("destaques").update(dados).eq("id", id);
    if (error) return erroDoBanco(error) ?? undefined;
    await registrarAcao(ctx, "atualizar", "destaque", id, { status: d.status });
    revalidar(id);
    return { ok: "Salvo." };
  }

  const { data, error } = await ctx.supabase.from("destaques").insert(dados).select("id").single();
  if (error || !data) return erroDoBanco(error) ?? { erro: "Não foi possível criar o destaque." };
  await registrarAcao(ctx, "criar", "destaque", data.id, { titulo: d.titulo });
  revalidar();
  redirect(`/admin/destaques/${data.id}`);
}

export async function excluirDestaque(id: string): Promise<void> {
  const ctx = await contextoAdmin("destaques");
  await ctx.supabase.from("destaques").delete().eq("id", id);
  await registrarAcao(ctx, "excluir", "destaque", id);
  revalidar();
  redirect("/admin/destaques");
}

export async function definirCapaDestaque(destaqueId: string, url: string): Promise<EstadoForm | void> {
  const ctx = await contextoAdmin("destaques");
  if (!caminhoNoStorage(url, publicEnv.NEXT_PUBLIC_SUPABASE_URL, "eventos")) return { erro: "URL de imagem inválida." };
  const { error } = await ctx.supabase.from("destaques").update({ capa_url: url }).eq("id", destaqueId);
  if (error) return erroDoBanco(error) ?? undefined;
  revalidar(destaqueId);
}

export async function adicionarItemDestaque(destaqueId: string, fd: FormData): Promise<EstadoForm | void> {
  const ctx = await contextoAdmin("destaques");
  const preco = texto(fd, "preco") ? parseBRLParaCentavos(texto(fd, "preco")) : 0;
  if (preco === null) return { erro: "Preço inválido." };

  const parsed = itemDestaqueSchema.safeParse({
    nome: texto(fd, "nome"),
    descricao: texto(fd, "descricao"),
    precoCentavos: preco,
    ordem: numeroOuUndef(fd, "ordem") ?? 0,
  });
  if (!parsed.success) return erroZod(parsed.error);

  const { error } = await ctx.supabase.from("destaque_itens").insert({
    destaque_id: destaqueId,
    nome: parsed.data.nome,
    descricao: parsed.data.descricao ?? null,
    preco_centavos: parsed.data.precoCentavos,
    ordem: parsed.data.ordem,
  });
  if (error) return erroDoBanco(error) ?? undefined;
  revalidar(destaqueId);
}

export async function removerItemDestaque(destaqueId: string, itemId: string): Promise<void> {
  const ctx = await contextoAdmin("destaques");
  await ctx.supabase.from("destaque_itens").delete().eq("id", itemId).eq("destaque_id", destaqueId);
  revalidar(destaqueId);
}

export async function alternarContatado(destaqueId: string, interessadoId: string, contatado: boolean): Promise<void> {
  const ctx = await contextoAdmin("destaques");
  await ctx.supabase
    .from("destaque_interessados")
    .update({ contatado_em: contatado ? new Date().toISOString() : null })
    .eq("id", interessadoId)
    .eq("destaque_id", destaqueId);
  revalidatePath(`/admin/destaques/${destaqueId}`);
}

export async function removerInteressado(destaqueId: string, interessadoId: string): Promise<void> {
  const ctx = await contextoAdmin("destaques");
  await ctx.supabase.from("destaque_interessados").delete().eq("id", interessadoId).eq("destaque_id", destaqueId);
  await registrarAcao(ctx, "excluir", "destaque_interessado", interessadoId);
  revalidatePath(`/admin/destaques/${destaqueId}`);
}

// ---------------------------------------------------------------------------
// Público: registrar interesse (escrita via service role, sempre com validação e rate limit)
// ---------------------------------------------------------------------------

const ERRO_GENERICO = "Não foi possível registrar agora. Tente novamente em instantes.";

function lerSelecao(fd: FormData): unknown {
  try {
    return JSON.parse(String(fd.get("selecao") ?? "[]"));
  } catch {
    return [];
  }
}

export async function registrarInteresse(destaqueId: string, _anterior: EstadoForm, fd: FormData): Promise<EstadoForm> {
  if (!z.uuid().safeParse(destaqueId).success) return { erro: ERRO_GENERICO };

  const parsed = interesseSchema.safeParse({
    nome: texto(fd, "nome"),
    email: texto(fd, "email"),
    whatsapp: texto(fd, "whatsapp"),
    turma: texto(fd, "turma"),
    observacao: texto(fd, "observacao"),
    selecao: lerSelecao(fd),
    aceitePrivacidade: fd.get("aceitePrivacidade") === "on",
  });
  if (!parsed.success) {
    return { erro: "Confira os campos destacados.", campos: z.flattenError(parsed.error).fieldErrors };
  }
  const entrada = parsed.data;

  const admin = createAdminClient();
  const ip = await getClientIp();
  const { data: permitido, error: erroRate } = await admin.rpc("checar_rate_limit", {
    p_chave: `interesse:${ip}`,
    p_limite: 8,
    p_janela_segundos: 600,
  });
  if (erroRate) return { erro: ERRO_GENERICO };
  if (!permitido) return { erro: "Muitas tentativas seguidas. Aguarde alguns minutos e tente de novo." };

  // Destaque e preços vêm do banco; nunca do navegador.
  const { data: destaque } = await admin
    .from("destaques")
    .select("id, tipo, status, expira_em")
    .eq("id", destaqueId)
    .maybeSingle();
  if (!destaque || destaque.status !== "publicado" || destaque.tipo !== "formulario") {
    return { erro: "Este formulário não está disponível." };
  }
  if (destaque.expira_em && new Date(destaque.expira_em) <= new Date()) {
    return { erro: "Este formulário já foi encerrado." };
  }

  const { data: itens } = await admin
    .from("destaque_itens")
    .select("id, preco_centavos")
    .eq("destaque_id", destaqueId)
    .in(
      "id",
      entrada.selecao.map((s) => s.itemId),
    );
  const preco = new Map((itens ?? []).map((i) => [i.id, i.preco_centavos]));
  if (entrada.selecao.some((s) => !preco.has(s.itemId))) {
    return { erro: "Algum item escolhido não está mais disponível." };
  }

  // Mesmo e-mail (salvo em minúsculas) no mesmo destaque atualiza o registro anterior.
  const { data: existente } = await admin
    .from("destaque_interessados")
    .select("id")
    .eq("destaque_id", destaqueId)
    .eq("email", entrada.email)
    .maybeSingle();

  const pessoa = {
    nome: entrada.nome,
    email: entrada.email,
    whatsapp: entrada.whatsapp,
    turma: entrada.turma ?? null,
    observacao: entrada.observacao ?? null,
    aceite_privacidade_em: new Date().toISOString(),
  };

  let interessadoId = existente?.id;
  if (interessadoId) {
    const { error } = await admin.from("destaque_interessados").update(pessoa).eq("id", interessadoId);
    if (error) return { erro: ERRO_GENERICO };
    await admin.from("destaque_interesses").delete().eq("interessado_id", interessadoId);
  } else {
    const { data, error } = await admin
      .from("destaque_interessados")
      .insert({ destaque_id: destaqueId, ...pessoa })
      .select("id")
      .single();
    if (error || !data) return { erro: ERRO_GENERICO };
    interessadoId = data.id;
  }

  const { error: erroItens } = await admin.from("destaque_interesses").insert(
    entrada.selecao.map((s) => ({
      interessado_id: interessadoId,
      item_id: s.itemId,
      quantidade: s.quantidade,
      preco_centavos: preco.get(s.itemId) ?? 0,
    })),
  );
  if (erroItens) return { erro: ERRO_GENERICO };

  return {
    ok: existente
      ? "Interesse atualizado! Avisaremos você quando abrir."
      : "Interesse registrado! Avisaremos você quando abrir.",
  };
}
