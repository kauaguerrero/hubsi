import { createHash, timingSafeEqual } from "node:crypto";
import { z } from "zod";
import type { Enums } from "@/types/helpers";

type StatusPedido = Enums<"status_pedido">;
type FormaPagamento = Enums<"forma_pagamento">;

/** Comparação em tempo constante (hash antes para igualar o tamanho dos buffers). */
export function tokenValido(recebido: string | null | undefined, esperado: string): boolean {
  if (!recebido || !esperado) return false;
  const a = createHash("sha256").update(recebido).digest();
  const b = createHash("sha256").update(esperado).digest();
  return timingSafeEqual(a, b);
}

const eventoSchema = z.object({
  id: z.string().min(1),
  event: z.string().min(1),
  payment: z
    .object({
      id: z.string().optional(),
      externalReference: z.string().nullish(),
      billingType: z.string().nullish(),
    })
    .optional(),
});
export type EventoAsaas = z.infer<typeof eventoSchema>;

export type Transicao = { status: StatusPedido } | { status: null; motivo: string };

/** Regras de transição. Qualquer coisa fora delas é ignorada (e registrada). */
export function proximoStatus(atual: StatusPedido, evento: string): Transicao {
  switch (evento) {
    case "PAYMENT_RECEIVED":
    case "PAYMENT_CONFIRMED":
      if (atual === "aguardando_pagamento") return { status: "pago" };
      return { status: null, motivo: `pagamento recebido com pedido em '${atual}'` };
    case "PAYMENT_OVERDUE":
      if (atual === "aguardando_pagamento") return { status: "expirado" };
      return { status: null, motivo: `vencimento com pedido em '${atual}'` };
    case "PAYMENT_REFUNDED":
      if (atual === "pago" || atual === "em_producao" || atual === "disponivel") return { status: "estornado" };
      return { status: null, motivo: `estorno com pedido em '${atual}'` };
    default:
      return { status: null, motivo: `evento '${evento}' não tratado` };
  }
}

export function formaPagamentoDe(billingType: string | null | undefined): FormaPagamento | null {
  if (billingType === "PIX") return "pix";
  if (billingType === "CREDIT_CARD") return "cartao";
  return null;
}

export type PedidoDoWebhook = { id: string; status: StatusPedido };
export type AtualizacaoPedido = { status: StatusPedido; pago_em?: string; forma_pagamento?: FormaPagamento };

export interface WebhookRepo {
  /** true = evento novo; false = já registrado antes. */
  registrarEvento(e: { id: string; tipo: string; payload: unknown }): Promise<boolean>;
  removerEvento(id: string): Promise<void>;
  registrarResultado(id: string, resultado: string): Promise<void>;
  buscarPedido(pedidoId: string): Promise<PedidoDoWebhook | null>;
  /** Só atualiza se o status ainda for `statusEsperado`. Retorna se atualizou. */
  atualizarPedido(pedidoId: string, statusEsperado: StatusPedido, dados: AtualizacaoPedido): Promise<boolean>;
}

export type ResultadoWebhook = { status: number; mensagem: string };

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function tratarWebhook(
  entrada: { tokenRecebido: string | null; tokenEsperado: string; corpo: unknown },
  repo: WebhookRepo,
  aoConfirmarPagamento: (pedidoId: string) => Promise<void>,
  agora: () => Date = () => new Date(),
): Promise<ResultadoWebhook> {
  if (!tokenValido(entrada.tokenRecebido, entrada.tokenEsperado)) {
    return { status: 401, mensagem: "não autorizado" };
  }

  const parsed = eventoSchema.safeParse(entrada.corpo);
  if (!parsed.success) return { status: 400, mensagem: "payload inválido" };
  const evento = parsed.data;

  let registrado = false;
  try {
    const novo = await repo.registrarEvento({ id: evento.id, tipo: evento.event, payload: entrada.corpo });
    if (!novo) return { status: 200, mensagem: "evento repetido" };
    registrado = true;

    const referencia = evento.payment?.externalReference ?? null;
    if (!referencia || !UUID.test(referencia)) {
      await repo.registrarResultado(evento.id, "ignorado: sem externalReference de pedido");
      return { status: 200, mensagem: "ignorado" };
    }

    const pedido = await repo.buscarPedido(referencia);
    if (!pedido) {
      await repo.registrarResultado(evento.id, "ignorado: pedido inexistente");
      return { status: 200, mensagem: "ignorado" };
    }

    const transicao = proximoStatus(pedido.status, evento.event);
    if (transicao.status === null) {
      await repo.registrarResultado(evento.id, `ignorado: ${transicao.motivo}`);
      return { status: 200, mensagem: "ignorado" };
    }

    const dados: AtualizacaoPedido = { status: transicao.status };
    if (transicao.status === "pago") {
      dados.pago_em = agora().toISOString();
      const forma = formaPagamentoDe(evento.payment?.billingType);
      if (forma) dados.forma_pagamento = forma;
    }

    const atualizou = await repo.atualizarPedido(pedido.id, pedido.status, dados);
    if (!atualizou) {
      await repo.registrarResultado(evento.id, "ignorado: pedido mudou de status durante o processamento");
      return { status: 200, mensagem: "ignorado" };
    }

    await repo.registrarResultado(evento.id, `processado: ${pedido.status} → ${transicao.status}`);

    if (transicao.status === "pago") {
      try {
        await aoConfirmarPagamento(pedido.id);
      } catch {
        // E-mail não deve forçar reenvio do webhook (o status já foi gravado).
        console.error("[webhook asaas] falha ao enviar e-mail de confirmação");
      }
    }
    return { status: 200, mensagem: "processado" };
  } catch {
    // Libera o id do evento para o reenvio do Asaas conseguir reprocessar.
    if (registrado) {
      try {
        await repo.removerEvento(evento.id);
      } catch {
        // melhor esforço
      }
    }
    return { status: 500, mensagem: "erro interno" };
  }
}
