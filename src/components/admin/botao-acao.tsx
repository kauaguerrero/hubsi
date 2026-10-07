"use client";

import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";

type Props = {
  action: () => Promise<void>;
  children: ReactNode;
  confirmar?: string;
  variante?: "primario" | "secundario" | "ghost";
  tamanho?: "md" | "lg";
  className?: string;
};

/** Botão de ação simples (um clique) com confirmação opcional. */
export function BotaoAcao({
  action,
  children,
  confirmar,
  variante = "secundario",
  tamanho,
  className,
}: Props) {
  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (confirmar && !window.confirm(confirmar)) e.preventDefault();
      }}
    >
      <Button
        type="submit"
        variante={variante}
        tamanho={tamanho}
        className={className}
      >
        {children}
      </Button>
    </form>
  );
}
