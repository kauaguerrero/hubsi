import Link from "next/link";
import { redirect } from "next/navigation";
import { Badge, Card } from "@/components/ui/display";
import { paginaInicial, podeAcessar } from "@/lib/auth/permissoes";
import { requireRole } from "@/lib/auth/roles";
import { formatarDataHora } from "@/lib/utils/datas";
import { formatarBRL } from "@/lib/utils/money";
import { contextoAdmin } from "@/server/admin/contexto";

export const metadata = { title: "Painel" };

const PAGOS = ["pago", "em_producao", "disponivel", "retirado"];

export default async function DashboardPage() {
  const perfil = await requireRole(["editor", "admin", "superadmin"]);
  if (!podeAcessar(perfil.papel, "dashboard")) redirect(paginaInicial(perfil.papel));
  const { supabase } = await contextoAdmin("dashboard");

  const { data: lotes } = await supabase.from("lotes").select("*").order("abre_em", { ascending: false });
  const lote = lotes?.find((l) => l.status === "aberto") ?? lotes?.[0] ?? null;

  const { data: pedidos } = lote
    ? await supabase.from("pedidos").select("status, total_centavos").eq("lote_id", lote.id)
    : { data: [] };

  const pagos = (pedidos ?? []).filter((p) => PAGOS.includes(p.status));
  const pendentes = (pedidos ?? []).filter((p) => p.status === "aguardando_pagamento");
  const arrecadado = pagos.reduce((s, p) => s + p.total_centavos, 0);

  const { data: proximo } = await supabase
    .from("eventos")
    .select("slug, titulo, inicio, status")
    .gte("inicio", new Date().toISOString())
    .neq("status", "cancelado")
    .order("inicio", { ascending: true })
    .limit(1)
    .maybeSingle();

  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-5xl uppercase">Painel</h1>

      {lote ? (
        <section aria-labelledby="lote" className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <h2 id="lote" className="text-3xl">{lote.nome}</h2>
            <Badge tom={lote.status === "aberto" ? "sucesso" : "neutro"}>{lote.status}</Badge>
            <span className="font-mono text-sm text-muted">fecha em {formatarDataHora(lote.fecha_em)}</span>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <Card>
              <p className="font-mono text-xs text-muted uppercase">Arrecadado</p>
              <p className="font-mono text-3xl">{formatarBRL(arrecadado)}</p>
            </Card>
            <Card>
              <p className="font-mono text-xs text-muted uppercase">Pedidos pagos</p>
              <p className="font-mono text-3xl">{pagos.length}</p>
            </Card>
            <Card>
              <p className="font-mono text-xs text-muted uppercase">Aguardando pagamento</p>
              <p className="font-mono text-3xl">{pendentes.length}</p>
            </Card>
          </div>
        </section>
      ) : (
        <Card>
          Nenhum lote criado ainda. <Link href="/admin/lotes/novo" className="text-accent underline">Criar lote</Link>
        </Card>
      )}

      <section aria-labelledby="evento" className="flex flex-col gap-3">
        <h2 id="evento" className="text-3xl">Próximo evento</h2>
        {proximo ? (
          <Card>
            <Link href="/admin/eventos" className="font-display text-2xl font-bold hover:text-accent">{proximo.titulo}</Link>
            <p className="font-mono text-sm text-muted">{formatarDataHora(proximo.inicio)} · {proximo.status}</p>
          </Card>
        ) : (
          <p className="text-muted">Nenhum evento futuro cadastrado.</p>
        )}
      </section>
    </div>
  );
}
