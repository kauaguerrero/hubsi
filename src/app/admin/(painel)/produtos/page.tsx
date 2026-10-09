import Link from "next/link";
import { Badge, Card } from "@/components/ui/display";
import { ButtonLink } from "@/components/ui/button";
import { formatarBRL } from "@/lib/utils/money";
import { contextoAdmin } from "@/server/admin/contexto";

export const metadata = { title: "Produtos" };

export default async function ProdutosPage({ searchParams }: PageProps<"/admin/produtos">) {
  const { supabase } = await contextoAdmin("produtos");
  const { erro } = await searchParams;
  const { data: produtos } = await supabase
    .from("produtos")
    .select("id, nome, slug, preco_centavos, ativo, lotes(nome)")
    .order("created_at", { ascending: false });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-5xl">Produtos</h1>
        <ButtonLink href="/admin/produtos/novo">Novo produto</ButtonLink>
      </div>
      {erro && <p role="alert" className="rounded-lg border border-danger px-4 py-3 text-danger">Este produto já foi vendido e não pode ser excluído. Desative-o.</p>}
      <ul className="flex flex-col gap-3">
        {(produtos ?? []).map((p) => (
          <li key={p.id}>
            <Card className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <Link href={`/admin/produtos/${p.id}`} className="font-display text-2xl font-bold hover:text-accent">{p.nome}</Link>
                <p className="font-mono text-sm text-muted">{formatarBRL(p.preco_centavos)} · {p.lotes?.nome}</p>
              </div>
              <Badge tom={p.ativo ? "sucesso" : "neutro"}>{p.ativo ? "Ativo" : "Inativo"}</Badge>
            </Card>
          </li>
        ))}
        {!produtos?.length && <li className="text-muted">Nenhum produto ainda.</li>}
      </ul>
    </div>
  );
}
