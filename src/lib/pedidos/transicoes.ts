import type { Enums } from "@/types/helpers";

type Status = Enums<"status_pedido">;
export type AcaoAdminPedido = "disponivel" | "retirado" | "cancelar";

const PERMITIDAS: Record<AcaoAdminPedido, { de: Status[]; para: Status }> = {
  disponivel: { de: ["pago", "em_producao"], para: "disponivel" },
  retirado: { de: ["pago", "em_producao", "disponivel"], para: "retirado" },
  // Só pedidos não pagos podem ser cancelados (pagos exigem estorno no Asaas).
  cancelar: { de: ["aguardando_pagamento"], para: "cancelado" },
};

export function podeTransicionarAdmin(atual: Status, acao: AcaoAdminPedido): boolean {
  return PERMITIDAS[acao].de.includes(atual);
}

export function statusDaAcao(acao: AcaoAdminPedido): Status {
  return PERMITIDAS[acao].para;
}

export function acoesDisponiveis(atual: Status): AcaoAdminPedido[] {
  return (Object.keys(PERMITIDAS) as AcaoAdminPedido[]).filter((a) => podeTransicionarAdmin(atual, a));
}
