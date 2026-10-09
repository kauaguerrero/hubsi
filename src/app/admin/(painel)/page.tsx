import Link from "next/link";
import { redirect } from "next/navigation";
import { IconeAdmin } from "@/components/admin/icones";
import { Badge, Card } from "@/components/ui/display";
import { paginaInicial, podeAcessar } from "@/lib/auth/permissoes";
import { requireRole } from "@/lib/auth/roles";
import { destaqueAtivo } from "@/lib/destaques/regras";
import { formatarDataHora } from "@/lib/utils/datas";
import { formatarBRL } from "@/lib/utils/money";
import { contextoAdmin } from "@/server/admin/contexto";
import { ROTULO_LOTE, ROTULO_STATUS_EVENTO } from "@/lib/utils/rotulos";

export const metadata = { title: "Painel" };

const PAGOS = ["pago", "em_producao", "disponivel", "retirado"];

function Kpi({ rotulo, valor, icone, destaque }: { rotulo: string; valor: string; icone: string; destaque?: boolean }) {
  return (
    <Card className="flex items-center gap-4">
      <span
        className={`flex size-12 shrink-0 items-center justify-center rounded-xl ${
          destaque ? "bg-brand text-on-accent shadow-card" : "bg-accent/10 text-accent"
        }`}
      >
        <IconeAdmin nome={icone} className="size-6" />
      </span>
      <div className="min-w-0">
        <p className="text-muted font-mono text-xs tracking-wider uppercase">{rotulo}</p>
        <p className="truncate font-mono text-2xl font-semibold sm:text-3xl">{valor}</p>
      </div>
    </Card>
  );
}

function saudacao(): string {
  const hora = Number(new Intl.DateTimeFormat("pt-BR", { hour: "numeric", hour12: false, timeZone: "America/Sao_Paulo" }).format(new Date()));
  return hora < 12 ? "Bom dia" : hora < 18 ? "Boa tarde" : "Boa noite";
}

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

  const { data: destaques } = await supabase
    .from("destaques")
    .select("id, titulo, tipo, status, expira_em, destaque_interessados(count)")
    .eq("status", "publicado")
    .order("created_at", { ascending: false });
  const destaque = (destaques ?? []).find((d) => destaqueAtivo(d)) ?? null;

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-1">
        <p className="text-muted font-mono text-sm">{saudacao()},</p>
        <h1 className="text-4xl sm:text-5xl">
          {perfil.nome.split(" ")[0]} <span aria-hidden="true">👋</span>
        </h1>
      </header>

      {lote ? (
        <section aria-labelledby="lote" className="flex flex-col gap-4">
          <div className="bg-brand-soft border-accent/20 flex flex-wrap items-center justify-between gap-3 rounded-2xl border px-5 py-4">
            <div className="flex flex-wrap items-center gap-3">
              <h2 id="lote" className="text-2xl sm:text-3xl">{lote.nome}</h2>
              <Badge tom={lote.status === "aberto" ? "sucesso" : "neutro"}>{ROTULO_LOTE[lote.status] ?? lote.status}</Badge>
            </div>
            <span className="text-muted font-mono text-sm">Fecha em {formatarDataHora(lote.fecha_em)}</span>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <Kpi rotulo="Arrecadado" valor={formatarBRL(arrecadado)} icone="dinheiro" destaque />
            <Kpi rotulo="Pedidos pagos" valor={String(pagos.length)} icone="check" />
            <Kpi rotulo="Aguardando pagamento" valor={String(pendentes.length)} icone="relogio" />
          </div>
        </section>
      ) : (
        <Card>
          Nenhum lote criado ainda. <Link href="/admin/lotes/novo" className="text-accent underline">Criar lote</Link>
        </Card>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        <section aria-labelledby="evento">
          <Card className="flex h-full flex-col gap-3">
            <div className="flex items-center gap-2">
              <span className="bg-accent/10 text-accent flex size-9 items-center justify-center rounded-lg">
                <IconeAdmin nome="eventos" />
              </span>
              <h2 id="evento" className="text-xl">Próximo evento</h2>
            </div>
            {proximo ? (
              <div>
                <Link href="/admin/eventos" className="font-display hover:text-accent text-2xl font-bold">{proximo.titulo}</Link>
                <p className="text-muted font-mono text-sm">{formatarDataHora(proximo.inicio)} · {ROTULO_STATUS_EVENTO[proximo.status] ?? proximo.status}</p>
              </div>
            ) : (
              <p className="text-muted">Nenhum evento futuro cadastrado.</p>
            )}
          </Card>
        </section>

        <section aria-labelledby="destaque">
          <Card className="flex h-full flex-col gap-3">
            <div className="flex items-center gap-2">
              <span className="bg-accent/10 text-accent flex size-9 items-center justify-center rounded-lg">
                <IconeAdmin nome="destaques" />
              </span>
              <h2 id="destaque" className="text-xl">Destaque no ar</h2>
            </div>
            {destaque ? (
              <div>
                <Link href={`/admin/destaques/${destaque.id}`} className="font-display hover:text-accent text-2xl font-bold">{destaque.titulo}</Link>
                {destaque.tipo === "formulario" && (
                  <p className="text-muted font-mono text-sm">{destaque.destaque_interessados[0]?.count ?? 0} interessado(s)</p>
                )}
              </div>
            ) : (
              <p className="text-muted">
                Nada em destaque. <Link href="/admin/destaques/novo" className="text-accent underline">Anunciar algo</Link>
              </p>
            )}
          </Card>
        </section>
      </div>
    </div>
  );
}
