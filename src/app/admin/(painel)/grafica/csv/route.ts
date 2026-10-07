import { getPerfil } from "@/lib/auth/roles";
import { podeAcessar } from "@/lib/auth/permissoes";
import { gerarCSVGrafica } from "@/lib/pedidos/grafica";
import { createClient } from "@/lib/supabase/server";
import { buscarResumoGrafica } from "@/server/queries/grafica";

export const dynamic = "force-dynamic";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function GET(req: Request) {
  const perfil = await getPerfil();
  if (!perfil || !podeAcessar(perfil.papel, "grafica")) return new Response("Acesso negado", { status: 403 });

  const lote = new URL(req.url).searchParams.get("lote") ?? "";
  if (!UUID.test(lote)) return new Response("Lote inválido", { status: 400 });

  const linhas = await buscarResumoGrafica(await createClient(), lote);
  return new Response(gerarCSVGrafica(linhas), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="resumo-grafica.csv"',
      "Cache-Control": "no-store",
    },
  });
}
