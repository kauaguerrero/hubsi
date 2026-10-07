"use client";

import { useEffect } from "react";
import { useCarrinho } from "./use-carrinho";

/** Esvazia o carrinho depois que o pedido foi criado. */
export function LimparCarrinho() {
  const { limpar, pronto } = useCarrinho();
  useEffect(() => {
    if (pronto) limpar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pronto]);
  return null;
}
