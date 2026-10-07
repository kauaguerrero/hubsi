import type { Metadata } from "next";
import Image from "next/image";
import { Badge, Card } from "@/components/ui/display";
import { listarGestoes, type GestaoComMembros } from "@/server/queries/gestoes";

export const metadata: Metadata = {
  title: "Sobre",
  description: "O que o D.A. de Sistemas de Informação da FAFRAM faz e quem faz parte da gestão.",
};

function Membros({ gestao }: { gestao: GestaoComMembros }) {
  if (!gestao.membros_gestao.length) return null;
  return (
    <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {gestao.membros_gestao.map((m) => (
        <li key={m.id}>
          <Card className="flex items-center gap-4">
            {m.foto_url ? (
              <Image src={m.foto_url} alt={m.nome} width={56} height={56} className="size-14 rounded-full object-cover" />
            ) : (
              <span aria-hidden="true" className="flex size-14 items-center justify-center rounded-full bg-surface-2 font-display text-2xl">
                {m.nome.charAt(0)}
              </span>
            )}
            <div>
              <p className="font-display text-xl font-bold">{m.nome}</p>
              <p className="text-sm text-muted">{m.cargo}</p>
            </div>
          </Card>
        </li>
      ))}
    </ul>
  );
}

export default async function SobrePage() {
  const gestoes = await listarGestoes();
  const atual = gestoes.find((g) => g.ativa);
  const anteriores = gestoes.filter((g) => !g.ativa);

  return (
    <div className="flex flex-col gap-12">
      <header className="flex max-w-2xl flex-col gap-4">
        <h1 className="text-5xl sm:text-6xl">Sobre</h1>
        <p className="text-lg text-muted">
          O Diretório Acadêmico de Sistemas de Informação da FAFRAM representa os alunos do curso: organiza eventos,
          conecta turmas, cuida da loja de produtos do curso e leva as demandas dos estudantes à coordenação.
        </p>
      </header>

      {atual && (
        <section aria-labelledby="gestao-atual" className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <h2 id="gestao-atual" className="text-3xl">
              Gestão {atual.nome} {atual.ano}
            </h2>
            <Badge tom="acento">Atual</Badge>
          </div>
          {atual.descricao && <p className="max-w-2xl text-muted">{atual.descricao}</p>}
          <Membros gestao={atual} />
        </section>
      )}

      {anteriores.length > 0 && (
        <section aria-labelledby="anteriores" className="flex flex-col gap-6">
          <h2 id="anteriores" className="text-3xl">
            Gestões anteriores
          </h2>
          {anteriores.map((g) => (
            <div key={g.id} className="flex flex-col gap-3">
              <h3 className="text-2xl">
                {g.nome} <span className="font-mono text-base text-muted">{g.ano}</span>
              </h3>
              {g.descricao && <p className="max-w-2xl text-muted">{g.descricao}</p>}
              <Membros gestao={g} />
            </div>
          ))}
        </section>
      )}
    </div>
  );
}
