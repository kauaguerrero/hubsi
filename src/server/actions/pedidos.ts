"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { AsaasIndisponivelError, criarCobranca } from "@/lib/asaas/cobranca";
import { STATUS_QUE_OCUPAM_ESTOQUE } from "@/lib/pedidos/status";
import { createAdminClient } from "@/lib/supabase/admin";
import { dataISOLocal } from "@/lib/utils/datas";
import { getClientIp } from "@/lib/utils/ip";
import { normalizarCodigoPedido, codigoPedidoValido } from "@/lib/utils/codigo-pedido";
import { pedidoSchema } from "@/lib/validators/schemas";
import { montarPedido } from "@/server/pedidos/calculo";

export type EstadoForm = { erro?: string; ok?: string; campos?: Record<string, string[] | undefined> };

const campo = (fd: FormData, nome: string) => String(fd.get(nome) ?? "");

function lerItens(fd: FormData): unknown {
  try {
    return JSON.parse(campo(fd, "itens") || "[]");
  } catch {
    return [];
  }
}

const ERRO_GENERICO = "Não foi possível processar agora. Tente novamente em instantes.";

export async function criarPedido(_anterior: EstadoForm, fd: FormData): Promise<EstadoForm> {
  const parsed = pedidoSchema.safeParse({
    nome: campo(fd, "nome"),
    cpf: campo(fd, "cpf"),
    email: campo(fd, "email"),
    whatsapp: campo(fd, "whatsapp"),
    turma: campo(fd, "turma"),
    itens: lerItens(fd),
    aceitePrivacidade: fd.get("aceitePrivacidade") === "on",
  });
  if (!parsed.success) {
    return { erro: "Confira os campos destacados.", campos: z.flattenError(parsed.error).fieldErrors };
  }
  const entrada = parsed.data;

  const admin = createAdminClient();

  // 1. Rate limit por IP (falha fechada).
  const ip = await getClientIp();
  const { data: permitido, error: erroRate } = await admin.rpc("checar_rate_limit", {
    p_chave: `pedido:${ip}`,
    p_limite: 5,
    p_janela_segundos: 600,
  });
  if (erroRate) return { erro: ERRO_GENERICO };
  if (!permitido) return { erro: "Muitas tentativas seguidas. Aguarde alguns minutos e tente de novo." };

  // 2-3. Lote, produtos e preços vêm do banco.
  const ids = [...new Set(entrada.itens.map((i) => i.produtoId))];
  const { data: produtos } = await admin
    .from("produtos")
    .select("id, lote_id, nome, preco_centavos, ativo, aceita_cartao, variacoes(id, ativo)")
    .in("id", ids);
  if (!produtos || produtos.length !== ids.length) return { erro: "Um dos produtos não está mais disponível." };

  const loteIds = new Set(produtos.map((p) => p.lote_id));
  const loteId = produtos[0]?.lote_id;
  if (loteIds.size !== 1 || !loteId) return { erro: "O carrinho mistura produtos de lotes diferentes." };

  const { data: lote } = await admin
    .from("lotes")
    .select("id, status, abre_em, fecha_em, limite_unidades")
    .eq("id", loteId)
    .maybeSingle();
  if (!lote) return { erro: "Lote não encontrado." };

  let unidadesJaVendidas = 0;
  if (lote.limite_unidades !== null) {
    const { data: vendidos } = await admin
      .from("itens_pedido")
      .select("quantidade, pedidos!inner(lote_id, status)")
      .eq("pedidos.lote_id", loteId)
      .in("pedidos.status", STATUS_QUE_OCUPAM_ESTOQUE);
    unidadesJaVendidas = (vendidos ?? []).reduce((s, i) => s + i.quantidade, 0);
  }

  const calculo = montarPedido({
    itens: entrada.itens,
    produtos: produtos.map((p) => ({ ...p, variacoes: p.variacoes.filter((v) => v.ativo) })),
    lote,
    unidadesJaVendidas,
  });
  if (!calculo.ok) return { erro: calculo.erro };

  // 4. Cliente (por CPF) + pedido + itens.
  const { data: cliente, error: erroCliente } = await admin
    .from("clientes")
    .upsert(
      { nome: entrada.nome, cpf: entrada.cpf, email: entrada.email, whatsapp: entrada.whatsapp, turma: entrada.turma ?? null },
      { onConflict: "cpf" },
    )
    .select("id, asaas_customer_id")
    .single();
  if (erroCliente || !cliente) return { erro: ERRO_GENERICO };

  const { data: pedido, error: erroPedido } = await admin
    .from("pedidos")
    .insert({ lote_id: loteId, cliente_id: cliente.id, total_centavos: calculo.total })
    .select("id, codigo")
    .single();
  if (erroPedido || !pedido) return { erro: ERRO_GENERICO };

  const { error: erroItens } = await admin.from("itens_pedido").insert(
    calculo.itens.map((i) => ({
      pedido_id: pedido.id,
      produto_id: i.produtoId,
      variacao_id: i.variacaoId,
      quantidade: i.quantidade,
      preco_unitario: i.precoUnitario,
    })),
  );
  if (erroItens) {
    await admin.from("pedidos").update({ status: "cancelado" }).eq("id", pedido.id);
    return { erro: ERRO_GENERICO };
  }

  // 5. Cobrança no Asaas (stub até a Fase 7).
  try {
    const cobranca = await criarCobranca({
      id: pedido.id,
      codigo: pedido.codigo,
      totalCentavos: calculo.total,
      vencimento: dataISOLocal(lote.fecha_em),
      aceitaCartao: produtos.every((p) => p.aceita_cartao),
      cliente: {
        nome: entrada.nome,
        cpf: entrada.cpf,
        email: entrada.email,
        whatsapp: entrada.whatsapp,
        asaasCustomerId: cliente.asaas_customer_id,
      },
    });
    await admin
      .from("pedidos")
      .update({ asaas_payment_id: cobranca.paymentId, invoice_url: cobranca.invoiceUrl })
      .eq("id", pedido.id);
    await admin.from("clientes").update({ asaas_customer_id: cobranca.customerId }).eq("id", cliente.id);
  } catch (e) {
    console.error("[criarPedido] falha ao criar cobrança:", e instanceof Error ? e.name : "erro");
    await admin.from("pedidos").update({ status: "cancelado" }).eq("id", pedido.id);
    return {
      erro:
        e instanceof AsaasIndisponivelError
          ? "O pagamento ainda não está disponível. Tente novamente mais tarde."
          : "Não foi possível gerar a cobrança. Tente novamente em instantes.",
    };
  }

  // 6.
  redirect(`/pedido/${pedido.codigo}?novo=1`);
}

/** /meus-pedidos: confere e-mail + código e leva para a página pública do pedido. */
export async function consultarPedido(_anterior: EstadoForm, fd: FormData): Promise<EstadoForm> {
  const email = campo(fd, "email").trim().toLowerCase();
  const codigo = normalizarCodigoPedido(campo(fd, "codigo"));
  const naoEncontrado = { erro: "Não encontramos um pedido com esses dados." };

  if (!email || !codigoPedidoValido(codigo)) return naoEncontrado;

  const admin = createAdminClient();
  const ip = await getClientIp();
  const { data: permitido, error: erroRate } = await admin.rpc("checar_rate_limit", {
    p_chave: `consulta:${ip}`,
    p_limite: 10,
    p_janela_segundos: 600,
  });
  if (erroRate) return { erro: ERRO_GENERICO };
  if (!permitido) return { erro: "Muitas consultas seguidas. Aguarde alguns minutos." };

  const { data } = await admin.from("pedidos").select("codigo, clientes(email)").eq("codigo", codigo).maybeSingle();
  if (!data || data.clientes?.email.trim().toLowerCase() !== email) return naoEncontrado;

  redirect(`/pedido/${data.codigo}`);
}
