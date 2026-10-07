import type { Metadata } from "next";
import { EmptyState } from "@/components/ui/display";
import { agruparPorCategoria, listarLinksHub } from "@/server/queries/hub";

export const metadata: Metadata = {
  title: "Hub",
  description: "Links úteis do curso de Sistemas de Informação: redes, comunidade, acadêmico e projetos.",
};

export default async function HubPage() {
  const grupos = agruparPorCategoria(await listarLinksHub());

  return (
    <div className="flex flex-col gap-10">
      <h1 className="text-5xl sm:text-6xl">Hub</h1>
      {grupos.length === 0 && <EmptyState titulo="Nenhum link por aqui ainda" />}
      {grupos.map(([categoria, links]) => (
        <section key={categoria} aria-labelledby={`cat-${categoria}`} className="flex flex-col gap-3">
          <h2 id={`cat-${categoria}`} className="text-2xl text-accent capitalize">
            {categoria}
          </h2>
          <ul className="grid gap-3 sm:grid-cols-2">
            {links.map((l) => (
              <li key={l.id}>
                <a
                  href={l.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex min-h-14 flex-col justify-center gap-0.5 rounded-xl border border-border bg-surface px-4 py-3 transition-colors hover:border-accent"
                >
                  <span className="font-display text-xl font-bold">{l.titulo}</span>
                  {l.descricao && <span className="text-sm text-muted">{l.descricao}</span>}
                </a>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
