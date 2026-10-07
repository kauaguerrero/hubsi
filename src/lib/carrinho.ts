export type ItemCarrinho = {
  produtoId: string;
  variacaoId: string | null;
  quantidade: number;
  // Dados só para exibição; o servidor recalcula tudo a partir do banco.
  loteId: string;
  slug: string;
  nome: string;
  variacaoRotulo: string | null;
  precoCentavos: number;
  foto: string | null;
};

export const MAX_POR_ITEM = 10;

function mesmaLinha(a: ItemCarrinho, b: Pick<ItemCarrinho, "produtoId" | "variacaoId">) {
  return a.produtoId === b.produtoId && a.variacaoId === b.variacaoId;
}

export type ResultadoCarrinho = { ok: true; itens: ItemCarrinho[] } | { ok: false; erro: string };

/** Adiciona ao carrinho. Só aceita itens de um único lote. */
export function adicionarItem(itens: ItemCarrinho[], novo: ItemCarrinho): ResultadoCarrinho {
  if (novo.quantidade < 1) return { ok: false, erro: "Quantidade inválida." };
  if (itens.length > 0 && itens.some((i) => i.loteId !== novo.loteId)) {
    return { ok: false, erro: "Seu carrinho tem itens de outro lote. Finalize ou esvazie o carrinho antes." };
  }
  const existente = itens.find((i) => mesmaLinha(i, novo));
  if (!existente) return { ok: true, itens: [...itens, { ...novo, quantidade: Math.min(novo.quantidade, MAX_POR_ITEM) }] };
  return {
    ok: true,
    itens: itens.map((i) =>
      i === existente ? { ...i, quantidade: Math.min(i.quantidade + novo.quantidade, MAX_POR_ITEM) } : i,
    ),
  };
}

export function removerItem(itens: ItemCarrinho[], alvo: Pick<ItemCarrinho, "produtoId" | "variacaoId">) {
  return itens.filter((i) => !mesmaLinha(i, alvo));
}

export function alterarQuantidade(
  itens: ItemCarrinho[],
  alvo: Pick<ItemCarrinho, "produtoId" | "variacaoId">,
  quantidade: number,
): ItemCarrinho[] {
  if (quantidade < 1) return removerItem(itens, alvo);
  return itens.map((i) => (mesmaLinha(i, alvo) ? { ...i, quantidade: Math.min(quantidade, MAX_POR_ITEM) } : i));
}

export function totalCentavos(itens: ItemCarrinho[]): number {
  return itens.reduce((soma, i) => soma + i.precoCentavos * i.quantidade, 0);
}

export function totalUnidades(itens: ItemCarrinho[]): number {
  return itens.reduce((soma, i) => soma + i.quantidade, 0);
}

/** Valida o que veio do sessionStorage (pode estar corrompido ou adulterado). */
export function lerCarrinhoSalvo(bruto: string | null): ItemCarrinho[] {
  if (!bruto) return [];
  try {
    const dados: unknown = JSON.parse(bruto);
    if (!Array.isArray(dados)) return [];
    return dados.filter(
      (i): i is ItemCarrinho =>
        !!i &&
        typeof i === "object" &&
        typeof i.produtoId === "string" &&
        typeof i.loteId === "string" &&
        typeof i.nome === "string" &&
        typeof i.slug === "string" &&
        typeof i.precoCentavos === "number" &&
        Number.isInteger(i.quantidade) &&
        i.quantidade >= 1,
    );
  } catch {
    return [];
  }
}
