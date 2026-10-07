"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils/cn";

type Item = { href: string; rotulo: string };

export function AdminNav({ itens }: { itens: Item[] }) {
  const pathname = usePathname();
  const ativo = (href: string) =>
    href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);

  return (
    <nav
      aria-label="Painel"
      className="border-border bg-surface/95 fixed inset-x-0 bottom-0 z-40 border-t backdrop-blur md:static md:border-0 md:bg-transparent"
    >
      <ul className="flex gap-1 overflow-x-auto px-2 py-2 md:flex-col md:overflow-visible md:p-0">
        {itens.map((i) => (
          <li key={i.href} className="shrink-0">
            <Link
              href={i.href}
              aria-current={ativo(i.href) ? "page" : undefined}
              className={cn(
                "flex min-h-11 items-center rounded-full px-4 text-base font-semibold whitespace-nowrap",
                ativo(i.href)
                  ? "bg-brand text-on-accent"
                  : "text-muted hover:bg-accent/10 hover:text-accent",
              )}
            >
              {i.rotulo}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
