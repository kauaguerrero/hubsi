export type LoteParaPedido = {
  id: string;
  status: "aberto" | "fechado" | "em_producao" | "entregue";
  abre_em: string;
  fecha_em: string;
  limite_unidades: number | null;
};

export type ProdutoParaPedido = {
  id: string;
  lote_id: string;
  nome: string;
  preco_centavos: number;
  ativo: boolean;
  /** Apenas variações ativas. */
  variacoes: { id: string }[];
};

export type ItemEntrada = { produtoId: string; variacaoId?: string | null; quantidade: number };

export type ItemCalculado = {
  produtoId: string;
  variacaoId: string | null;
  quantidade: number;
  precoUnitario: number;
};

export type ResultadoCalculo =
  | { ok: true; itens: ItemCalculado[]; total: number; unidades: number }
  | { ok: false; erro: string };

export const MAX_UNIDADES_POR_PEDIDO = 20;

export function loteAceitaPedidos(lote: LoteParaPedido, agora = new Date()): boolean {
  return lote.status === "aberto" && new Date(lote.abre_em) <= agora && new Date(lote.fecha_em) > agora;
}

/**
 * Monta os itens do pedido usando SEMPRE os preços do banco. Qualquer preço vindo
 * do navegador é ignorado: a entrada nem tem esse campo.
 */
export function montarPedido(params: {
  itens: ItemEntrada[];
  produtos: ProdutoParaPedido[];
  lote: LoteParaPedido;
  unidadesJaVendidas: number;
  agora?: Date;
}): ResultadoCalculo {
  const { itens, produtos, lote, unidadesJaVendidas, agora = new Date() } = params;

  if (!loteAceitaPedidos(lote, agora)) return { ok: false, erro: "Este lote não está aberto para pedidos." };

  const porId = new Map(produtos.map((p) => [p.id, p]));
  const linhas = new Map<string, ItemCalculado>();

  for (const item of itens) {
    const produto = porId.get(item.produtoId);
    if (!produto || !produto.ativo) return { ok: false, erro: "Um dos produtos não está mais disponível." };
    if (produto.lote_id !== lote.id) return { ok: false, erro: "O carrinho mistura produtos de lotes diferentes." };
    if (!Number.isInteger(item.quantidade) || item.quantidade < 1) return { ok: false, erro: "Quantidade inválida." };

    const variacaoId = item.variacaoId ?? null;
    if (produto.variacoes.length > 0) {
      if (!variacaoId || !produto.variacoes.some((v) => v.id === variacaoId)) {
        return { ok: false, erro: `Selecione uma variação válida para ${produto.nome}.` };
      }
    } else if (variacaoId) {
      return { ok: false, erro: `${produto.nome} não possui variações.` };
    }

    const chave = `${produto.id}:${variacaoId ?? ""}`;
    const atual = linhas.get(chave);
    linhas.set(chave, {
      produtoId: produto.id,
      variacaoId,
      quantidade: (atual?.quantidade ?? 0) + item.quantidade,
      precoUnitario: produto.preco_centavos,
    });
  }

  const resultado = [...linhas.values()];
  if (resultado.length === 0) return { ok: false, erro: "Carrinho vazio." };

  const unidades = resultado.reduce((s, i) => s + i.quantidade, 0);
  if (unidades > MAX_UNIDADES_POR_PEDIDO) {
    return { ok: false, erro: `Máximo de ${MAX_UNIDADES_POR_PEDIDO} unidades por pedido.` };
  }
  if (lote.limite_unidades !== null && unidadesJaVendidas + unidades > lote.limite_unidades) {
    return { ok: false, erro: "As unidades deste lote estão esgotadas ou não são suficientes para o seu pedido." };
  }

  const total = resultado.reduce((s, i) => s + i.precoUnitario * i.quantidade, 0);
  return { ok: true, itens: resultado, total, unidades };
}
