import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

export function Card({ className, ...props }: ComponentProps<"div">) {
  return <div className={cn("rounded-xl border border-border bg-surface p-4 sm:p-6", className)} {...props} />;
}

type TomBadge = "neutro" | "acento" | "sucesso" | "perigo";

const tons: Record<TomBadge, string> = {
  neutro: "border-border text-muted",
  acento: "border-accent text-accent",
  sucesso: "border-success text-success",
  perigo: "border-danger text-danger",
};

export function Badge({ tom = "neutro", className, ...props }: { tom?: TomBadge } & ComponentProps<"span">) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 font-mono text-xs font-medium",
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
      className={cn("animate-pulse rounded-lg bg-surface motion-reduce:animate-none", className)}
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
        "flex flex-col items-center gap-3 rounded-xl border border-dashed border-border px-6 py-12 text-center",
        className,
      )}
    >
      <p className="font-display text-2xl font-bold">{titulo}</p>
      {descricao && <p className="max-w-md text-muted">{descricao}</p>}
      {acao}
    </div>
  );
}
