"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { publicEnv } from "@/lib/env";
import { caminhoNoStorage } from "@/lib/utils/storage";
import { parseBRLParaCentavos } from "@/lib/utils/money";
import { produtoSchema } from "@/lib/validators/schemas";
import { contextoAdmin, registrarAcao } from "@/server/admin/contexto";
import type { EstadoForm } from "./pedidos";
import { erroDoBanco, erroZod, marcado, texto } from "./util";

export async function salvarProduto(id: string | null, fd: FormData): Promise<EstadoForm | void> {
  const ctx = await contextoAdmin("produtos");

  const preco = parseBRLParaCentavos(texto(fd, "preco"));
  if (preco === null) return { erro: "Preço inválido. Use o formato 65,00.", campos: { preco: ["Preço inválido"] } };

  const parsed = produtoSchema.safeParse({
    loteId: texto(fd, "lote_id"),
    slug: texto(fd, "slug"),
    nome: texto(fd, "nome"),
    descricao: texto(fd, "descricao"),
    categoria: texto(fd, "categoria"),
    precoCentavos: preco,
    aceitaCartao: marcado(fd, "aceita_cartao"),
    ativo: marcado(fd, "ativo"),
  });
  if (!parsed.success) return erroZod(parsed.error);
  const p = parsed.data;

  const dados = {
    lote_id: p.loteId,
    slug: p.slug,
    nome: p.nome,
    descricao: p.descricao ?? null,
    categoria: p.categoria,
    preco_centavos: p.precoCentavos,
    aceita_cartao: p.aceitaCartao,
    ativo: p.ativo,
  };

  let produtoId = id;
  if (id) {
    const { error } = await ctx.supabase.from("produtos").update(dados).eq("id", id);
    if (error) return erroDoBanco(error) ?? undefined;
    await registrarAcao(ctx, "atualizar", "produto", id);
  } else {
    const { data, error } = await ctx.supabase.from("produtos").insert(dados).select("id").single();
    if (error || !data) return erroDoBanco(error) ?? { erro: "Não foi possível criar o produto." };
    produtoId = data.id;
    await registrarAcao(ctx, "criar", "produto", data.id, { nome: p.nome });
  }

  revalidatePath("/", "layout");
  // Produto novo: segue para a edição, onde dá para enviar fotos e criar variações.
  redirect(id ? "/admin/produtos" : `/admin/produtos/${produtoId}`);
}

export async function excluirProduto(id: string): Promise<void> {
  const ctx = await contextoAdmin("produtos");
  const { error } = await ctx.supabase.from("produtos").delete().eq("id", id);
  if (error) redirect("/admin/produtos?erro=em-uso");
  await registrarAcao(ctx, "excluir", "produto", id);
  revalidatePath("/", "layout");
  redirect("/admin/produtos");
}

export async function adicionarVariacao(produtoId: string, fd: FormData): Promise<EstadoForm | void> {
  const ctx = await contextoAdmin("produtos");
  const tamanho = texto(fd, "tamanho");
  const cor = texto(fd, "cor");
  if (!tamanho && !cor) return { erro: "Informe tamanho e/ou cor." };

  const { error } = await ctx.supabase
    .from("variacoes")
    .insert({ produto_id: produtoId, tamanho: tamanho || null, cor: cor || null });
  if (error) return erroDoBanco(error) ?? undefined;
  await registrarAcao(ctx, "criar", "variacao", produtoId, { tamanho, cor });
  revalidatePath("/", "layout");
  revalidatePath(`/admin/produtos/${produtoId}`);
}

/** Remove a variação; se já foi vendida, apenas desativa (preserva os pedidos). */
export async function removerVariacao(produtoId: string, variacaoId: string): Promise<void> {
  const ctx = await contextoAdmin("produtos");
  const { error } = await ctx.supabase.from("variacoes").delete().eq("id", variacaoId);
  if (error) await ctx.supabase.from("variacoes").update({ ativo: false }).eq("id", variacaoId);
  await registrarAcao(ctx, error ? "desativar" : "excluir", "variacao", variacaoId);
  revalidatePath("/", "layout");
  revalidatePath(`/admin/produtos/${produtoId}`);
}

export async function adicionarFoto(produtoId: string, url: string): Promise<EstadoForm | void> {
  const ctx = await contextoAdmin("produtos");
  if (!caminhoNoStorage(url, publicEnv.NEXT_PUBLIC_SUPABASE_URL, "produtos")) return { erro: "URL de imagem inválida." };

  const { data } = await ctx.supabase.from("produtos").select("fotos").eq("id", produtoId).maybeSingle();
  if (!data) return { erro: "Produto não encontrado." };
  const { error } = await ctx.supabase.from("produtos").update({ fotos: [...data.fotos, url] }).eq("id", produtoId);
  if (error) return erroDoBanco(error) ?? undefined;
  await registrarAcao(ctx, "adicionar_foto", "produto", produtoId);
  revalidatePath("/", "layout");
}

export async function removerFoto(produtoId: string, url: string): Promise<void> {
  const ctx = await contextoAdmin("produtos");
  const { data } = await ctx.supabase.from("produtos").select("fotos").eq("id", produtoId).maybeSingle();
  if (!data) return;
  await ctx.supabase.from("produtos").update({ fotos: data.fotos.filter((f) => f !== url) }).eq("id", produtoId);
  const caminho = caminhoNoStorage(url, publicEnv.NEXT_PUBLIC_SUPABASE_URL, "produtos");
  if (caminho) await ctx.supabase.storage.from("produtos").remove([caminho]);
  await registrarAcao(ctx, "remover_foto", "produto", produtoId);
  revalidatePath("/", "layout");
  revalidatePath(`/admin/produtos/${produtoId}`);
}
