import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Json } from "@/types/database";
import type { WebhookRepo } from "./asaas";

export function criarWebhookRepo(): WebhookRepo {
  const admin = createAdminClient();

  return {
    async registrarEvento({ id, tipo, payload }) {
      const { error } = await admin
        .from("webhook_eventos")
        .insert({ id_evento_asaas: id, tipo, payload: payload as Json });
      if (!error) return true;
      if (error.code === "23505") return false; // unique_violation: já registrado
      throw new Error("falha ao registrar evento");
    },

    async removerEvento(id) {
      await admin.from("webhook_eventos").delete().eq("id_evento_asaas", id);
    },

    async registrarResultado(id, resultado) {
      await admin.from("webhook_eventos").update({ resultado }).eq("id_evento_asaas", id);
    },

    async buscarPedido(pedidoId) {
      const { data, error } = await admin.from("pedidos").select("id, status").eq("id", pedidoId).maybeSingle();
      if (error) throw new Error("falha ao buscar pedido");
      return data;
    },

    async atualizarPedido(pedidoId, statusEsperado, dados) {
      const { data, error } = await admin
        .from("pedidos")
        .update(dados)
        .eq("id", pedidoId)
        .eq("status", statusEsperado)
        .select("id");
      if (error) throw new Error("falha ao atualizar pedido");
      return (data?.length ?? 0) > 0;
    },
  };
}
