import Image from "next/image";
import { notFound } from "next/navigation";
import { BotaoAcao } from "@/components/admin/botao-acao";
import { FormAcao } from "@/components/admin/form-acao";
import { UploadImagem } from "@/components/admin/upload-imagem";
import { Badge, Card } from "@/components/ui/display";
import { ButtonLink, buttonClass } from "@/components/ui/button";
import { Input, Select, Textarea } from "@/components/ui/field";
import { calcularKpis, destaqueAtivo } from "@/lib/destaques/regras";
import { formatarDataHora, isoParaDatetimeLocal } from "@/lib/utils/datas";
import { formatarBRL } from "@/lib/utils/money";
import { contextoAdmin } from "@/server/admin/contexto";
import {
  adicionarItemDestaque,
  alternarContatado,
  definirCapaDestaque,
  excluirDestaque,
  removerInteressado,
  removerItemDestaque,
  salvarDestaque,
} from "@/server/actions/destaques";

export const metadata = { title: "Destaque" };

export default async function DestaqueAdminPage({ params }: PageProps<"/admin/destaques/[id]">) {
  const { id } = await params;
  const { supabase } = await contextoAdmin("destaques");
  const novo = id === "novo";

  const { data: destaque } = novo
    ? { data: null }
    : await supabase.from("destaques").select("*, itens:destaque_itens(*)").eq("id", id).maybeSingle();
  if (!novo && !destaque) notFound();

  const itens = [...(destaque?.itens ?? [])].sort((a, b) => a.ordem - b.ordem);
  const { data: interessados } =
    !novo && destaque?.tipo === "formulario"
      ? await supabase
          .from("destaque_interessados")
          .select("id, nome, email, whatsapp, turma, observacao, contatado_em, created_at, interesses:destaque_interesses(item_id, quantidade, preco_centavos)")
          .eq("destaque_id", id)
          .order("created_at", { ascending: false })
      : { data: [] };

  const kpis = calcularKpis((interessados ?? []).map((i) => ({ contatado_em: i.contatado_em, itens: i.interesses })));
  const nomeItem = new Map(itens.map((i) => [i.id, i.nome]));
  const ativo = destaque ? destaqueAtivo(destaque) : false;

  return (
    <div className="flex max-w-3xl flex-col gap-10">
      <div className="flex flex-col gap-3">
        <h1 className="text-5xl">{novo ? "Novo destaque" : destaque?.titulo}</h1>
        {destaque && (
          <div className="flex flex-wrap items-center gap-3">
            <Badge tom={ativo ? "sucesso" : destaque.status === "publicado" ? "perigo" : "neutro"}>
              {ativo ? "no ar" : destaque.status === "publicado" ? "expirado" : "rascunho"}
            </Badge>
            <ButtonLink href={`/destaque/${destaque.slug}`} variante="secundario">Ver página pública</ButtonLink>
          </div>
        )}
      </div>

      {destaque?.tipo === "formulario" && (
        <section aria-labelledby="kpis" className="flex flex-col gap-4">
          <h2 id="kpis" className="text-3xl">Interesse</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <p className="font-mono text-xs text-muted uppercase">Interessados</p>
              <p className="font-mono text-3xl">{kpis.total}</p>
            </Card>
            <Card>
              <p className="font-mono text-xs text-muted uppercase">Valor esperado</p>
              <p className="font-mono text-3xl">{formatarBRL(kpis.valorCentavos)}</p>
            </Card>
            <Card>
              <p className="font-mono text-xs text-muted uppercase">Unidades</p>
              <p className="font-mono text-3xl">{kpis.unidades}</p>
            </Card>
            <Card>
              <p className="font-mono text-xs text-muted uppercase">Já contatados</p>
              <p className="font-mono text-3xl">{kpis.contatados}/{kpis.total}</p>
            </Card>
          </div>
          {kpis.total > 0 && <p className="font-mono text-sm text-muted">Ticket médio por pessoa: {formatarBRL(kpis.ticketMedioCentavos)}</p>}

          {itens.length > 0 && (
            <Card className="flex flex-col gap-3">
              <h3 className="text-xl">Demanda por item</h3>
              <ul className="flex flex-col gap-2">
                {itens.map((it) => {
                  const r = kpis.porItem.find((p) => p.itemId === it.id);
                  const pct = kpis.total ? Math.round(((r?.interessados ?? 0) / kpis.total) * 100) : 0;
                  return (
                    <li key={it.id} className="flex flex-col gap-1">
                      <div className="flex flex-wrap justify-between gap-2">
                        <span>{it.nome}</span>
                        <span className="font-mono text-sm text-muted">
                          {r?.interessados ?? 0} pessoa(s) · {r?.unidades ?? 0} un. · {formatarBRL(r?.valorCentavos ?? 0)}
                        </span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-accent/10" role="presentation">
                        <div className="bg-brand h-full" style={{ width: `${pct}%` }} />
                      </div>
                    </li>
                  );
                })}
              </ul>
            </Card>
          )}

          <div className="flex flex-wrap items-center justify-between gap-3">
            <h3 className="text-2xl">Quem quer</h3>
            {kpis.total > 0 && <a href={`/admin/destaques/${id}/csv`} className={buttonClass("secundario")}>Baixar CSV</a>}
          </div>
          <ul className="flex flex-col gap-3">
            {(interessados ?? []).map((p) => {
              const valor = p.interesses.reduce((s, i) => s + i.quantidade * i.preco_centavos, 0);
              return (
                <li key={p.id}>
                  <Card className="flex flex-col gap-2">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <p className="font-semibold">{p.nome}{p.turma ? ` · ${p.turma}` : ""}</p>
                        <p className="text-sm text-muted break-all">{p.email}</p>
                        <a
                          href={`https://wa.me/55${p.whatsapp}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-accent underline-offset-4 hover:underline"
                        >
                          WhatsApp {p.whatsapp}
                        </a>
                      </div>
                      <div className="text-right">
                        <p className="font-mono text-lg">{formatarBRL(valor)}</p>
                        <Badge tom={p.contatado_em ? "sucesso" : "neutro"}>{p.contatado_em ? "contatado" : "a contatar"}</Badge>
                      </div>
                    </div>
                    <p className="text-sm">
                      {p.interesses.map((i) => `${i.quantidade}× ${nomeItem.get(i.item_id) ?? "item removido"}`).join(", ")}
                    </p>
                    {p.observacao && <p className="text-sm text-muted">“{p.observacao}”</p>}
                    <p className="font-mono text-xs text-muted">{formatarDataHora(p.created_at)}</p>
                    <div className="flex flex-wrap gap-2">
                      <BotaoAcao action={alternarContatado.bind(null, id, p.id, !p.contatado_em)}>
                        {p.contatado_em ? "Desmarcar contato" : "Marcar como contatado"}
                      </BotaoAcao>
                      <BotaoAcao action={removerInteressado.bind(null, id, p.id)} confirmar="Remover esta pessoa da lista?" className="text-danger">
                        Remover
                      </BotaoAcao>
                    </div>
                  </Card>
                </li>
              );
            })}
            {!interessados?.length && <li className="text-muted">Ninguém demonstrou interesse ainda.</li>}
          </ul>
        </section>
      )}

      <section aria-labelledby="dados" className="flex flex-col gap-4">
        <h2 id="dados" className="text-3xl">Dados do destaque</h2>
        <FormAcao action={salvarDestaque.bind(null, novo ? null : id)}>
          <Input id="titulo" name="titulo" label="Título" defaultValue={destaque?.titulo} required />
          <Input id="slug" name="slug" label="Slug (URL)" dica="Minúsculas, números e hífens. Página: /destaque/slug" defaultValue={destaque?.slug} required />
          <div className="grid gap-4 sm:grid-cols-2">
            <Select id="tipo" name="tipo" label="Tipo" defaultValue={destaque?.tipo ?? "save_the_date"}>
              <option value="save_the_date">Save the date (só avisa a data)</option>
              <option value="formulario">Formulário de interesse (pré-venda)</option>
              <option value="link">Link externo</option>
            </Select>
            <Select id="status" name="status" label="Status" defaultValue={destaque?.status ?? "rascunho"}>
              <option value="rascunho">Rascunho (não aparece no site)</option>
              <option value="publicado">Publicado</option>
            </Select>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input id="data_evento" name="data_evento" type="datetime-local" label="Data do evento/lançamento (opcional)" defaultValue={isoParaDatetimeLocal(destaque?.data_evento)} />
            <Input id="expira_em" name="expira_em" type="datetime-local" label="Destaque expira em (opcional)" dica="Depois dessa data sai da página inicial." defaultValue={isoParaDatetimeLocal(destaque?.expira_em)} />
          </div>
          <Input id="cta_texto" name="cta_texto" label="Texto do botão (opcional)" dica="Vazio usa o padrão do tipo." defaultValue={destaque?.cta_texto ?? ""} maxLength={40} />
          <Input id="link_externo" name="link_externo" type="url" label="Link externo (só para o tipo Link)" defaultValue={destaque?.link_externo ?? ""} />
          <Textarea id="descricao" name="descricao" label="Descrição" defaultValue={destaque?.descricao ?? ""} />
        </FormAcao>
      </section>

      {destaque && (
        <>
          <section aria-labelledby="capa" className="flex flex-col gap-4">
            <h2 id="capa" className="text-3xl">Imagem</h2>
            {destaque.capa_url && (
              <div className="relative aspect-video max-w-md overflow-hidden rounded-lg border border-border">
                <Image src={destaque.capa_url} alt={`Imagem de ${destaque.titulo}`} fill sizes="448px" className="object-cover" />
              </div>
            )}
            <UploadImagem bucket="eventos" pasta={`destaques/${id}`} rotulo="Enviar imagem (JPG, PNG ou WebP, até 5 MB)" aoEnviar={definirCapaDestaque.bind(null, id)} />
          </section>

          {destaque.tipo === "formulario" && (
            <section aria-labelledby="itens" className="flex flex-col gap-4">
              <h2 id="itens" className="text-3xl">Itens do formulário</h2>
              <p className="text-muted">O aluno escolhe quais itens quer. O preço informado é só uma estimativa para calcular o valor esperado.</p>
              <ul className="flex flex-col gap-2">
                {itens.map((it) => (
                  <li key={it.id}>
                    <Card className="flex items-center justify-between gap-3 py-3">
                      <span>{it.nome} <span className="font-mono text-sm text-muted">{formatarBRL(it.preco_centavos)}</span></span>
                      <BotaoAcao action={removerItemDestaque.bind(null, id, it.id)} confirmar="Remover este item? Os interesses nele também somem.">Remover</BotaoAcao>
                    </Card>
                  </li>
                ))}
                {!itens.length && <li className="text-muted">Adicione ao menos um item para o formulário aparecer.</li>}
              </ul>
              <FormAcao action={adicionarItemDestaque.bind(null, id)} rotulo="Adicionar item" limparAoSalvar>
                <Input id="i_nome" name="nome" label="Nome do item" required />
                <Input id="i_preco" name="preco" label="Preço estimado (R$)" inputMode="decimal" placeholder="49,90" />
                <Textarea id="i_desc" name="descricao" label="Descrição (opcional)" rows={2} />
                <Input id="i_ordem" name="ordem" type="number" min={0} label="Ordem" defaultValue={itens.length + 1} />
              </FormAcao>
            </section>
          )}

          <BotaoAcao action={excluirDestaque.bind(null, id)} confirmar="Excluir este destaque e todos os interessados?" className="w-fit text-danger">
            Excluir destaque
          </BotaoAcao>
        </>
      )}
    </div>
  );
}
