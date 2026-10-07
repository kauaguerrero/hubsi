import type { Metadata } from "next";
import { Organograma } from "@/components/sobre/organograma";
import { Badge } from "@/components/ui/display";
import { listarGestoes } from "@/server/queries/gestoes";

export const metadata: Metadata = {
  title: "Sobre",
  description:
    "O que o D.A. de Sistemas de Informação da FAFRAM faz e quem faz parte da gestão.",
};

export default async function SobrePage() {
  const gestoes = await listarGestoes();
  const atual = gestoes.find((g) => g.ativa);
  const anteriores = gestoes.filter((g) => !g.ativa);

  return (
    <div className="flex flex-col gap-12">
      <header className="flex max-w-2xl flex-col gap-4">
        <h1 className="text-5xl sm:text-6xl">Sobre</h1>
        <p className="text-muted text-lg">
          O Diretório Acadêmico de Sistemas de Informação da FAFRAM representa
          os alunos do curso: organiza eventos, conecta turmas, cuida da loja de
          produtos do curso e leva as demandas dos estudantes à coordenação.
        </p>
      </header>

      {atual && (
        <section
          aria-labelledby="gestao-atual"
          className="bg-brand-soft border-accent/15 flex flex-col items-center gap-8 rounded-3xl border px-4 py-10 sm:px-10 sm:py-14"
        >
          <div className="flex flex-col items-center gap-3 text-center">
            <Badge tom="acento">Gestão atual</Badge>
            <h2 id="gestao-atual" className="text-4xl sm:text-5xl">
              <span className="text-gradient">{atual.nome}</span> {atual.ano}
            </h2>
            {atual.descricao && (
              <p className="text-muted max-w-2xl">{atual.descricao}</p>
            )}
          </div>
          <Organograma membros={atual.membros_gestao} />
        </section>
      )}

      {anteriores.length > 0 && (
        <section aria-labelledby="anteriores" className="flex flex-col gap-6">
          <h2 id="anteriores" className="text-3xl">
            Gestões anteriores
          </h2>
          {anteriores.map((g) => (
            <div
              key={g.id}
              className="border-border bg-surface shadow-card flex flex-col gap-4 rounded-3xl border p-6"
            >
              <h3 className="text-2xl">
                {g.nome}{" "}
                <span className="text-muted font-mono text-base">{g.ano}</span>
              </h3>
              {g.descricao && (
                <p className="text-muted max-w-2xl">{g.descricao}</p>
              )}
              <Organograma membros={g.membros_gestao} />
            </div>
          ))}
        </section>
      )}
    </div>
  );
}
