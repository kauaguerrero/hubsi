import { getCronEnv } from "@/lib/env.server";
import { cancelarCobranca } from "@/lib/asaas/client";
import { createAdminClient } from "@/lib/supabase/admin";
import { expirarPedidos, type RepoCron } from "@/server/cron/expirar-pedidos";
import { tokenValido } from "@/server/webhooks/asaas";

export const dynamic = "force-dynamic";

function criarRepo(): RepoCron {
  const admin = createAdminClient();
  return {
    async listarAguardando() {
      const { data, error } = await admin
        .from("pedidos")
        .select("id, asaas_payment_id, lotes(status, fecha_em)")
        .eq("status", "aguardando_pagamento");
      if (error) throw new Error("falha ao listar pedidos");
      return (data ?? []).flatMap((p) =>
        p.lotes
          ? [{ id: p.id, asaas_payment_id: p.asaas_payment_id, lote_status: p.lotes.status, lote_fecha_em: p.lotes.fecha_em }]
          : [],
      );
    },
    async marcarExpirado(id) {
      const { error } = await admin
        .from("pedidos")
        .update({ status: "expirado" })
        .eq("id", id)
        .eq("status", "aguardando_pagamento");
      if (error) throw new Error("falha ao expirar pedido");
    },
  };
}

export async function GET(req: Request) {
  let segredo: string;
  try {
    segredo = getCronEnv().CRON_SECRET;
  } catch {
    // Sem CRON_SECRET a rota fica fechada.
    return Response.json({ ok: false }, { status: 401 });
  }

  const recebido = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ?? null;
  if (!tokenValido(recebido, segredo)) return Response.json({ ok: false }, { status: 401 });

  try {
    const r = await expirarPedidos(criarRepo(), cancelarCobranca);
    return Response.json({ ok: true, ...r });
  } catch {
    return Response.json({ ok: false }, { status: 500 });
  }
}
