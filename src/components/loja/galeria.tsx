"use client";

import Image from "next/image";
import { useState } from "react";
import { cn } from "@/lib/utils/cn";

export function Galeria({ fotos, nome }: { fotos: string[]; nome: string }) {
  const [atual, setAtual] = useState(0);

  if (fotos.length === 0) {
    return (
      <div className="flex aspect-square items-center justify-center rounded-xl border border-border bg-surface-2 font-mono text-sm text-muted">
        sem foto
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="relative aspect-square overflow-hidden rounded-xl border border-border bg-surface-2">
        <Image
          src={fotos[atual] ?? fotos[0]!}
          alt={`${nome} — foto ${atual + 1} de ${fotos.length}`}
          fill
          sizes="(min-width: 1024px) 50vw, 100vw"
          className="object-cover"
          priority
        />
      </div>
      {fotos.length > 1 && (
        <ul className="flex gap-2 overflow-x-auto">
          {fotos.map((f, i) => (
            <li key={f} className="shrink-0">
              <button
                type="button"
                onClick={() => setAtual(i)}
                aria-label={`Ver foto ${i + 1}`}
                aria-current={i === atual}
                className={cn(
                  "relative size-16 overflow-hidden rounded-lg border-2",
                  i === atual ? "border-accent" : "border-border",
                )}
              >
                <Image src={f} alt="" fill sizes="64px" className="object-cover" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
