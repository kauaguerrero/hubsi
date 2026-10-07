import type { Enums } from "@/types/helpers";

type Status = Enums<"status_pedido">;
type Tom = "neutro" | "acento" | "sucesso" | "perigo";

export const STATUS_PEDIDO: Record<Status, { rotulo: string; tom: Tom }> = {
  aguardando_pagamento: { rotulo: "Aguardando pagamento", tom: "acento" },
  pago: { rotulo: "Pago", tom: "sucesso" },
  em_producao: { rotulo: "Em produção", tom: "sucesso" },
  disponivel: { rotulo: "Disponível para retirada", tom: "sucesso" },
  retirado: { rotulo: "Retirado", tom: "neutro" },
  expirado: { rotulo: "Expirado", tom: "perigo" },
  cancelado: { rotulo: "Cancelado", tom: "perigo" },
  estornado: { rotulo: "Estornado", tom: "perigo" },
};

/** Status que ainda ocupam unidades do lote. */
export const STATUS_QUE_OCUPAM_ESTOQUE: Status[] = [
  "aguardando_pagamento",
  "pago",
  "em_producao",
  "disponivel",
  "retirado",
];
