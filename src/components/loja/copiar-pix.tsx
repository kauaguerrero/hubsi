"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export function CopiarPix({ codigo }: { codigo: string }) {
  const [estado, setEstado] = useState<"idle" | "copiado" | "erro">("idle");

  async function copiar() {
    try {
      await navigator.clipboard.writeText(codigo);
      setEstado("copiado");
      setTimeout(() => setEstado("idle"), 3000);
    } catch {
      setEstado("erro");
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor="pix-copia-cola" className="text-sm font-medium">
        Pix copia e cola
      </label>
      <textarea
        id="pix-copia-cola"
        readOnly
        rows={3}
        value={codigo}
        onFocus={(e) => e.currentTarget.select()}
        className="w-full rounded-lg border border-border bg-surface-2 p-3 font-mono text-xs break-all"
      />
      <Button variante="secundario" onClick={copiar}>
        {estado === "copiado" ? "Copiado!" : "Copiar código Pix"}
      </Button>
      <p aria-live="polite" className="text-sm text-danger">
        {estado === "erro" ? "Não foi possível copiar. Selecione o texto e copie manualmente." : ""}
      </p>
    </div>
  );
}
