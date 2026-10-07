"use client";

import Link from "next/link";
import { useEffect, useId, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils/cn";
import { NAV_LINKS } from "./nav-links";

export function MenuMobile({ selo }: { selo?: ReactNode }) {
  const [aberto, setAberto] = useState(false);
  const painelId = useId();

  useEffect(() => {
    if (!aberto) return;
    const aoTeclar = (e: KeyboardEvent) =>
      e.key === "Escape" && setAberto(false);
    document.addEventListener("keydown", aoTeclar);
    return () => document.removeEventListener("keydown", aoTeclar);
  }, [aberto]);

  return (
    <div className="md:hidden">
      <button
        type="button"
        aria-expanded={aberto}
        aria-controls={painelId}
        onClick={() => setAberto((v) => !v)}
        className="border-border bg-surface text-fg inline-flex min-h-11 min-w-11 items-center justify-center rounded-full border"
      >
        <span className="sr-only">{aberto ? "Fechar menu" : "Abrir menu"}</span>
        <svg
          width="22"
          height="22"
          viewBox="0 0 22 22"
          fill="none"
          aria-hidden="true"
        >
          {aberto ? (
            <path
              d="M5 5l12 12M17 5L5 17"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          ) : (
            <path
              d="M4 7h14M4 11h14M4 15h14"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          )}
        </svg>
      </button>

      <div
        id={painelId}
        hidden={!aberto}
        className={cn(
          "border-border bg-surface absolute inset-x-0 top-full border-b px-4 pt-2 pb-6 shadow-lg",
        )}
      >
        <nav aria-label="Principal">
          <ul className="flex flex-col">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={() => setAberto(false)}
                  className="font-display border-border/50 flex min-h-12 items-center border-b text-2xl font-bold"
                >
                  {link.rotulo}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        {selo && <div className="mt-4">{selo}</div>}
      </div>
    </div>
  );
}
