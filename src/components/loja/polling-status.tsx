"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

const INTERVALO_MS = 5_000;
const DURACAO_MAX_MS = 10 * 60_000;

/** Consulta o status a cada 5 s por até 10 min e recarrega a página quando mudar. */
export function PollingStatus({
  codigo,
  statusAtual,
}: {
  codigo: string;
  statusAtual: string;
}) {
  const router = useRouter();

  useEffect(() => {
    const inicio = Date.now();
    const id = setInterval(async () => {
      if (Date.now() - inicio > DURACAO_MAX_MS) {
        clearInterval(id);
        return;
      }
      try {
        const r = await fetch(
          `/api/pedidos/${encodeURIComponent(codigo)}/status`,
          { cache: "no-store" },
        );
        if (!r.ok) return;
        const { status } = (await r.json()) as { status: string | null };
        if (status && status !== statusAtual) {
          clearInterval(id);
          router.refresh();
        }
      } catch {
        // falha de rede: tenta de novo no próximo ciclo
      }
    }, INTERVALO_MS);
    return () => clearInterval(id);
  }, [codigo, statusAtual, router]);

  return null;
}
