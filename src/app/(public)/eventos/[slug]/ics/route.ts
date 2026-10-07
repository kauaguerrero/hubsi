import { gerarICS } from "@/lib/utils/calendario";
import { getEventoPorSlug } from "@/server/queries/eventos";

export async function GET(_req: Request, ctx: RouteContext<"/eventos/[slug]/ics">) {
  const { slug } = await ctx.params;
  const evento = await getEventoPorSlug(slug);
  if (!evento || evento.status === "cancelado") {
    return new Response("Evento não encontrado", { status: 404 });
  }

  return new Response(gerarICS(evento), {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename="${evento.slug}.ics"`,
      "Cache-Control": "public, max-age=300",
    },
  });
}
