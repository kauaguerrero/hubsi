import Link from "next/link";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils/cn";

type Variante = "primario" | "secundario" | "ghost";
type Tamanho = "md" | "lg";

export function buttonClass(variante: Variante = "primario", tamanho: Tamanho = "md", extra?: string) {
  return cn(
    "inline-flex items-center justify-center gap-2 rounded-lg font-sans font-semibold transition-colors",
    "disabled:pointer-events-none disabled:opacity-50",
    tamanho === "md" ? "min-h-11 px-4 text-base" : "min-h-12 px-6 text-lg",
    variante === "primario" && "bg-accent text-bg hover:brightness-110",
    variante === "secundario" && "border border-border bg-surface text-fg hover:border-accent",
    variante === "ghost" && "text-fg hover:bg-surface",
    extra,
  );
}

type BaseProps = { variante?: Variante; tamanho?: Tamanho };

export function Button({
  variante,
  tamanho,
  className,
  type = "button",
  ...props
}: BaseProps & ComponentProps<"button">) {
  return <button type={type} className={buttonClass(variante, tamanho, className)} {...props} />;
}

export function ButtonLink({
  variante,
  tamanho,
  className,
  ...props
}: BaseProps & ComponentProps<typeof Link>) {
  return <Link className={buttonClass(variante, tamanho, className)} {...props} />;
}
