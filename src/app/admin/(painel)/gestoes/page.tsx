import Link from "next/link";
import { BotaoAcao } from "@/components/admin/botao-acao";
import { Badge, Card } from "@/components/ui/display";
import { ButtonLink } from "@/components/ui/button";
import { podeAcessar } from "@/lib/auth/permissoes";
import { contextoAdmin } from "@/server/admin/contexto";
import { tornarGestaoAtual } from "@/server/actions/gestoes";

export const metadata = { title: "Gestões" };

const ERROS: Record<string, string> = {
  ativa: "A gestão atual não pode ser excluída. Ative outra antes.",
  "em-uso": "Esta gestão está em uso e não pode ser excluída.",
  ativar: "Não foi possível trocar a gestão atual.",
};

export default async function GestoesPage({ searchParams }: PageProps<"/admin/gestoes">) {
  const { perfil, supabase } = await contextoAdmin("gestoes");
  const { erro } = await searchParams;
  const { data: gestoes } = await supabase.from("gestoes").select("id, nome, ano, ativa").order("ano", { ascending: false });
  const superadmin = podeAcessar(perfil.papel, "usuarios");

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-5xl uppercase">Gestões</h1>
        <ButtonLink href="/admin/gestoes/novo">Nova gestão</ButtonLink>
      </div>
      {typeof erro === "string" && ERROS[erro] && (
        <p role="alert" className="rounded-lg border border-danger px-4 py-3 text-danger">{ERROS[erro]}</p>
      )}
      <ul className="flex flex-col gap-3">
        {(gestoes ?? []).map((g) => (
          <li key={g.id}>
            <Card className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <Link href={`/admin/gestoes/${g.id}`} className="font-display text-2xl font-bold hover:text-accent">{g.nome} {g.ano}</Link>
                {g.ativa && <Badge tom="acento">Atual</Badge>}
              </div>
              {!g.ativa && superadmin && (
                <BotaoAcao action={tornarGestaoAtual.bind(null, g.id)} confirmar={`Tornar ${g.nome} ${g.ano} a gestão atual? O selo do site muda para ela.`}>
                  Tornar gestão atual
                </BotaoAcao>
              )}
            </Card>
          </li>
        ))}
      </ul>
    </div>
  );
}
