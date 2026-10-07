import { BotaoAcao } from "@/components/admin/botao-acao";
import { Badge, Card } from "@/components/ui/display";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/field";
import { STATUS_PEDIDO } from "@/lib/pedidos/status";
import { marcarRetirado } from "@/server/actions/pedidos-admin";
import { contextoAdmin } from "@/server/admin/contexto";

export const metadata = { title: "Retirada" };

export default async function RetiradaPage({ searchParams }: PageProps<"/admin/retirada">) {
  const { supabase } = await contextoAdmin("retirada");
  const sp = await searchParams;
  const { data: lotes } = await supabase.from("lotes").select("id, nome").order("abre_em", { ascending: false });
  const loteId = (typeof sp.lote === "string" && sp.lote) || lotes?.[0]?.id;

  // Só nome e itens: a lista de retirada nunca mostra CPF.
  const { data } = loteId
    ? await supabase
        .from("pedidos")
        .select("id, codigo, status, clientes(nome), itens_pedido(id, quantidade, produtos(nome), variacoes(tamanho, cor))")
        .eq("lote_id", loteId)
        .in("status", ["pago", "em_producao", "disponivel"])
    : { data: [] };

  const pedidos = [...(data ?? [])].sort((a, b) => (a.clientes?.nome ?? "").localeCompare(b.clientes?.nome ?? "", "pt-BR"));

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-5xl uppercase">Retirada</h1>

      <form method="get" className="grid items-end gap-4 sm:grid-cols-[1fr_auto]">
        <Select id="lote" name="lote" label="Lote" defaultValue={loteId}>
          {(lotes ?? []).map((l) => (
            <option key={l.id} value={l.id}>{l.nome}</option>
          ))}
        </Select>
        <Button type="submit">Trocar</Button>
      </form>

      {typeof sp.erro === "string" && (
        <p role="alert" className="rounded-lg border border-danger px-4 py-3 text-danger">Não foi possível marcar este pedido como retirado.</p>
      )}

      <p className="font-mono text-sm text-muted">{pedidos.length} aguardando retirada</p>

      <ul className="flex flex-col gap-3">
        {pedidos.map((p) => (
          <li key={p.id}>
            <Card className="flex flex-col gap-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-display text-2xl font-bold">{p.clientes?.nome}</p>
                <div className="flex items-center gap-2">
                  <Badge tom={STATUS_PEDIDO[p.status].tom}>{STATUS_PEDIDO[p.status].rotulo}</Badge>
                  <span className="font-mono text-sm">{p.codigo}</span>
                </div>
              </div>
              <ul className="text-muted">
                {p.itens_pedido.map((i) => (
                  <li key={i.id}>
                    {i.quantidade}× {i.produtos?.nome}
                    {i.variacoes && ` (${[i.variacoes.tamanho, i.variacoes.cor].filter(Boolean).join(" / ")})`}
                  </li>
                ))}
              </ul>
              <BotaoAcao action={marcarRetirado.bind(null, p.id, "retirada")} variante="primario" tamanho="lg" className="w-full">
                Retirado
              </BotaoAcao>
            </Card>
          </li>
        ))}
        {pedidos.length === 0 && <li className="text-muted">Ninguém aguardando retirada neste lote.</li>}
      </ul>
    </div>
  );
}
