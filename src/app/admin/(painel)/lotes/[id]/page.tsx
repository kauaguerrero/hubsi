import { notFound } from "next/navigation";
import { BotaoAcao } from "@/components/admin/botao-acao";
import { FormAcao } from "@/components/admin/form-acao";
import { Input, Select } from "@/components/ui/field";
import { isoParaDatetimeLocal } from "@/lib/utils/datas";
import { contextoAdmin } from "@/server/admin/contexto";
import { excluirLote, salvarLote } from "@/server/actions/lotes";

export const metadata = { title: "Lote" };

export default async function LotePage({ params }: PageProps<"/admin/lotes/[id]">) {
  const { id } = await params;
  const { supabase } = await contextoAdmin("lotes");
  const novo = id === "novo";
  const { data: lote } = novo ? { data: null } : await supabase.from("lotes").select("*").eq("id", id).maybeSingle();
  if (!novo && !lote) notFound();

  return (
    <div className="flex max-w-2xl flex-col gap-6">
      <h1 className="text-5xl">{novo ? "Novo lote" : lote?.nome}</h1>
      <FormAcao action={salvarLote.bind(null, novo ? null : id)}>
        <Input id="nome" name="nome" label="Nome" defaultValue={lote?.nome} required />
        <Select id="status" name="status" label="Status" defaultValue={lote?.status ?? "aberto"}>
          <option value="aberto">Aberto</option>
          <option value="fechado">Fechado</option>
          <option value="em_producao">Em produção</option>
          <option value="entregue">Entregue</option>
        </Select>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input id="abre_em" name="abre_em" type="datetime-local" label="Abre em (Brasília)" defaultValue={isoParaDatetimeLocal(lote?.abre_em ?? new Date().toISOString())} required />
          <Input id="fecha_em" name="fecha_em" type="datetime-local" label="Fecha em (Brasília)" defaultValue={isoParaDatetimeLocal(lote?.fecha_em)} required />
        </div>
        <Input id="limite_unidades" name="limite_unidades" type="number" min={1} label="Limite de unidades (opcional)" defaultValue={lote?.limite_unidades ?? ""} />
        <Input id="local_retirada" name="local_retirada" label="Local de retirada" defaultValue={lote?.local_retirada ?? ""} />
        <Input id="data_retirada" name="data_retirada" type="datetime-local" label="Data de retirada (opcional)" defaultValue={isoParaDatetimeLocal(lote?.data_retirada)} />
      </FormAcao>
      {!novo && (
        <BotaoAcao action={excluirLote.bind(null, id)} confirmar="Excluir este lote? Só é possível se não houver pedidos." className="text-danger">
          Excluir lote
        </BotaoAcao>
      )}
    </div>
  );
}
