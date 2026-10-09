import { BotaoAcao } from "@/components/admin/botao-acao";
import { FormAcao } from "@/components/admin/form-acao";
import { Badge } from "@/components/ui/display";
import { Checkbox, Input } from "@/components/ui/field";
import { contextoAdmin } from "@/server/admin/contexto";
import { excluirLinkHub, salvarLinkHub } from "@/server/actions/hub";

export const metadata = { title: "Hub" };

export default async function HubAdminPage() {
  const { supabase } = await contextoAdmin("hub");
  const { data: links } = await supabase.from("links_hub").select("*").order("categoria").order("ordem");

  return (
    <div className="flex max-w-2xl flex-col gap-8">
      <h1 className="text-5xl">Hub</h1>

      <section aria-labelledby="novo" className="flex flex-col gap-4">
        <h2 id="novo" className="text-3xl">Novo link</h2>
        <FormAcao action={salvarLinkHub.bind(null, null)} rotulo="Adicionar link" limparAoSalvar>
          <Input id="n_titulo" name="titulo" label="Título" required />
          <Input id="n_url" name="url" type="url" label="URL" placeholder="https://" required />
          <div className="grid gap-4 sm:grid-cols-2">
            <Input id="n_categoria" name="categoria" label="Categoria" defaultValue="geral" required />
            <Input id="n_ordem" name="ordem" type="number" min={0} label="Ordem" defaultValue={0} />
          </div>
          <Input id="n_descricao" name="descricao" label="Descrição (opcional)" />
          <Checkbox id="n_ativo" name="ativo" label="Ativo" defaultChecked />
        </FormAcao>
      </section>

      <section aria-labelledby="lista" className="flex flex-col gap-3">
        <h2 id="lista" className="text-3xl">Links</h2>
        {(links ?? []).map((l) => (
          <details key={l.id} className="rounded-xl border border-border bg-surface px-4 py-2">
            <summary className="flex min-h-11 cursor-pointer flex-wrap items-center gap-3 py-2">
              <span className="font-display text-xl font-bold">{l.titulo}</span>
              <Badge>{l.categoria}</Badge>
              {!l.ativo && <Badge tom="perigo">Inativo</Badge>}
            </summary>
            <div className="flex flex-col gap-4 py-4">
              <FormAcao action={salvarLinkHub.bind(null, l.id)}>
                <Input id={`t_${l.id}`} name="titulo" label="Título" defaultValue={l.titulo} required />
                <Input id={`u_${l.id}`} name="url" type="url" label="URL" defaultValue={l.url} required />
                <div className="grid gap-4 sm:grid-cols-2">
                  <Input id={`c_${l.id}`} name="categoria" label="Categoria" defaultValue={l.categoria} required />
                  <Input id={`o_${l.id}`} name="ordem" type="number" min={0} label="Ordem" defaultValue={l.ordem} />
                </div>
                <Input id={`d_${l.id}`} name="descricao" label="Descrição" defaultValue={l.descricao ?? ""} />
                <Checkbox id={`a_${l.id}`} name="ativo" label="Ativo" defaultChecked={l.ativo} />
              </FormAcao>
              <BotaoAcao action={excluirLinkHub.bind(null, l.id)} confirmar="Excluir este link?" className="w-fit text-danger">Excluir</BotaoAcao>
            </div>
          </details>
        ))}
        {!links?.length && <p className="text-muted">Nenhum link ainda.</p>}
      </section>
    </div>
  );
}
