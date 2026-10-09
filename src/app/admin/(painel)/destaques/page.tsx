import Link from "next/link";
import { Badge, Card } from "@/components/ui/display";
import { ButtonLink } from "@/components/ui/button";
import { ROTULO_TIPO, destaqueAtivo } from "@/lib/destaques/regras";
import { formatarDataHora } from "@/lib/utils/datas";
import { contextoAdmin } from "@/server/admin/contexto";

export const metadata = { title: "Destaques" };

export default async function DestaquesAdminPage() {
  const { supabase } = await contextoAdmin("destaques");
  const { data: destaques } = await supabase
    .from("destaques")
    .select("id, titulo, tipo, status, expira_em, destaque_interessados(count)")
    .order("created_at", { ascending: false });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-5xl">Destaques</h1>
        <ButtonLink href="/admin/destaques/novo">Anunciar destaque</ButtonLink>
      </div>
      <p className="text-muted">Anúncios em evidência na página inicial: save the date, pré-venda com formulário de interesse ou link externo.</p>
      <ul className="flex flex-col gap-3">
        {(destaques ?? []).map((d) => {
          const ativo = destaqueAtivo(d);
          const interessados = d.destaque_interessados[0]?.count ?? 0;
          return (
            <li key={d.id}>
              <Card className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <Link href={`/admin/destaques/${d.id}`} className="font-display text-2xl font-bold hover:text-accent">{d.titulo}</Link>
                  <p className="font-mono text-sm text-muted">
                    {ROTULO_TIPO[d.tipo]}
                    {d.tipo === "formulario" ? ` · ${interessados} interessado(s)` : ""}
                    {d.expira_em ? ` · expira ${formatarDataHora(d.expira_em)}` : ""}
                  </p>
                </div>
                <Badge tom={ativo ? "sucesso" : d.status === "publicado" ? "perigo" : "neutro"}>
                  {ativo ? "No ar" : d.status === "publicado" ? "Expirado" : "Rascunho"}
                </Badge>
              </Card>
            </li>
          );
        })}
        {!destaques?.length && <li className="text-muted">Nenhum destaque ainda.</li>}
      </ul>
    </div>
  );
}
