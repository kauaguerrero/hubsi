import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LimparCarrinho } from "@/components/loja/limpar-carrinho";
import { Badge, Card } from "@/components/ui/display";
import { STATUS_PEDIDO } from "@/lib/pedidos/status";
import { formatarDataHora } from "@/lib/utils/datas";
import { formatarBRL } from "@/lib/utils/money";
import { getPedidoPublico } from "@/server/queries/pedidos";

// Status do pedido muda por webhook: nunca servir versão em cache.
export const revalidate = 0;

export const metadata: Metadata = { title: "Pedido", robots: { index: false, follow: false } };

export default async function PedidoPage({
  params,
  searchParams,
}: PageProps<"/pedido/[codigo]">) {
  const { codigo } = await params;
  const { novo } = await searchParams;
  const pedido = await getPedidoPublico(codigo);
  if (!pedido) notFound();

  const status = STATUS_PEDIDO[pedido.status];
  const lote = pedido.lotes;

  return (
    <div className="flex max-w-2xl flex-col gap-8">
      {novo && pedido.status !== "cancelado" && <LimparCarrinho />}

      <header className="flex flex-col gap-3">
        <p className="font-mono text-sm text-muted">Pedido</p>
        <h1 className="font-mono text-4xl sm:text-5xl">{pedido.codigo}</h1>
        <div className="flex flex-wrap items-center gap-3">
          <Badge tom={status.tom}>{status.rotulo}</Badge>
          <span className="font-mono text-sm text-muted">{formatarDataHora(pedido.created_at)}</span>
        </div>
      </header>

      <Card className="flex flex-col gap-4">
        <h2 className="text-2xl">Itens</h2>
        <ul className="flex flex-col gap-3">
          {pedido.itens_pedido.map((i) => (
            <li key={i.id} className="flex justify-between gap-4">
              <span>
                {i.quantidade}× {i.produtos?.nome}
                {i.variacoes && (
                  <span className="text-muted"> ({[i.variacoes.tamanho, i.variacoes.cor].filter(Boolean).join(" / ")})</span>
                )}
              </span>
              <span className="font-mono">{formatarBRL(i.preco_unitario * i.quantidade)}</span>
            </li>
          ))}
        </ul>
        <p className="flex justify-between border-t border-border pt-4 font-mono text-lg">
          <span>Total</span>
          <strong>{formatarBRL(pedido.total_centavos)}</strong>
        </p>
      </Card>

      {lote && (pedido.status === "disponivel" || pedido.status === "pago" || pedido.status === "em_producao") && (
        <Card className="flex flex-col gap-1">
          <h2 className="text-2xl">Retirada</h2>
          <p className="text-muted">
            {lote.local_retirada ?? "Local a confirmar"}
            {lote.data_retirada ? ` · ${formatarDataHora(lote.data_retirada)}` : ""}
          </p>
        </Card>
      )}

      {pedido.status === "aguardando_pagamento" && (
        <Card>
          <p className="text-muted">Aguardando a confirmação do pagamento.</p>
        </Card>
      )}
    </div>
  );
}
