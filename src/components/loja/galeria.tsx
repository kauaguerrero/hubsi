"use client";

import Image from "next/image";
import { useState } from "react";
import { cn } from "@/lib/utils/cn";

export function Galeria({ fotos, nome }: { fotos: string[]; nome: string }) {
  const [atual, setAtual] = useState(0);

  if (fotos.length === 0) {
    return (
      <div className="bg-brand-soft border-border flex aspect-square items-center justify-center rounded-2xl border">
        <Image
          src="/logo-si.png"
          alt=""
          width={160}
          height={160}
          className="size-32 rounded-full opacity-80 shadow-sm"
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="border-border bg-surface-2 shadow-card relative aspect-square overflow-hidden rounded-2xl border">
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
                  "relative size-16 overflow-hidden rounded-xl border-2 transition-colors",
                  i === atual
                    ? "border-accent"
                    : "border-border hover:border-accent/50",
                )}
              >
                <Image
                  src={f}
                  alt=""
                  fill
                  sizes="64px"
                  className="object-cover"
                />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
