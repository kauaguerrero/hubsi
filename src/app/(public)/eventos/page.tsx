import type { Metadata } from "next";
import { TrilhaEventos } from "@/components/eventos/trilha-eventos";
import { EmptyState } from "@/components/ui/display";
import { eventoJaAconteceu, listarEventos } from "@/server/queries/eventos";

export const metadata: Metadata = {
  title: "Eventos",
  description: "Agenda de palestras, workshops, hackathons e eventos sociais do curso de Sistemas de Informação.",
};

export default async function EventosPage() {
  const eventos = await listarEventos();
  const agora = new Date();
  const proximos = eventos.filter((e) => !eventoJaAconteceu(e, agora));
  const realizados = eventos.filter((e) => eventoJaAconteceu(e, agora)).reverse();
  const destaque = proximos.find((e) => e.status === "publicado");

  return (
    <div className="flex flex-col gap-12">
      <h1 className="text-5xl sm:text-6xl">Eventos</h1>

      <section aria-labelledby="proximos" className="flex flex-col gap-4">
        <h2 id="proximos" className="text-3xl">
          Próximos
        </h2>
        {proximos.length ? (
          <TrilhaEventos eventos={proximos} destaqueId={destaque?.id} />
        ) : (
          <EmptyState titulo="Nada agendado por enquanto" descricao="Volte em breve: novidades vêm aí." />
        )}
      </section>

      {realizados.length > 0 && (
        <section aria-labelledby="realizados" className="flex flex-col gap-4">
          <h2 id="realizados" className="text-3xl">
            Realizados
          </h2>
          <TrilhaEventos eventos={realizados} />
        </section>
      )}
    </div>
  );
}
