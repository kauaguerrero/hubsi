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

/** Trilha vertical de circuito: cada evento é um nó; o destaque usa o acento. */
export function TrilhaEventos({ eventos, destaqueId }: { eventos: Evento[]; destaqueId?: string }) {
  return (
    <ol className="relative flex flex-col gap-6 border-l-2 border-border pl-6">
      {eventos.map((e) => {
        const destaque = e.id === destaqueId;
        return (
          <li key={e.id} className="relative">
            <span
              aria-hidden="true"
              className={cn(
                "absolute top-2 -left-[calc(1.5rem+7px)] size-3 rounded-full border-2 bg-bg",
                destaque ? "border-accent bg-accent" : "border-border",
              )}
            />
            <Link
              href={`/eventos/${e.slug}`}
              className={cn(
                "flex flex-col gap-2 rounded-xl border bg-surface p-4 transition-colors hover:border-accent",
                destaque ? "border-accent" : "border-border",
              )}
            >
              <div className="flex flex-wrap items-center gap-2">
                <Badge tom={destaque ? "acento" : "neutro"}>{rotuloTipo[e.tipo]}</Badge>
                {e.status === "cancelado" && <Badge tom="perigo">Cancelado</Badge>}
                {destaque && <Badge tom="acento">Próximo</Badge>}
              </div>
              <h3 className="text-2xl">{e.titulo}</h3>
              <p className="font-mono text-sm text-muted">
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
