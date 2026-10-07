import "server-only";
import { centavosParaReais } from "@/lib/utils/money";
import { buscarClientePorCpf, criarCliente, criarCobrancaAsaas } from "./client";
import type { BillingType } from "./types";

export { AsaasIndisponivelError } from "./errors";

export type PedidoParaCobranca = {
  id: string;
  codigo: string;
  totalCentavos: number;
  /** YYYY-MM-DD: data de fechamento do lote. */
  vencimento: string;
  aceitaCartao: boolean;
  cliente: { nome: string; cpf: string; email: string; whatsapp: string; asaasCustomerId: string | null };
};

export type CobrancaCriada = { customerId: string; paymentId: string; invoiceUrl: string | null };

/** UNDEFINED deixa o pagador escolher (Pix ou cartão); só Pix se algum produto não aceita cartão. */
export function billingTypeDoPedido(aceitaCartao: boolean): BillingType {
  return aceitaCartao ? "UNDEFINED" : "PIX";
}

/** Garante o cliente no Asaas e cria a cobrança do pedido. */
export async function criarCobranca(pedido: PedidoParaCobranca): Promise<CobrancaCriada> {
  let customerId = pedido.cliente.asaasCustomerId;

  if (!customerId) {
    const existente = await buscarClientePorCpf(pedido.cliente.cpf);
    const cliente =
      existente ??
      (await criarCliente({
        name: pedido.cliente.nome,
        cpfCnpj: pedido.cliente.cpf,
        email: pedido.cliente.email,
        mobilePhone: pedido.cliente.whatsapp,
        // Os avisos ao comprador saem do Hub S.I. (e-mail via Resend).
        notificationDisabled: true,
      }));
    customerId = cliente.id;
  }

  const cobranca = await criarCobrancaAsaas({
    customer: customerId,
    value: centavosParaReais(pedido.totalCentavos),
    dueDate: pedido.vencimento,
    billingType: billingTypeDoPedido(pedido.aceitaCartao),
    externalReference: pedido.id,
    description: `Pedido ${pedido.codigo} — Hub S.I.`,
  });

  return { customerId, paymentId: cobranca.id, invoiceUrl: cobranca.invoiceUrl };
}
