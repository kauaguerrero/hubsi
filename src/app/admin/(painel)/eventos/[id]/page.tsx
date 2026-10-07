import Image from "next/image";
import { notFound } from "next/navigation";
import { BotaoAcao } from "@/components/admin/botao-acao";
import { FormAcao } from "@/components/admin/form-acao";
import { UploadImagem } from "@/components/admin/upload-imagem";
import { Card } from "@/components/ui/display";
import { Input, Select, Textarea } from "@/components/ui/field";
import { isoParaDatetimeLocal } from "@/lib/utils/datas";
import { contextoAdmin } from "@/server/admin/contexto";
import {
  adicionarPalestrante,
  definirCapaEvento,
  excluirEvento,
  removerPalestrante,
  salvarEvento,
} from "@/server/actions/eventos";

export const metadata = { title: "Evento" };

export default async function EventoAdminPage({ params }: PageProps<"/admin/eventos/[id]">) {
  const { id } = await params;
  const { supabase } = await contextoAdmin("eventos");
  const novo = id === "novo";
  const { data: evento } = novo
    ? { data: null }
    : await supabase.from("eventos").select("*, palestrantes(id, nome, bio, ordem)").eq("id", id).maybeSingle();
  if (!novo && !evento) notFound();
  const palestrantes = [...(evento?.palestrantes ?? [])].sort((a, b) => a.ordem - b.ordem);

  return (
    <div className="flex max-w-2xl flex-col gap-10">
      <h1 className="text-5xl uppercase">{novo ? "Novo evento" : evento?.titulo}</h1>

      <FormAcao action={salvarEvento.bind(null, novo ? null : id)}>
        <Input id="titulo" name="titulo" label="Título" defaultValue={evento?.titulo} required />
        <Input id="slug" name="slug" label="Slug (URL)" dica="Minúsculas, números e hífens." defaultValue={evento?.slug} required />
        <div className="grid gap-4 sm:grid-cols-2">
          <Select id="tipo" name="tipo" label="Tipo" defaultValue={evento?.tipo ?? "outro"}>
            <option value="palestra">Palestra</option>
            <option value="workshop">Workshop</option>
            <option value="hackathon">Hackathon</option>
            <option value="social">Social</option>
            <option value="semana_academica">Semana acadêmica</option>
            <option value="outro">Outro</option>
          </Select>
          <Select id="status" name="status" label="Status" defaultValue={evento?.status ?? "rascunho"}>
            <option value="rascunho">Rascunho (não aparece no site)</option>
            <option value="publicado">Publicado</option>
            <option value="cancelado">Cancelado</option>
          </Select>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input id="inicio" name="inicio" type="datetime-local" label="Início (Brasília)" defaultValue={isoParaDatetimeLocal(evento?.inicio)} required />
          <Input id="fim" name="fim" type="datetime-local" label="Fim (opcional)" defaultValue={isoParaDatetimeLocal(evento?.fim)} />
        </div>
        <Input id="local" name="local" label="Local" defaultValue={evento?.local ?? ""} />
        <Input id="link_inscricao" name="link_inscricao" type="url" label="Link de inscrição (externo)" defaultValue={evento?.link_inscricao ?? ""} />
        <Textarea id="descricao" name="descricao" label="Descrição" defaultValue={evento?.descricao ?? ""} />
      </FormAcao>

      {!novo && evento && (
        <>
          <section aria-labelledby="capa" className="flex flex-col gap-4">
            <h2 id="capa" className="text-3xl">Capa</h2>
            {evento.capa_url && (
              <div className="relative aspect-video max-w-md overflow-hidden rounded-lg border border-border">
                <Image src={evento.capa_url} alt={`Capa de ${evento.titulo}`} fill sizes="448px" className="object-cover" />
              </div>
            )}
            <UploadImagem bucket="eventos" pasta={id} rotulo="Enviar capa (JPG, PNG ou WebP, até 5 MB)" aoEnviar={definirCapaEvento.bind(null, id)} />
          </section>

          <section aria-labelledby="palestrantes" className="flex flex-col gap-4">
            <h2 id="palestrantes" className="text-3xl">Palestrantes</h2>
            <ul className="flex flex-col gap-2">
              {palestrantes.map((p) => (
                <li key={p.id}>
                  <Card className="flex items-center justify-between gap-3 py-3">
                    <span>{p.nome}</span>
                    <BotaoAcao action={removerPalestrante.bind(null, id, p.id)} confirmar="Remover palestrante?">Remover</BotaoAcao>
                  </Card>
                </li>
              ))}
            </ul>
            <FormAcao action={adicionarPalestrante.bind(null, id)} rotulo="Adicionar palestrante" limparAoSalvar>
              <Input id="p_nome" name="nome" label="Nome" required />
              <Textarea id="p_bio" name="bio" label="Mini bio" rows={2} />
              <Input id="p_ordem" name="ordem" type="number" min={0} label="Ordem" defaultValue={palestrantes.length + 1} />
            </FormAcao>
          </section>

          <BotaoAcao action={excluirEvento.bind(null, id)} confirmar="Excluir este evento e seus palestrantes?" className="w-fit text-danger">
            Excluir evento
          </BotaoAcao>
        </>
      )}
    </div>
  );
}
