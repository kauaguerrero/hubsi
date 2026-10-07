import Image from "next/image";
import { notFound } from "next/navigation";
import { BotaoAcao } from "@/components/admin/botao-acao";
import { FormAcao } from "@/components/admin/form-acao";
import { UploadImagem } from "@/components/admin/upload-imagem";
import { Organograma } from "@/components/sobre/organograma";
import { Card } from "@/components/ui/display";
import { Input, Select, Textarea } from "@/components/ui/field";
import { descendentes } from "@/lib/gestao/arvore";
import type { MembroOrg } from "@/lib/gestao/organograma";
import { contextoAdmin } from "@/server/admin/contexto";
import {
  adicionarMembro,
  definirFotoMembro,
  definirLogoGestao,
  excluirGestao,
  moverMembro,
  organizarPorCargo,
  removerFotoMembro,
  removerMembro,
  salvarGestao,
  salvarMembro,
} from "@/server/actions/gestoes";

export const metadata = { title: "Gestão" };

function OpcoesSuperior({
  membros,
  excluir,
}: {
  membros: MembroOrg[];
  excluir?: Set<string>;
}) {
  return (
    <>
      <option value="">Ninguém (topo do organograma)</option>
      {membros
        .filter((m) => !excluir?.has(m.id))
        .map((m) => (
          <option key={m.id} value={m.id}>
            {m.nome} — {m.cargo}
          </option>
        ))}
    </>
  );
}

