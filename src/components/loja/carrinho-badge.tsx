"use client";

import Link from "next/link";
import { useCarrinho } from "./use-carrinho";

export function CarrinhoBadge() {
  const { unidades, pronto } = useCarrinho();
  const qtd = pronto ? unidades : 0;

  return (
    <Link
      href="/checkout"
      className="border-border bg-surface text-fg hover:border-accent hover:text-accent relative inline-flex min-h-11 min-w-11 items-center justify-center rounded-full border shadow-sm"
    >
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M3 4h2l2.4 11h10.2L20 7H6.2M9 20h.01M17 20h.01"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span className="sr-only">
        Carrinho
        {qtd > 0 ? `, ${qtd} ${qtd === 1 ? "item" : "itens"}` : ", vazio"}
      </span>
      {qtd > 0 && (
        <span
          aria-hidden="true"
          className="bg-accent text-on-accent absolute -top-1.5 -right-1.5 flex min-w-5 items-center justify-center rounded-full px-1 font-mono text-xs font-bold"
        >
          {qtd}
        </span>
      )}
    </Link>
  );
}
