import { notFound } from "next/navigation";
import { BotaoAcao } from "@/components/admin/botao-acao";
import { Badge, Card } from "@/components/ui/display";
import { acoesDisponiveis } from "@/lib/pedidos/transicoes";
import { STATUS_PEDIDO } from "@/lib/pedidos/status";
import { formatarDataHora } from "@/lib/utils/datas";
import { formatarBRL } from "@/lib/utils/money";
import { formatarCpf } from "@/lib/validators/cpf";
import { cancelarPedido, marcarDisponivel, marcarRetirado } from "@/server/actions/pedidos-admin";
import { contextoAdmin } from "@/server/admin/contexto";
import { ROTULO_PAGAMENTO } from "@/lib/utils/rotulos";

export const metadata = { title: "Pedido" };

const ERROS: Record<string, string> = {
  transicao: "Essa ação não é permitida para o status atual do pedido.",
  asaas: "Não foi possível cancelar a cobrança no Asaas. O pedido não foi cancelado; tente novamente.",
};

export default async function PedidoAdminPage({ params, searchParams }: PageProps<"/admin/pedidos/[id]">) {
  const { id } = await params;
  const { erro } = await searchParams;
  const { supabase } = await contextoAdmin("pedidos");

  const { data: pedido } = await supabase
    .from("pedidos")
    .select(
      `id, codigo, status, forma_pagamento, total_centavos, invoice_url, created_at, pago_em,
       clientes(nome, cpf, email, whatsapp, turma),
       lotes(nome),
       itens_pedido(id, quantidade, preco_unitario, produtos(nome), variacoes(tamanho, cor))`,
    )
    .eq("id", id)
    .maybeSingle();
  if (!pedido) notFound();

  const status = STATUS_PEDIDO[pedido.status];
  const acoes = acoesDisponiveis(pedido.status);
  const c = pedido.clientes;

  return (
    <div className="flex max-w-3xl flex-col gap-6">
      <header className="flex flex-col gap-2">
        <h1 className="font-mono text-4xl">{pedido.codigo}</h1>
        <div className="flex flex-wrap items-center gap-3">
          <Badge tom={status.tom}>{status.rotulo}</Badge>
          <span className="font-mono text-sm text-muted">{pedido.lotes?.nome} · criado em {formatarDataHora(pedido.created_at)}</span>
        </div>
      </header>

      {typeof erro === "string" && ERROS[erro] && (
        <p role="alert" className="rounded-lg border border-danger px-4 py-3 text-danger">{ERROS[erro]}</p>
      )}

      <Card className="flex flex-col gap-1">
        <h2 className="text-2xl">Cliente</h2>
        <p>{c?.nome}</p>
        <p className="text-muted">CPF {c ? formatarCpf(c.cpf) : ""} · {c?.email}</p>
        <p className="text-muted">WhatsApp {c?.whatsapp}{c?.turma ? ` · ${c.turma}` : ""}</p>
      </Card>

      <Card className="flex flex-col gap-3">
        <h2 className="text-2xl">Itens</h2>
        <ul className="flex flex-col gap-2">
          {pedido.itens_pedido.map((i) => (
            <li key={i.id} className="flex justify-between gap-4">
              <span>
                {i.quantidade}× {i.produtos?.nome}
                {i.variacoes && <span className="text-muted"> ({[i.variacoes.tamanho, i.variacoes.cor].filter(Boolean).join(" / ")})</span>}
              </span>
              <span className="font-mono">{formatarBRL(i.preco_unitario * i.quantidade)}</span>
            </li>
          ))}
        </ul>
        <p className="flex justify-between border-t border-border pt-3 font-mono text-lg">
          <span>Total</span><strong>{formatarBRL(pedido.total_centavos)}</strong>
        </p>
        <p className="text-sm text-muted">
          Pagamento: {ROTULO_PAGAMENTO[pedido.forma_pagamento] ?? pedido.forma_pagamento}{pedido.pago_em ? ` · Pago em ${formatarDataHora(pedido.pago_em)}` : ""}
          {pedido.invoice_url && <> · <a href={pedido.invoice_url} target="_blank" rel="noopener noreferrer" className="text-accent underline">Fatura no Asaas</a></>}
        </p>
      </Card>

      {acoes.length > 0 && (
        <div className="flex flex-wrap gap-3">
          {acoes.includes("disponivel") && (
            <BotaoAcao action={marcarDisponivel.bind(null, id, "pedido")} variante="primario">Marcar disponível</BotaoAcao>
          )}
          {acoes.includes("retirado") && (
            <BotaoAcao action={marcarRetirado.bind(null, id, "pedido")}>Marcar retirado</BotaoAcao>
          )}
          {acoes.includes("cancelar") && (
            <BotaoAcao action={cancelarPedido.bind(null, id)} confirmar="Cancelar este pedido? A cobrança no Asaas também será cancelada." className="text-danger">
              Cancelar pedido
            </BotaoAcao>
          )}
        </div>
      )}
    </div>
  );
}