export default async function GestaoAdminPage({
  params,
}: PageProps<"/admin/gestoes/[id]">) {
  const { id } = await params;
  const { supabase } = await contextoAdmin("gestoes");
  const novo = id === "novo";
  const { data: gestao } = novo
    ? { data: null }
    : await supabase
        .from("gestoes")
        .select(
          "*, membros_gestao(id, nome, cargo, foto_url, ordem, superior_id)",
        )
        .eq("id", id)
        .maybeSingle();
  if (!novo && !gestao) notFound();
  const membros: MembroOrg[] = [...(gestao?.membros_gestao ?? [])].sort(
    (a, b) => a.ordem - b.ordem,
  );
  const nomeDe = new Map(membros.map((m) => [m.id, m.nome]));

  return (
    <div className="flex max-w-3xl flex-col gap-10">
      <h1 className="text-5xl">
        {novo ? "Nova gestão" : `${gestao?.nome} ${gestao?.ano}`}
      </h1>

      <FormAcao action={salvarGestao.bind(null, novo ? null : id)}>
        <Input
          id="nome"
          name="nome"
          label="Nome da chapa"
          defaultValue={gestao?.nome}
          required
        />
        <Input
          id="slug"
          name="slug"
          label="Slug"
          dica="Ex.: overflow-2026"
          defaultValue={gestao?.slug}
          required
        />
        <Input
          id="ano"
          name="ano"
          type="number"
          label="Ano"
          defaultValue={gestao?.ano ?? new Date().getFullYear()}
          required
        />
        <Textarea
          id="descricao"
          name="descricao"
          label="Descrição"
          defaultValue={gestao?.descricao ?? ""}
        />
      </FormAcao>

      {!novo && gestao && (
        <>
          <section aria-labelledby="logo" className="flex flex-col gap-4">
            <h2 id="logo" className="text-3xl">
              Logo
            </h2>
            {gestao.logo_url && (
              <Image
                src={gestao.logo_url}
                alt={`Logo da gestão ${gestao.nome}`}
                width={96}
                height={96}
                className="border-border size-24 rounded-xl border object-cover"
              />
            )}
            <UploadImagem
              bucket="gestoes"
              pasta={id}
              rotulo="Enviar logo (JPG, PNG ou WebP, até 5 MB)"
              aoEnviar={definirLogoGestao.bind(null, id)}
              recortarMargens
            />
          </section>

          <section
            aria-labelledby="organograma"
            className="flex flex-col gap-4"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 id="organograma" className="text-3xl">
                Organograma
              </h2>
              {membros.length > 1 && (
                <BotaoAcao
                  action={organizarPorCargo.bind(null, id)}
                  confirmar="Refazer a hierarquia a partir dos cargos? Isso sobrescreve os superiores definidos manualmente."
                >
                  Organizar pelos cargos
                </BotaoAcao>
              )}
            </div>
            <p className="text-muted text-sm">
              Prévia do que aparece em <strong>/sobre</strong>. Defina o{" "}
              <strong>superior</strong> de cada pessoa abaixo (quem está acima
              dela) e use as setas para mudar a ordem entre irmãos.
            </p>
            <Card className="bg-brand-soft overflow-hidden">
              {membros.length ? (
                <Organograma membros={membros} />
              ) : (
                <p className="text-muted">
                  Adicione membros para montar o organograma.
                </p>
              )}
            </Card>
          </section>

          <section aria-labelledby="membros" className="flex flex-col gap-4">
            <h2 id="membros" className="text-3xl">
              Membros
            </h2>
            <ul className="flex flex-col gap-3">
              {membros.map((m) => {
                const abaixo = descendentes(m.id, membros);
                abaixo.add(m.id);
                return (
                  <li key={m.id}>
                    <details className="border-border bg-surface shadow-card rounded-2xl border">
                      <summary className="flex min-h-14 cursor-pointer items-center gap-3 px-4 py-3">
                        {m.foto_url ? (
                          <Image
                            src={m.foto_url}
                            alt=""
                            width={40}
                            height={40}
                            className="size-10 rounded-full object-cover"
                          />
                        ) : (
                          <span
                            aria-hidden="true"
                            className="bg-brand font-display text-on-accent flex size-10 items-center justify-center rounded-full font-bold"
                          >
                            {m.nome.charAt(0)}
                          </span>
                        )}
                        <span className="flex flex-col">
                          <span className="font-display text-lg font-bold">
                            {m.nome}
                          </span>
                          <span className="text-muted text-sm">
                            {m.cargo} ·{" "}
                            {m.superior_id
                              ? `abaixo de ${nomeDe.get(m.superior_id) ?? "—"}`
                              : "topo"}
                          </span>
                        </span>
                      </summary>

                      <div className="border-border flex flex-col gap-6 border-t p-4">
                        <div className="flex flex-wrap gap-2">
                          <BotaoAcao
                            action={moverMembro.bind(null, id, m.id, "cima")}
                          >
                            ↑ Subir
                          </BotaoAcao>
                          <BotaoAcao
                            action={moverMembro.bind(null, id, m.id, "baixo")}
                          >
                            ↓ Descer
                          </BotaoAcao>
                        </div>

                        <FormAcao
                          action={salvarMembro.bind(null, id, m.id)}
                          rotulo="Salvar membro"
                        >
                          <Input
                            id={`n_${m.id}`}
                            name="nome"
                            label="Nome"
                            defaultValue={m.nome}
                            required
                          />
                          <Input
                            id={`c_${m.id}`}
                            name="cargo"
                            label="Cargo"
                            defaultValue={m.cargo}
                            required
                          />
                          <Select
                            id={`s_${m.id}`}
                            name="superior_id"
                            label="Superior (quem está acima)"
                            defaultValue={m.superior_id ?? ""}
                          >
                            <OpcoesSuperior
                              membros={membros}
                              excluir={abaixo}
                            />
                          </Select>
                        </FormAcao>

                        <div className="flex flex-col gap-3">
                          <p className="text-sm font-medium">Foto</p>
                          {m.foto_url && (
                            <div className="flex items-center gap-4">
                              <Image
                                src={m.foto_url}
                                alt={`Foto de ${m.nome}`}
                                width={80}
                                height={80}
                                className="size-20 rounded-full object-cover"
                              />
                              <BotaoAcao
                                action={removerFotoMembro.bind(null, id, m.id)}
                                confirmar="Remover a foto deste membro?"
                              >
                                Remover foto
                              </BotaoAcao>
                            </div>
                          )}
                          <UploadImagem
                            bucket="gestoes"
                            pasta={`${id}/membros`}
                            rotulo={
                              m.foto_url
                                ? "Trocar foto (JPG, PNG ou WebP, até 5 MB)"
                                : "Enviar foto (JPG, PNG ou WebP, até 5 MB)"
                            }
                            aoEnviar={definirFotoMembro.bind(null, id, m.id)}
                          />
                        </div>

                        <BotaoAcao
                          action={removerMembro.bind(null, id, m.id)}
                          confirmar={`Remover ${m.nome} da gestão? Quem está abaixo dele sobe um nível.`}
                          className="text-danger w-fit"
                        >
                          Remover membro
                        </BotaoAcao>
                      </div>
                    </details>
                  </li>
                );
              })}
            </ul>

            <Card className="flex flex-col gap-4">
              <h3 className="text-2xl">Adicionar membro</h3>
              <FormAcao
                action={adicionarMembro.bind(null, id)}
                rotulo="Adicionar membro"
                limparAoSalvar
              >
                <Input id="m_nome" name="nome" label="Nome" required />
                <Input id="m_cargo" name="cargo" label="Cargo" required />
                <Select
                  id="m_superior"
                  name="superior_id"
                  label="Superior (quem está acima)"
                  defaultValue=""
                >
                  <OpcoesSuperior membros={membros} />
                </Select>
              </FormAcao>
              <p className="text-muted text-sm">
                Depois de adicionar, abra o membro na lista para enviar a foto.
              </p>
            </Card>
          </section>

          <BotaoAcao
            action={excluirGestao.bind(null, id)}
            confirmar="Excluir esta gestão e seus membros?"
            className="text-danger w-fit"
          >
            Excluir gestão
          </BotaoAcao>
        </>
      )}
    </div>
  );
}
