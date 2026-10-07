import Link from "next/link";
import { CircuitTrace } from "@/components/brand/circuit-trace";
import { ContagemRegressiva } from "@/components/eventos/contagem-regressiva";
import { ProdutoCard } from "@/components/loja/produto-card";
import { ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/display";
import { formatarDataHora } from "@/lib/utils/datas";
import { getProximoEvento } from "@/server/queries/eventos";
import { getLoteAberto, getProdutosDoLote } from "@/server/queries/loja";

const atalhos = [
  { href: "/eventos", titulo: "Eventos", texto: "Palestras, workshops e hackathons do curso." },
  { href: "/sobre", titulo: "Sobre", texto: "Quem faz o D.A. acontecer, hoje e antes." },
  { href: "/hub", titulo: "Hub", texto: "Links úteis para a vida na faculdade." },
];

export default async function HomePage() {
  const [evento, lote] = await Promise.all([getProximoEvento(), getLoteAberto()]);
  const produtos = lote ? await getProdutosDoLote(lote.id) : [];

  return (
    <div className="flex flex-col gap-16">
      <section className="flex flex-col gap-5 pt-6 sm:pt-12">
        <CircuitTrace />
        <h1 className="max-w-3xl text-5xl uppercase sm:text-7xl">
          O hub de quem vive <span className="text-accent">Sistemas de Informação</span>
        </h1>
        <p className="max-w-xl text-lg text-muted">
          Loja do curso, agenda de eventos e tudo do D.A. da FAFRAM num só lugar.
        </p>
        <div className="flex flex-wrap gap-3">
          <ButtonLink href="/loja" tamanho="lg">
            Ver a loja
          </ButtonLink>
          <ButtonLink href="/eventos" variante="secundario" tamanho="lg">
            Próximos eventos
          </ButtonLink>
        </div>
      </section>

      {evento && (
        <section aria-labelledby="proximo-evento">
          <Card className="flex flex-col gap-4 border-accent">
            <p className="font-mono text-xs text-accent uppercase">Próximo evento</p>
            <h2 id="proximo-evento" className="text-3xl sm:text-4xl">
              <Link href={`/eventos/${evento.slug}`} className="hover:text-accent">
                {evento.titulo}
              </Link>
            </h2>
            <p className="font-mono text-sm text-muted">
              {formatarDataHora(evento.inicio)}
              {evento.local ? ` · ${evento.local}` : ""}
            </p>
            <ContagemRegressiva alvo={evento.inicio} />
          </Card>
        </section>
      )}

      {produtos.length > 0 && (
        <section aria-labelledby="pre-venda" className="flex flex-col gap-4">
          <div className="flex flex-wrap items-end justify-between gap-2">
            <h2 id="pre-venda" className="text-3xl sm:text-4xl">
              Pré-venda aberta
            </h2>
            <Link href="/loja" className="text-accent underline underline-offset-2">
              Ver tudo
            </Link>
          </div>
          <ul className="grid grid-cols-2 gap-4 lg:grid-cols-3">
            {produtos.map((p) => (
              <li key={p.id}>
                <ProdutoCard
                  slug={p.slug}
                  nome={p.nome}
                  precoCentavos={p.preco_centavos}
                  foto={p.fotos[0]}
                  categoria={p.categoria}
                />
              </li>
            ))}
          </ul>
        </section>
      )}

      <section aria-label="Atalhos" className="grid gap-4 sm:grid-cols-3">
        {atalhos.map((a) => (
          <Link
            key={a.href}
            href={a.href}
            className="flex flex-col gap-2 rounded-xl border border-border bg-surface p-5 transition-colors hover:border-accent"
          >
            <h2 className="text-2xl">{a.titulo}</h2>
            <p className="text-muted">{a.texto}</p>
          </Link>
        ))}
      </section>
    </div>
  );
}
