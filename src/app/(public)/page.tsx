import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { AuroraBackground } from "@/components/brand/aurora-background";
import { CircuitTrace } from "@/components/brand/circuit-trace";
import { ContagemRegressiva } from "@/components/eventos/contagem-regressiva";
import { ProdutoCard } from "@/components/loja/produto-card";
import { ButtonLink } from "@/components/ui/button";
import { ROTULO_TIPO, ctaDoDestaque } from "@/lib/destaques/regras";
import { getDestaqueAtivo } from "@/server/queries/destaques";
import { formatarDataHora } from "@/lib/utils/datas";
import { getProximoEvento } from "@/server/queries/eventos";
import { getLoteAberto, getProdutosDoLote } from "@/server/queries/loja";

const icone = (d: string): ReactNode => (
  <svg
    width="26"
    height="26"
    viewBox="0 0 24 24"
    fill="none"
    aria-hidden="true"
  >
    <path
      d={d}
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const atalhos = [
  {
    href: "/eventos",
    titulo: "Eventos",
    texto: "Palestras, workshops e hackathons do curso.",
    icone: icone(
      "M8 2v4M16 2v4M3 9h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z",
    ),
  },
  {
    href: "/sobre",
    titulo: "Sobre",
    texto: "Quem faz o D.A. acontecer, hoje e antes.",
    icone: icone(
      "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM22 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8",
    ),
  },
  {
    href: "/hub",
    titulo: "Hub",
    texto: "Links úteis para a vida na faculdade.",
    icone: icone(
      "M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7",
    ),
  },
];

export default async function HomePage() {
  const [evento, lote, destaque] = await Promise.all([
    getProximoEvento(),
    getLoteAberto(),
    getDestaqueAtivo(),
  ]);
  const produtos = lote ? await getProdutosDoLote(lote.id) : [];

  return (
    <div className="flex flex-col gap-20">
      {/* Faixa de largura total: anula o padding vertical do <main> e o limite de largura. */}
      <AuroraBackground className="mx-[calc(50%-50vw)] -mt-8">
        <section className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-16 sm:py-28">
          <CircuitTrace />
          {lote && (
            <Link
              href="/loja"
              className="border-accent/25 bg-surface/80 text-fg hover:border-accent inline-flex w-fit items-center gap-2 rounded-full border py-1.5 pr-4 pl-2 text-sm font-medium shadow-sm backdrop-blur transition-colors"
            >
              <span className="bg-brand text-on-accent rounded-full px-2.5 py-0.5 font-mono text-xs">
                Novo
              </span>
              Pré-venda aberta: {lote.nome}
              <span aria-hidden="true">→</span>
            </Link>
          )}
          <h1 className="max-w-4xl text-5xl leading-[0.98] font-extrabold sm:text-7xl lg:text-8xl">
            O hub de quem vive{" "}
            <span className="text-gradient">Sistemas de Informação</span>
          </h1>
          <p className="text-muted max-w-xl text-lg sm:text-xl">
            Loja do curso, agenda de eventos e tudo do D.A. da FAFRAM num só
            lugar.
          </p>
          <div className="flex flex-wrap gap-3 pt-2">
            <ButtonLink href="/loja" tamanho="lg">
              Ver a loja
            </ButtonLink>
            <ButtonLink href="/eventos" variante="secundario" tamanho="lg">
              Próximos eventos
            </ButtonLink>
          </div>
        </section>
      </AuroraBackground>

      {destaque && (
        <section aria-labelledby="destaque" className="-mt-8">
          <div className="bg-brand text-on-accent shadow-pop relative overflow-hidden rounded-3xl">
            <div className="flex flex-col gap-6 p-6 sm:p-10 md:flex-row md:items-center md:justify-between">
              <div className="flex max-w-2xl flex-col gap-4">
                <p className="bg-surface/90 text-accent w-fit rounded-full px-3 py-1 font-mono text-xs font-medium tracking-wider uppercase">
                  Em destaque · {ROTULO_TIPO[destaque.tipo]}
                </p>
                <h2 id="destaque" className="text-4xl sm:text-6xl">
                  {destaque.titulo}
                </h2>
                {destaque.descricao && (
                  <p className="line-clamp-3 text-lg opacity-95">
                    {destaque.descricao}
                  </p>
                )}
                {destaque.data_evento && (
                  <p className="font-mono text-sm opacity-90">
                    {formatarDataHora(destaque.data_evento)}
                  </p>
                )}
                <div>
                  {destaque.tipo === "link" && destaque.link_externo ? (
                    <a
                      href={destaque.link_externo}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-surface text-accent inline-flex min-h-12 items-center justify-center rounded-full px-7 text-lg font-semibold shadow-card transition-transform hover:-translate-y-0.5"
                    >
                      {ctaDoDestaque(destaque)} →
                    </a>
                  ) : (
                    <Link
                      href={`/destaque/${destaque.slug}`}
                      className="bg-surface text-accent inline-flex min-h-12 items-center justify-center rounded-full px-7 text-lg font-semibold shadow-card transition-transform hover:-translate-y-0.5"
                    >
                      {ctaDoDestaque(destaque)} →
                    </Link>
                  )}
                </div>
              </div>
              {destaque.capa_url && (
                <div className="relative aspect-video w-full overflow-hidden rounded-2xl md:w-72 md:shrink-0">
                  <Image
                    src={destaque.capa_url}
                    alt=""
                    fill
                    sizes="(min-width: 768px) 288px, 100vw"
                    className="object-cover"
                  />
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {evento && (
        <section aria-labelledby="proximo-evento" className="-mt-8">
          <div className="bg-brand-soft border-accent/20 shadow-card relative overflow-hidden rounded-3xl border p-6 sm:p-10">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex flex-col gap-3">
                <p className="bg-surface/80 text-accent w-fit rounded-full px-3 py-1 font-mono text-xs font-medium tracking-wider uppercase">
                  Próximo evento
                </p>
                <h2 id="proximo-evento" className="text-3xl sm:text-5xl">
                  <Link
                    href={`/eventos/${evento.slug}`}
                    className="hover:text-accent transition-colors"
                  >
                    {evento.titulo}
                  </Link>
                </h2>
                <p className="text-muted font-mono text-sm">
                  {formatarDataHora(evento.inicio)}
                  {evento.local ? ` · ${evento.local}` : ""}
                </p>
              </div>
              <ContagemRegressiva alvo={evento.inicio} />
            </div>
          </div>
        </section>
      )}

      {produtos.length > 0 && (
        <section aria-labelledby="pre-venda" className="flex flex-col gap-6">
          <div className="flex flex-wrap items-end justify-between gap-2">
            <h2 id="pre-venda" className="text-4xl sm:text-5xl">
              Pré-venda <span className="text-gradient">aberta</span>
            </h2>
            <Link
              href="/loja"
              className="text-accent font-medium underline-offset-4 hover:underline"
            >
              Ver tudo →
            </Link>
          </div>
          <ul className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-3">
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

      <section
        aria-label="Atalhos"
        className="grid gap-4 sm:grid-cols-3 sm:gap-6"
      >
        {atalhos.map((a) => (
          <Link
            key={a.href}
            href={a.href}
            className="group border-border bg-surface shadow-card hover:border-accent/40 hover:shadow-pop flex flex-col gap-3 rounded-2xl border p-6 transition-all duration-300 hover:-translate-y-1"
          >
            <span className="bg-brand text-on-accent flex size-12 items-center justify-center rounded-xl shadow-sm">
              {a.icone}
            </span>
            <h2 className="group-hover:text-accent text-2xl transition-colors">
              {a.titulo}
            </h2>
            <p className="text-muted">{a.texto}</p>
          </Link>
        ))}
      </section>
    </div>
  );
}
