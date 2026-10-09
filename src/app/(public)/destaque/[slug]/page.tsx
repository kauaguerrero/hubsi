import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { FormInteresse } from "@/components/destaques/form-interesse";
import { ContagemRegressiva } from "@/components/eventos/contagem-regressiva";
import { Badge, Card } from "@/components/ui/display";
import { ButtonLink } from "@/components/ui/button";
import { ROTULO_TIPO, ctaDoDestaque, destaqueAtivo } from "@/lib/destaques/regras";
import { formatarDataHora } from "@/lib/utils/datas";
import { getDestaquePorSlug } from "@/server/queries/destaques";

export async function generateMetadata({ params }: PageProps<"/destaque/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const d = await getDestaquePorSlug(slug);
  if (!d) return { title: "Destaque não encontrado" };
  return { title: d.titulo, description: d.descricao?.slice(0, 160) };
}

export default async function DestaquePage({ params }: PageProps<"/destaque/[slug]">) {
  const { slug } = await params;
  const d = await getDestaquePorSlug(slug);
  if (!d) notFound();

  const ativo = destaqueAtivo(d);

  return (
    <article className="flex max-w-3xl flex-col gap-8">
      <header className="flex flex-col gap-3">
        <div className="flex flex-wrap gap-2">
          <Badge tom="acento">{ROTULO_TIPO[d.tipo]}</Badge>
          {!ativo && <Badge tom="perigo">Encerrado</Badge>}
        </div>
        <h1 className="text-5xl sm:text-6xl">{d.titulo}</h1>
        {d.data_evento && <p className="font-mono text-muted">{formatarDataHora(d.data_evento)}</p>}
      </header>

      {(d.banner_url ?? d.capa_url) && (
        <div className="relative aspect-video overflow-hidden rounded-2xl border border-border">
          <Image src={(d.banner_url ?? d.capa_url) as string} alt={`Imagem de ${d.titulo}`} fill sizes="(min-width: 768px) 768px, 100vw" className="object-cover" priority />
        </div>
      )}

      {d.descricao && <p className="text-lg whitespace-pre-line">{d.descricao}</p>}

      {ativo && d.data_evento && new Date(d.data_evento) > new Date() && <ContagemRegressiva alvo={d.data_evento} />}

      {!ativo && (
        <Card>
          <p>Este anúncio já foi encerrado. Fique de olho na página inicial para as próximas novidades.</p>
        </Card>
      )}

      {ativo && d.tipo === "formulario" &&
        (d.itens.length > 0 ? (
          <FormInteresse destaqueId={d.id} itens={d.itens} />
        ) : (
          <Card>Em breve você poderá registrar seu interesse por aqui.</Card>
        ))}

      {ativo && d.tipo === "link" && d.link_externo && (
        <div>
          <ButtonLink href={d.link_externo} tamanho="lg" target="_blank" rel="noopener noreferrer">
            {ctaDoDestaque(d)}
          </ButtonLink>
        </div>
      )}
    </article>
  );
}
