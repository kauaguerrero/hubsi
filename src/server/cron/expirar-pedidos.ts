export type PedidoAguardando = {
  id: string;
  asaas_payment_id: string | null;
  lote_status: string;
  lote_fecha_em: string;
};

export interface RepoCron {
  listarAguardando(): Promise<PedidoAguardando[]>;
  /** Só muda se o pedido ainda estiver aguardando pagamento. */
  marcarExpirado(id: string): Promise<void>;
}

export function deveExpirar(p: PedidoAguardando, agora: Date): boolean {
  return p.lote_status !== "aberto" || new Date(p.lote_fecha_em) <= agora;
}

/** Cancela no Asaas e expira pedidos aguardando de lotes fechados. */
export async function expirarPedidos(
  repo: RepoCron,
  cancelar: (paymentId: string) => Promise<void>,
  agora = new Date(),
): Promise<{ expirados: number; falhas: number }> {
  let expirados = 0;
  let falhas = 0;

  for (const pedido of (await repo.listarAguardando()).filter((p) => deveExpirar(p, agora))) {
    try {
      if (pedido.asaas_payment_id) await cancelar(pedido.asaas_payment_id);
      await repo.marcarExpirado(pedido.id);
      expirados++;
    } catch {
      // Não expira se não conseguiu cancelar no Asaas: tenta de novo na próxima execução.
      falhas++;
    }
  }
  return { expirados, falhas };
}
