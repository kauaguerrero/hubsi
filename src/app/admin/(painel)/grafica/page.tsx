import { ButtonLink, Button } from "@/components/ui/button";
import { Select } from "@/components/ui/field";
import { contextoAdmin } from "@/server/admin/contexto";
import { buscarResumoGrafica } from "@/server/queries/grafica";

export const metadata = { title: "Gráfica" };

export default async function GraficaPage({ searchParams }: PageProps<"/admin/grafica">) {
  const { supabase } = await contextoAdmin("grafica");
  const sp = await searchParams;
  const { data: lotes } = await supabase.from("lotes").select("id, nome").order("abre_em", { ascending: false });
  const loteId = (typeof sp.lote === "string" && sp.lote) || lotes?.[0]?.id;
  const linhas = loteId ? await buscarResumoGrafica(supabase, loteId) : [];
  const total = linhas.reduce((s, l) => s + l.quantidade, 0);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-5xl uppercase">Resumo da gráfica</h1>
      <form method="get" className="grid items-end gap-4 sm:grid-cols-[1fr_auto]">
        <Select id="lote" name="lote" label="Lote" defaultValue={loteId}>
          {(lotes ?? []).map((l) => (
            <option key={l.id} value={l.id}>{l.nome}</option>
          ))}
        </Select>
        <Button type="submit">Trocar</Button>
      </form>

      <p className="text-muted">Considera apenas pedidos pagos. O CSV não contém dados pessoais.</p>

      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full text-left">
          <thead className="bg-surface-2 font-mono text-sm text-muted">
            <tr>
              <th scope="col" className="px-4 py-3">Produto</th>
              <th scope="col" className="px-4 py-3">Tamanho</th>
              <th scope="col" className="px-4 py-3">Cor</th>
              <th scope="col" className="px-4 py-3 text-right">Qtd.</th>
            </tr>
          </thead>
          <tbody>
            {linhas.map((l) => (
              <tr key={`${l.produto}-${l.tamanho}-${l.cor}`} className="border-t border-border">
                <td className="px-4 py-3">{l.produto}</td>
                <td className="px-4 py-3">{l.tamanho || "—"}</td>
                <td className="px-4 py-3">{l.cor || "—"}</td>
                <td className="px-4 py-3 text-right font-mono">{l.quantidade}</td>
              </tr>
            ))}
            {linhas.length === 0 && (
              <tr><td colSpan={4} className="px-4 py-6 text-center text-muted">Nenhum pedido pago neste lote.</td></tr>
            )}
          </tbody>
          {linhas.length > 0 && (
            <tfoot>
              <tr className="border-t border-border font-bold">
                <td className="px-4 py-3" colSpan={3}>Total</td>
                <td className="px-4 py-3 text-right font-mono">{total}</td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>

      {loteId && linhas.length > 0 && (
        <div>
          <ButtonLink href={`/admin/grafica/csv?lote=${loteId}`} prefetch={false} variante="secundario">Baixar CSV</ButtonLink>
        </div>
      )}
    </div>
  );
}
