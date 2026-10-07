import Link from "next/link";
import { Badge, Card } from "@/components/ui/display";
import { ButtonLink } from "@/components/ui/button";
import { formatarDataHora } from "@/lib/utils/datas";
import { contextoAdmin } from "@/server/admin/contexto";

export const metadata = { title: "Lotes" };

export default async function LotesPage({ searchParams }: PageProps<"/admin/lotes">) {
  const { supabase } = await contextoAdmin("lotes");
  const { erro } = await searchParams;
  const { data: lotes } = await supabase.from("lotes").select("*").order("abre_em", { ascending: false });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-5xl">Lotes</h1>
        <ButtonLink href="/admin/lotes/novo">Novo lote</ButtonLink>
      </div>
      {erro && <p role="alert" className="rounded-lg border border-danger px-4 py-3 text-danger">Este lote tem pedidos ou produtos e não pode ser excluído. Feche-o em vez de excluir.</p>}
      <ul className="flex flex-col gap-3">
        {(lotes ?? []).map((l) => (
          <li key={l.id}>
            <Card className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <Link href={`/admin/lotes/${l.id}`} className="font-display text-2xl font-bold hover:text-accent">{l.nome}</Link>
                <p className="font-mono text-sm text-muted">{formatarDataHora(l.abre_em)} → {formatarDataHora(l.fecha_em)}</p>
              </div>
              <Badge tom={l.status === "aberto" ? "sucesso" : "neutro"}>{l.status}</Badge>
            </Card>
          </li>
        ))}
        {!lotes?.length && <li className="text-muted">Nenhum lote ainda.</li>}
      </ul>
    </div>
  );
}
