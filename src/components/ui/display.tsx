import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

export function Card({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "border-border bg-surface shadow-card rounded-2xl border p-4 sm:p-6",
        className,
      )}
      {...props}
    />
  );
}

type TomBadge = "neutro" | "acento" | "sucesso" | "perigo";

const tons: Record<TomBadge, string> = {
  neutro: "border-border bg-surface-2 text-muted",
  acento: "border-accent/25 bg-accent/10 text-accent",
  sucesso: "border-success/25 bg-success/10 text-success",
  perigo: "border-danger/25 bg-danger/10 text-danger",
};

export function Badge({
  tom = "neutro",
  className,
  ...props
}: { tom?: TomBadge } & ComponentProps<"span">) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-3 py-0.5 font-mono text-xs font-medium",
        tons[tom],
        className,
      )}
      {...props}
    />
  );
}

export function Skeleton({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "bg-surface-2 animate-pulse rounded-lg motion-reduce:animate-none",
        className,
      )}
      {...props}
    />
  );
}

export function EmptyState({
  titulo,
  descricao,
  acao,
  className,
}: {
  titulo: string;
  descricao?: string;
  acao?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "border-border-strong bg-surface/60 flex flex-col items-center gap-3 rounded-2xl border border-dashed px-6 py-12 text-center",
        className,
      )}
    >
      <p className="font-display text-2xl font-bold">{titulo}</p>
      {descricao && <p className="text-muted max-w-md">{descricao}</p>}
      {acao}
    </div>
  );
}
