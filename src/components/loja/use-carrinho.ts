"use client";

import { useSyncExternalStore } from "react";
import {
  adicionarItem,
  alterarQuantidade,
  removerItem,
  totalCentavos,
  totalUnidades,
  type ItemCarrinho,
  type ResultadoCarrinho,
} from "@/lib/carrinho";
import {
  definirItens,
  getServerSnapshot,
  getSnapshot,
  subscribe,
} from "@/lib/carrinho-store";

type Chave = Pick<ItemCarrinho, "produtoId" | "variacaoId">;

const semAssinatura = () => () => {};

export function useCarrinho() {
  const itens = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  // false no servidor/hidratação, true depois: evita "piscar" estado vazio errado.
  const pronto = useSyncExternalStore(
    semAssinatura,
    () => true,
    () => false,
  );

  return {
    itens,
    pronto,
    unidades: totalUnidades(itens),
    total: totalCentavos(itens),
    adicionar(item: ItemCarrinho): ResultadoCarrinho {
      const r = adicionarItem(getSnapshot(), item);
      if (r.ok) definirItens(r.itens);
      return r;
    },
    alterar: (alvo: Chave, quantidade: number) =>
      definirItens(alterarQuantidade(getSnapshot(), alvo, quantidade)),
    remover: (alvo: Chave) => definirItens(removerItem(getSnapshot(), alvo)),
    limpar: () => definirItens([]),
  };
}
