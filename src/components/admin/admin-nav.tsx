"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils/cn";
import { IconeAdmin } from "./icones";

type Item = { href: string; rotulo: string; grupo: string; icone: string };

export function AdminNav({ itens }: { itens: Item[] }) {
  const pathname = usePathname();
  const ativo = (href: string) => (href === "/admin" ? pathname === "/admin" : pathname.startsWith(href));

  const grupos = itens.reduce<{ nome: string; itens: Item[] }[]>((acc, i) => {
    const g = acc.find((x) => x.nome === i.grupo);
    if (g) g.itens.push(i);
    else acc.push({ nome: i.grupo, itens: [i] });
    return acc;
  }, []);

  return (
    <>
      {/* Desktop: seções com título */}
      <nav aria-label="Painel" className="hidden flex-1 flex-col gap-6 overflow-y-auto md:flex">
        {grupos.map((g) => (
          <div key={g.nome} className="flex flex-col gap-1.5">
            <p className="text-muted px-3 font-mono text-[11px] font-medium tracking-widest uppercase">{g.nome}</p>
            <ul className="flex flex-col gap-0.5">
              {g.itens.map((i) => (
                <li key={i.href}>
                  <Link
                    href={i.href}
                    aria-current={ativo(i.href) ? "page" : undefined}
                    className={cn(
                      "flex min-h-10 items-center gap-3 rounded-xl px-3 text-[15px] font-medium transition-colors",
                      ativo(i.href)
                        ? "bg-brand text-on-accent shadow-card"
                        : "text-muted hover:bg-accent/10 hover:text-accent",
                    )}
                  >
                    <IconeAdmin nome={i.icone} />
                    {i.rotulo}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      {/* Mobile: barra inferior rolável, com ícone acima do rótulo */}
      <nav
        aria-label="Painel"
        className="border-border bg-surface/95 fixed inset-x-0 bottom-0 z-40 border-t backdrop-blur md:hidden"
      >
        <ul className="flex gap-1 overflow-x-auto px-2 py-1.5">
          {itens.map((i) => (
            <li key={i.href} className="shrink-0">
              <Link
                href={i.href}
                aria-current={ativo(i.href) ? "page" : undefined}
                className={cn(
                  "flex min-h-14 min-w-16 flex-col items-center justify-center gap-0.5 rounded-xl px-2 text-[11px] font-semibold",
                  ativo(i.href) ? "bg-brand text-on-accent" : "text-muted",
                )}
              >
                <IconeAdmin nome={i.icone} className="size-5" />
                {i.rotulo}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </>
  );
}
