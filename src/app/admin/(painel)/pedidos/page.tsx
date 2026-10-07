import Link from "next/link";
import { Badge, Card } from "@/components/ui/display";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/field";
import { STATUS_PEDIDO } from "@/lib/pedidos/status";
import { formatarDataHora } from "@/lib/utils/datas";
import { formatarBRL } from "@/lib/utils/money";
import { contextoAdmin } from "@/server/admin/contexto";
import type { Enums } from "@/types/helpers";

export const metadata = { title: "Pedidos" };

const valorUnico = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? "";

export default async function PedidosPage({ searchParams }: PageProps<"/admin/pedidos">) {
  const { supabase } = await contextoAdmin("pedidos");
  const sp = await searchParams;
  const lote = valorUnico(sp.lote);
  const status = valorUnico(sp.status);

  const { data: lotes } = await supabase.from("lotes").select("id, nome").order("abre_em", { ascending: false });

  let consulta = supabase
    .from("pedidos")
    .select("id, codigo, status, total_centavos, created_at, clientes(nome), lotes(nome)")
    .order("created_at", { ascending: false })
    .limit(200);
  if (lote) consulta = consulta.eq("lote_id", lote);
  if (status in STATUS_PEDIDO) consulta = consulta.eq("status", status as Enums<"status_pedido">);
  const { data: pedidos } = await consulta;

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-5xl uppercase">Pedidos</h1>

      <form method="get" className="grid items-end gap-4 sm:grid-cols-[1fr_1fr_auto]">
        <Select id="lote" name="lote" label="Lote" defaultValue={lote}>
          <option value="">Todos</option>
          {(lotes ?? []).map((l) => (
            <option key={l.id} value={l.id}>{l.nome}</option>
          ))}
        </Select>
        <Select id="status" name="status" label="Status" defaultValue={status}>
          <option value="">Todos</option>
          {Object.entries(STATUS_PEDIDO).map(([k, v]) => (
            <option key={k} value={k}>{v.rotulo}</option>
          ))}
        </Select>
        <Button type="submit">Filtrar</Button>
      </form>

      <ul className="flex flex-col gap-3">
        {(pedidos ?? []).map((p) => (
          <li key={p.id}>
            <Card className="flex flex-wrap items-center justify-between gap-3 py-3">
              <div>
                <Link href={`/admin/pedidos/${p.id}`} className="font-mono text-xl hover:text-accent">{p.codigo}</Link>
                <p className="text-sm text-muted">{p.clientes?.nome} · {p.lotes?.nome} · {formatarDataHora(p.created_at)}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-mono">{formatarBRL(p.total_centavos)}</span>
                <Badge tom={STATUS_PEDIDO[p.status].tom}>{STATUS_PEDIDO[p.status].rotulo}</Badge>
              </div>
            </Card>
          </li>
        ))}
        {!pedidos?.length && <li className="text-muted">Nenhum pedido encontrado.</li>}
      </ul>
    </div>
  );
}
