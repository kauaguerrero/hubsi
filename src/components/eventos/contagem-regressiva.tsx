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
    return <p className="text-accent font-mono">Está acontecendo agora!</p>;
  }

  return (
    <div
      role="timer"
      aria-label="Contagem regressiva para o evento"
      className="flex gap-3"
    >
      {partes.map(([rotulo, valor]) => (
        <div
          key={rotulo}
          className="border-border bg-surface shadow-card flex min-w-16 flex-col items-center rounded-2xl border px-3 py-2.5"
        >
          <span className="text-fg font-mono text-2xl font-bold tabular-nums">
            {valor === null ? "--" : String(valor).padStart(2, "0")}
          </span>
          <span className="text-muted font-mono text-xs">{rotulo}</span>
        </div>
      ))}
    </div>
  );
}
