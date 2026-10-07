import { codigoPedidoValido, normalizarCodigoPedido } from "@/lib/utils/codigo-pedido";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

/** Só o status: usado pelo polling da página do pedido. */
export async function GET(_req: Request, ctx: RouteContext<"/api/pedidos/[codigo]/status">) {
  const { codigo: bruto } = await ctx.params;
  const codigo = normalizarCodigoPedido(bruto);
  if (!codigoPedidoValido(codigo)) return Response.json({ status: null }, { status: 404 });

  const { data } = await createAdminClient().from("pedidos").select("status").eq("codigo", codigo).maybeSingle();
  if (!data) return Response.json({ status: null }, { status: 404 });

  return Response.json({ status: data.status }, { headers: { "Cache-Control": "no-store" } });
}
