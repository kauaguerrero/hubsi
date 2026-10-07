import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { rotuloTipo } from "@/components/eventos/trilha-eventos";
import { Badge, Card } from "@/components/ui/display";
import { ButtonLink } from "@/components/ui/button";
import { urlGoogleAgenda } from "@/lib/utils/calendario";
import { formatarDataHora } from "@/lib/utils/datas";
import { getEventoPorSlug, listarSlugsEventos } from "@/server/queries/eventos";

export async function generateStaticParams() {
  try {
    return (await listarSlugsEventos()).map((slug) => ({ slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: PageProps<"/eventos/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const evento = await getEventoPorSlug(slug);
  if (!evento) return { title: "Evento não encontrado" };
  return {
    title: evento.titulo,
    description: evento.descricao?.slice(0, 160) ?? `${rotuloTipo[evento.tipo]} do Hub S.I.`,
  };
}

export default async function EventoPage({ params }: PageProps<"/eventos/[slug]">) {
  const { slug } = await params;
  const evento = await getEventoPorSlug(slug);
  if (!evento) notFound();

  const cancelado = evento.status === "cancelado";

  return (
    <article className="flex flex-col gap-8">
      <header className="flex flex-col gap-3">
        <div className="flex flex-wrap gap-2">
          <Badge tom="acento">{rotuloTipo[evento.tipo]}</Badge>
          {cancelado && <Badge tom="perigo">Cancelado</Badge>}
        </div>
        <h1 className="text-5xl sm:text-6xl">{evento.titulo}</h1>
        <p className="font-mono text-muted">
          {formatarDataHora(evento.inicio)}
          {evento.local ? ` · ${evento.local}` : ""}
        </p>
      </header>

      {evento.capa_url && (
        <div className="relative aspect-video overflow-hidden rounded-xl border border-border">
          <Image src={evento.capa_url} alt={`Capa do evento ${evento.titulo}`} fill sizes="100vw" className="object-cover" priority />
        </div>
      )}

      {evento.descricao && <p className="max-w-2xl text-lg whitespace-pre-line text-muted">{evento.descricao}</p>}

      {!cancelado && (
        <div className="flex flex-wrap gap-3">
          {evento.link_inscricao && (
            <ButtonLink href={evento.link_inscricao} target="_blank" rel="noopener noreferrer" tamanho="lg">
              Inscrever-se
            </ButtonLink>
          )}
          <ButtonLink href={urlGoogleAgenda(evento)} target="_blank" rel="noopener noreferrer" variante="secundario" tamanho="lg">
            Google Agenda
          </ButtonLink>
          <ButtonLink href={`/eventos/${evento.slug}/ics`} prefetch={false} variante="secundario" tamanho="lg">
            Baixar .ics
          </ButtonLink>
        </div>
      )}

      {evento.palestrantes.length > 0 && (
        <section aria-labelledby="palestrantes" className="flex flex-col gap-4">
          <h2 id="palestrantes" className="text-3xl">
            Palestrantes
          </h2>
          <ul className="grid gap-4 sm:grid-cols-2">
            {evento.palestrantes.map((p) => (
              <li key={p.id}>
                <Card className="flex gap-4">
                  {p.foto_url && (
                    <Image src={p.foto_url} alt={p.nome} width={64} height={64} className="size-16 rounded-full object-cover" />
                  )}
                  <div>
                    <h3 className="text-xl">{p.nome}</h3>
                    {p.bio && <p className="text-sm text-muted">{p.bio}</p>}
                  </div>
                </Card>
              </li>
            ))}
          </ul>
        </section>
      )}
    </article>
  );
}
