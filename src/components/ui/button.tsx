import Link from "next/link";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils/cn";

type Variante = "primario" | "secundario" | "ghost";
type Tamanho = "md" | "lg";

export function buttonClass(
  variante: Variante = "primario",
  tamanho: Tamanho = "md",
  extra?: string,
) {
  return cn(
    "inline-flex items-center justify-center gap-2 rounded-full font-sans font-semibold transition-all duration-200",
    "disabled:pointer-events-none disabled:opacity-50",
    tamanho === "md" ? "min-h-11 px-5 text-base" : "min-h-12 px-7 text-lg",
    variante === "primario" &&
      "bg-brand text-on-accent shadow-card hover:-translate-y-0.5 hover:shadow-pop active:translate-y-0",
    variante === "secundario" &&
      "border border-border bg-surface text-fg shadow-sm hover:-translate-y-0.5 hover:border-accent hover:text-accent hover:shadow-card",
    variante === "ghost" && "text-fg hover:bg-surface-2",
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
  return (
    <button
      type={type}
      className={buttonClass(variante, tamanho, className)}
      {...props}
    />
  );
}

export function ButtonLink({
  variante,
  tamanho,
  className,
  ...props
}: BaseProps & ComponentProps<typeof Link>) {
  return (
    <Link className={buttonClass(variante, tamanho, className)} {...props} />
  );
}
