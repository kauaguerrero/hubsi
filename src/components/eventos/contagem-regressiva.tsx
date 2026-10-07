"use client";

import { useEffect, useState } from "react";

function restante(alvo: number, agora: number) {
  const total = Math.max(0, alvo - agora);
  return {
    total,
    dias: Math.floor(total / 86_400_000),
    horas: Math.floor((total % 86_400_000) / 3_600_000),
    minutos: Math.floor((total % 3_600_000) / 60_000),
    segundos: Math.floor((total % 60_000) / 1000),
  };
}

export function ContagemRegressiva({ alvo }: { alvo: string }) {
  const [agora, setAgora] = useState<number | null>(null);

  useEffect(() => {
    const tick = () => setAgora(Date.now());
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const t = agora === null ? null : restante(new Date(alvo).getTime(), agora);
  const partes: [string, number | null][] = [
    ["dias", t?.dias ?? null],
    ["horas", t?.horas ?? null],
    ["min", t?.minutos ?? null],
    ["seg", t?.segundos ?? null],
  ];

  if (t && t.total === 0) {
    return <p className="font-mono text-accent">Está acontecendo agora!</p>;
  }

  return (
    <div role="timer" aria-label="Contagem regressiva para o evento" className="flex gap-3">
      {partes.map(([rotulo, valor]) => (
        <div key={rotulo} className="flex min-w-14 flex-col items-center rounded-lg border border-border bg-surface-2 px-2 py-2">
          <span className="font-mono text-2xl font-bold tabular-nums text-fg">
            {valor === null ? "--" : String(valor).padStart(2, "0")}
          </span>
          <span className="font-mono text-xs text-muted">{rotulo}</span>
        </div>
      ))}
    </div>
  );
}
