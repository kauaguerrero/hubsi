import { podeAcessar } from "@/lib/auth/permissoes";
import { getPerfil } from "@/lib/auth/roles";
import { celulaCSV } from "@/lib/pedidos/grafica";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function GET(_req: Request, { params }: RouteContext<"/admin/destaques/[id]/csv">) {
  const perfil = await getPerfil();
  if (!perfil || !podeAcessar(perfil.papel, "destaques")) return new Response("Acesso negado", { status: 403 });

  const { id } = await params;
  if (!UUID.test(id)) return new Response("Destaque inválido", { status: 400 });

  const supabase = await createClient();
  const [{ data: itens }, { data: pessoas }] = await Promise.all([
    supabase.from("destaque_itens").select("id, nome").eq("destaque_id", id),
    supabase
      .from("destaque_interessados")
      .select("nome, email, whatsapp, turma, observacao, contatado_em, created_at, interesses:destaque_interesses(item_id, quantidade, preco_centavos)")
      .eq("destaque_id", id)
      .order("created_at", { ascending: true }),
  ]);
  const nomeItem = new Map((itens ?? []).map((i) => [i.id, i.nome]));

  const linhas = [["Nome", "E-mail", "WhatsApp", "Turma", "Itens", "Valor esperado (R$)", "Observação", "Contatado", "Registrado em"]];
  for (const p of pessoas ?? []) {
    const valor = p.interesses.reduce((s, i) => s + i.quantidade * i.preco_centavos, 0);
    linhas.push([
      p.nome,
      p.email,
      p.whatsapp,
      p.turma ?? "",
      p.interesses.map((i) => `${i.quantidade}x ${nomeItem.get(i.item_id) ?? "item removido"}`).join(" | "),
      (valor / 100).toFixed(2).replace(".", ","),
      p.observacao ?? "",
      p.contatado_em ? "sim" : "não",
      p.created_at,
    ]);
  }

  return new Response("﻿" + linhas.map((l) => l.map(celulaCSV).join(";")).join("\r\n") + "\r\n", {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="interessados.csv"',
      "Cache-Control": "no-store",
    },
  });
}
