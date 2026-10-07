import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

type FieldProps = {
  id: string;
  label: string;
  erro?: string;
  dica?: string;
  className?: string;
  children: ReactNode;
};

/** Label + controle + dica/erro, ligados por `aria-describedby`. */
export function Field({
  id,
  label,
  erro,
  dica,
  className,
  children,
}: FieldProps) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label htmlFor={id} className="text-fg text-sm font-medium">
        {label}
      </label>
      {children}
      {dica && !erro && (
        <p id={`${id}-desc`} className="text-muted text-sm">
          {dica}
        </p>
      )}
      {erro && (
        <p id={`${id}-desc`} role="alert" className="text-danger text-sm">
          {erro}
        </p>
      )}
    </div>
  );
}

export const controleClass =
  "min-h-11 w-full rounded-xl border border-border-strong bg-surface px-3.5 py-2 text-base text-fg shadow-sm placeholder:text-muted/70 " +
  "transition-shadow focus:border-accent focus:ring-4 focus:ring-accent/15 aria-[invalid=true]:border-danger disabled:opacity-50";

type ControleProps = {
  id: string;
  label: string;
  erro?: string;
  dica?: string;
};

function descrito(id: string, erro?: string, dica?: string) {
  return {
    "aria-invalid": erro ? true : undefined,
    "aria-describedby": erro || dica ? `${id}-desc` : undefined,
  } as const;
}

export function Input({
  id,
  label,
  erro,
  dica,
  className,
  ...props
}: ControleProps & Omit<ComponentProps<"input">, "id">) {
  return (
    <Field id={id} label={label} erro={erro} dica={dica}>
      <input
        id={id}
        className={cn(controleClass, className)}
        {...descrito(id, erro, dica)}
        {...props}
      />
    </Field>
  );
}

export function Textarea({
  id,
  label,
  erro,
  dica,
  className,
  ...props
}: ControleProps & Omit<ComponentProps<"textarea">, "id">) {
  return (
    <Field id={id} label={label} erro={erro} dica={dica}>
      <textarea
        id={id}
        rows={4}
        className={cn(controleClass, className)}
        {...descrito(id, erro, dica)}
        {...props}
      />
    </Field>
  );
}

export function Select({
  id,
  label,
  erro,
  dica,
  className,
  children,
  ...props
}: ControleProps & Omit<ComponentProps<"select">, "id">) {
  return (
    <Field id={id} label={label} erro={erro} dica={dica}>
      <select
        id={id}
        className={cn(controleClass, className)}
        {...descrito(id, erro, dica)}
        {...props}
      >
        {children}
      </select>
    </Field>
  );
}

export function Checkbox({
  id,
  label,
  erro,
  className,
  ...props
}: { id: string; label: ReactNode; erro?: string } & Omit<
  ComponentProps<"input">,
  "id" | "type"
>) {
  return (
    <div className={cn("flex flex-col gap-1", className)}>
      <div className="flex items-start gap-3">
        <input
          id={id}
          type="checkbox"
          className="accent-accent mt-1 size-5 shrink-0"
          {...descrito(id, erro)}
          {...props}
        />
        <label htmlFor={id} className="text-fg text-sm">
          {label}
        </label>
      </div>
      {erro && (
        <p id={`${id}-desc`} role="alert" className="text-danger text-sm">
          {erro}
        </p>
      )}
    </div>
  );
}
