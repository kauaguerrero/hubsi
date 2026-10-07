import "server-only";

export class AsaasIndisponivelError extends Error {
  constructor(mensagem = "Integração com o Asaas indisponível") {
    super(mensagem);
    this.name = "AsaasIndisponivelError";
  }
}

export type PedidoParaCobranca = {
  id: string;
  codigo: string;
  totalCentavos: number;
  vencimento: string;
  aceitaCartao: boolean;
  cliente: { nome: string; cpf: string; email: string; whatsapp: string; asaasCustomerId: string | null };
};

export type CobrancaCriada = { customerId: string; paymentId: string; invoiceUrl: string | null };

/** STUB (Fase 6). A integração real entra na Fase 7. */
export async function criarCobranca(pedido: PedidoParaCobranca): Promise<CobrancaCriada> {
  void pedido;
  throw new AsaasIndisponivelError("Integração com o Asaas ainda não implementada");
}
