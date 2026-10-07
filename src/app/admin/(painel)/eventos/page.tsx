import Link from "next/link";
import { Badge, Card } from "@/components/ui/display";
import { ButtonLink } from "@/components/ui/button";
import { formatarDataHora } from "@/lib/utils/datas";
import { contextoAdmin } from "@/server/admin/contexto";

export const metadata = { title: "Eventos" };

const tom = { publicado: "sucesso", rascunho: "neutro", cancelado: "perigo" } as const;

export default async function EventosAdminPage() {
  const { supabase } = await contextoAdmin("eventos");
  const { data: eventos } = await supabase.from("eventos").select("id, titulo, inicio, status").order("inicio", { ascending: false });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-5xl uppercase">Eventos</h1>
        <ButtonLink href="/admin/eventos/novo">Novo evento</ButtonLink>
      </div>
      <ul className="flex flex-col gap-3">
        {(eventos ?? []).map((e) => (
          <li key={e.id}>
            <Card className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <Link href={`/admin/eventos/${e.id}`} className="font-display text-2xl font-bold hover:text-accent">{e.titulo}</Link>
                <p className="font-mono text-sm text-muted">{formatarDataHora(e.inicio)}</p>
              </div>
              <Badge tom={tom[e.status]}>{e.status}</Badge>
            </Card>
          </li>
        ))}
        {!eventos?.length && <li className="text-muted">Nenhum evento ainda.</li>}
      </ul>
    </div>
  );
}
