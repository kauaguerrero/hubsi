import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AdicionarAoCarrinho } from "@/components/loja/adicionar-ao-carrinho";
import { Galeria } from "@/components/loja/galeria";
import { TabelaMedidas } from "@/components/loja/tabela-medidas";
import { Badge } from "@/components/ui/display";
import { formatarDataHora } from "@/lib/utils/datas";
import { formatarBRL } from "@/lib/utils/money";
import { loteAceitaPedidos } from "@/server/pedidos/calculo";
import { getProdutoPorSlug, listarSlugsProdutos } from "@/server/queries/loja";

export async function generateStaticParams() {
  try {
    return (await listarSlugsProdutos()).map((slug) => ({ slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: PageProps<"/loja/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const produto = await getProdutoPorSlug(slug);
  if (!produto) return { title: "Produto não encontrado" };
  return {
    title: produto.nome,
    description: produto.descricao?.slice(0, 160) ?? `${produto.nome} na pré-venda do Hub S.I.`,
  };
}

export default async function ProdutoPage({ params }: PageProps<"/loja/[slug]">) {
  const { slug } = await params;
  const produto = await getProdutoPorSlug(slug);
  if (!produto) notFound();

  const lote = produto.lotes;
  const aberto = loteAceitaPedidos(lote);

  return (
    <article className="grid gap-8 lg:grid-cols-2">
      <Galeria fotos={produto.fotos} nome={produto.nome} />

      <div className="flex flex-col gap-6">
        <header className="flex flex-col gap-3">
          <Badge className="w-fit capitalize">{produto.categoria}</Badge>
          <h1 className="text-5xl uppercase sm:text-6xl">{produto.nome}</h1>
          <p className="font-mono text-3xl">{formatarBRL(produto.preco_centavos)}</p>
          <p className="font-mono text-sm text-muted">
            {lote.nome} · {aberto ? `pedidos até ${formatarDataHora(lote.fecha_em)}` : "pedidos encerrados"}
          </p>
        </header>

        {produto.descricao && <p className="text-lg whitespace-pre-line text-muted">{produto.descricao}</p>}

        {produto.categoria === "vestuario" && <TabelaMedidas />}

        {aberto ? (
          <AdicionarAoCarrinho
            produtoId={produto.id}
            loteId={lote.id}
            slug={produto.slug}
            nome={produto.nome}
            precoCentavos={produto.preco_centavos}
            foto={produto.fotos[0] ?? null}
            variacoes={produto.variacoes.map((v) => ({ id: v.id, tamanho: v.tamanho, cor: v.cor }))}
          />
        ) : (
          <p role="status" className="rounded-lg border border-border px-4 py-3 text-muted">
            Este lote está fechado para novos pedidos.
          </p>
        )}

        {produto.aceita_cartao ? (
          <p className="text-sm text-muted">Pagamento por Pix ou cartão.</p>
        ) : (
          <p className="text-sm text-muted">Pagamento somente por Pix.</p>
        )}
      </div>
    </article>
  );
}
