import Image from "next/image";
import { notFound } from "next/navigation";
import { BotaoAcao } from "@/components/admin/botao-acao";
import { FormAcao } from "@/components/admin/form-acao";
import { UploadImagem } from "@/components/admin/upload-imagem";
import { Card } from "@/components/ui/display";
import { Input, Textarea } from "@/components/ui/field";
import { contextoAdmin } from "@/server/admin/contexto";
import {
  adicionarMembro,
  definirLogoGestao,
  excluirGestao,
  removerMembro,
  salvarGestao,
} from "@/server/actions/gestoes";

export const metadata = { title: "Gestão" };

export default async function GestaoAdminPage({ params }: PageProps<"/admin/gestoes/[id]">) {
  const { id } = await params;
  const { supabase } = await contextoAdmin("gestoes");
  const novo = id === "novo";
  const { data: gestao } = novo
    ? { data: null }
    : await supabase.from("gestoes").select("*, membros_gestao(id, nome, cargo, ordem)").eq("id", id).maybeSingle();
  if (!novo && !gestao) notFound();
  const membros = [...(gestao?.membros_gestao ?? [])].sort((a, b) => a.ordem - b.ordem);

  return (
    <div className="flex max-w-2xl flex-col gap-10">
      <h1 className="text-5xl uppercase">{novo ? "Nova gestão" : `${gestao?.nome} ${gestao?.ano}`}</h1>

      <FormAcao action={salvarGestao.bind(null, novo ? null : id)}>
        <Input id="nome" name="nome" label="Nome da chapa" defaultValue={gestao?.nome} required />
        <Input id="slug" name="slug" label="Slug" dica="Ex.: overflow-2026" defaultValue={gestao?.slug} required />
        <Input id="ano" name="ano" type="number" label="Ano" defaultValue={gestao?.ano ?? new Date().getFullYear()} required />
        <Textarea id="descricao" name="descricao" label="Descrição" defaultValue={gestao?.descricao ?? ""} />
      </FormAcao>

      {!novo && gestao && (
        <>
          <section aria-labelledby="logo" className="flex flex-col gap-4">
            <h2 id="logo" className="text-3xl">Logo</h2>
            {gestao.logo_url && (
              <Image src={gestao.logo_url} alt={`Logo da gestão ${gestao.nome}`} width={96} height={96} className="size-24 rounded-xl border border-border object-cover" />
            )}
            <UploadImagem bucket="gestoes" pasta={id} rotulo="Enviar logo (JPG, PNG ou WebP, até 5 MB)" aoEnviar={definirLogoGestao.bind(null, id)} />
          </section>

          <section aria-labelledby="membros" className="flex flex-col gap-4">
            <h2 id="membros" className="text-3xl">Membros</h2>
            <ul className="flex flex-col gap-2">
              {membros.map((m) => (
                <li key={m.id}>
                  <Card className="flex items-center justify-between gap-3 py-3">
                    <span>{m.nome} <span className="text-muted">· {m.cargo}</span></span>
                    <BotaoAcao action={removerMembro.bind(null, id, m.id)} confirmar="Remover membro?">Remover</BotaoAcao>
                  </Card>
                </li>
              ))}
            </ul>
            <FormAcao action={adicionarMembro.bind(null, id)} rotulo="Adicionar membro" limparAoSalvar>
              <Input id="m_nome" name="nome" label="Nome" required />
              <Input id="m_cargo" name="cargo" label="Cargo" required />
              <Input id="m_ordem" name="ordem" type="number" min={0} label="Ordem" defaultValue={membros.length + 1} />
            </FormAcao>
          </section>

          <BotaoAcao action={excluirGestao.bind(null, id)} confirmar="Excluir esta gestão e seus membros?" className="w-fit text-danger">
            Excluir gestão
          </BotaoAcao>
        </>
      )}
    </div>
  );
}
