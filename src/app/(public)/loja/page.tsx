import type { Metadata } from "next";
import { Catalogo } from "@/components/loja/catalogo";
import { Badge, EmptyState } from "@/components/ui/display";
import { formatarDataHora } from "@/lib/utils/datas";
import { getLoteAberto, getProdutosDoLote, getUltimoLote } from "@/server/queries/loja";

export const metadata: Metadata = {
  title: "Loja",
  description: "Pré-venda de produtos do curso de Sistemas de Informação: camisas, canecas e mais.",
};

export default async function LojaPage() {
  const lote = await getLoteAberto();

  if (!lote) {
    const ultimo = await getUltimoLote();
    return (
      <div className="flex flex-col gap-8">
        <h1 className="text-5xl sm:text-6xl">Loja</h1>
        <EmptyState
          titulo="Pré-venda encerrada por enquanto"
          descricao={
            ultimo
              ? `O ${ultimo.nome} está fechado para novos pedidos. Acompanhe o D.A. para saber quando abre o próximo lote.`
              : "Ainda não há um lote aberto. Volte em breve!"
          }
        />
      </div>
    );
  }

  const produtos = await getProdutosDoLote(lote.id);

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-3">
        <h1 className="text-5xl sm:text-6xl">Loja</h1>
        <div className="flex flex-wrap items-center gap-3">
          <Badge tom="acento">{lote.nome}</Badge>
          <p className="font-mono text-sm text-muted">Pedidos até {formatarDataHora(lote.fecha_em)}</p>
        </div>
      </header>
      {produtos.length ? (
        <Catalogo
          produtos={produtos.map((p) => ({
            id: p.id,
            slug: p.slug,
            nome: p.nome,
            preco_centavos: p.preco_centavos,
            categoria: p.categoria,
            foto: p.fotos[0] ?? null,
          }))}
        />
      ) : (
        <EmptyState titulo="Nenhum produto neste lote ainda" />
      )}
    </div>
  );
}
