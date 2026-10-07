import Link from "next/link";
import { Badge } from "@/components/ui/display";
import { cn } from "@/lib/utils/cn";
import { formatarDataHora } from "@/lib/utils/datas";
import type { Evento } from "@/server/queries/eventos";

const rotuloTipo: Record<Evento["tipo"], string> = {
  palestra: "Palestra",
  workshop: "Workshop",
  hackathon: "Hackathon",
  social: "Social",
  semana_academica: "Semana acadêmica",
  outro: "Evento",
};

/** Trilha vertical de circuito: cada evento é um nó; o destaque usa o degradê da marca. */
export function TrilhaEventos({
  eventos,
  destaqueId,
}: {
  eventos: Evento[];
  destaqueId?: string;
}) {
  return (
    <ol className="border-accent/25 relative flex flex-col gap-6 border-l-2 pl-6">
      {eventos.map((e) => {
        const destaque = e.id === destaqueId;
        return (
          <li key={e.id} className="relative">
            <span
              aria-hidden="true"
              className={cn(
                "absolute top-5 -left-[calc(1.5rem+7px)] size-3 rounded-full border-2",
                destaque
                  ? "bg-brand ring-accent/20 border-transparent ring-4"
                  : "border-accent/50 bg-surface",
              )}
            />
            <Link
              href={`/eventos/${e.slug}`}
              className={cn(
                "bg-surface shadow-card hover:shadow-pop flex flex-col gap-2 rounded-2xl border p-5 transition-all duration-300 hover:-translate-y-0.5",
                destaque ? "border-accent/50" : "border-border",
              )}
            >
              <div className="flex flex-wrap items-center gap-2">
                <Badge tom={destaque ? "acento" : "neutro"}>
                  {rotuloTipo[e.tipo]}
                </Badge>
                {e.status === "cancelado" && (
                  <Badge tom="perigo">Cancelado</Badge>
                )}
                {destaque && <Badge tom="sucesso">Próximo</Badge>}
              </div>
              <h3 className="text-2xl">{e.titulo}</h3>
              <p className="text-muted font-mono text-sm">
                {formatarDataHora(e.inicio)}
                {e.local ? ` · ${e.local}` : ""}
              </p>
            </Link>
          </li>
        );
      })}
    </ol>
  );
}

export { rotuloTipo };
