"use client";

import { useState } from "react";
import { cn } from "@/lib/utils/cn";
import { ProdutoCard } from "./produto-card";

type ProdutoLista = {
  id: string;
  slug: string;
  nome: string;
  preco_centavos: number;
  categoria: string;
  foto: string | null;
};

export function Catalogo({ produtos }: { produtos: ProdutoLista[] }) {
  const [categoria, setCategoria] = useState<string | null>(null);
  const categorias = [...new Set(produtos.map((p) => p.categoria))];
  const visiveis = categoria
    ? produtos.filter((p) => p.categoria === categoria)
    : produtos;

  return (
    <div className="flex flex-col gap-6">
      {categorias.length > 1 && (
        <div
          role="group"
          aria-label="Filtrar por categoria"
          className="flex flex-wrap gap-2"
        >
          {[null, ...categorias].map((c) => (
            <button
              key={c ?? "todos"}
              type="button"
              aria-pressed={categoria === c}
              onClick={() => setCategoria(c)}
              className={cn(
                "min-h-11 rounded-full border px-4 font-mono text-sm capitalize",
                categoria === c
                  ? "bg-brand text-on-accent border-transparent"
                  : "border-border text-fg hover:border-accent",
              )}
            >
              {c ?? "Todos"}
            </button>
          ))}
        </div>
      )}
      <ul className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        {visiveis.map((p) => (
          <li key={p.id}>
            <ProdutoCard
              slug={p.slug}
              nome={p.nome}
              precoCentavos={p.preco_centavos}
              foto={p.foto}
              categoria={p.categoria}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}
