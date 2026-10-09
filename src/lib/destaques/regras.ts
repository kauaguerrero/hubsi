export type TipoDestaque = "save_the_date" | "formulario" | "link";

export const ROTULO_TIPO: Record<TipoDestaque, string> = {
  save_the_date: "Save the date",
  formulario: "Formulário de interesse",
  link: "Link externo",
};

const CTA_PADRAO: Record<TipoDestaque, string> = {
  save_the_date: "Ver detalhes",
  formulario: "Quero participar",
  link: "Saiba mais",
};

export function ctaDoDestaque(d: { tipo: TipoDestaque; cta_texto: string | null }): string {
  return d.cta_texto?.trim() || CTA_PADRAO[d.tipo];
}

/** Ativo = publicado e ainda não expirado. */
export function destaqueAtivo(
  d: { status: string; expira_em: string | null },
  agora = new Date(),
): boolean {
  return d.status === "publicado" && (!d.expira_em || new Date(d.expira_em) > agora);
}

export type InteressadoKpi = {
  contatado_em: string | null;
  itens: { item_id: string; quantidade: number; preco_centavos: number }[];
};

export type ResumoItem = { itemId: string; interessados: number; unidades: number; valorCentavos: number };

/** Totais do destaque: pessoas, unidades, valor esperado e demanda por item. */
export function calcularKpis(interessados: InteressadoKpi[]) {
  const porItem = new Map<string, ResumoItem>();
  let unidades = 0;
  let valorCentavos = 0;
  for (const i of interessados) {
    for (const it of i.itens) {
      const valor = it.quantidade * it.preco_centavos;
      unidades += it.quantidade;
      valorCentavos += valor;
      const r = porItem.get(it.item_id) ?? { itemId: it.item_id, interessados: 0, unidades: 0, valorCentavos: 0 };
      r.interessados += 1;
      r.unidades += it.quantidade;
      r.valorCentavos += valor;
      porItem.set(it.item_id, r);
    }
  }
  const total = interessados.length;
  const contatados = interessados.filter((i) => i.contatado_em).length;
  return {
    total,
    contatados,
    pendentes: total - contatados,
    unidades,
    valorCentavos,
    ticketMedioCentavos: total ? Math.round(valorCentavos / total) : 0,
    porItem: [...porItem.values()],
  };
}
