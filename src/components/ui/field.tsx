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
export function Field({ id, label, erro, dica, className, children }: FieldProps) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label htmlFor={id} className="text-sm font-medium text-fg">
        {label}
      </label>
      {children}
      {dica && !erro && (
        <p id={`${id}-desc`} className="text-sm text-muted">
          {dica}
        </p>
      )}
      {erro && (
        <p id={`${id}-desc`} role="alert" className="text-sm text-danger">
          {erro}
        </p>
      )}
    </div>
  );
}

export const controleClass =
  "min-h-11 w-full rounded-lg border border-border bg-surface-2 px-3 py-2 text-base text-fg placeholder:text-muted/70 " +
  "focus:border-accent aria-[invalid=true]:border-danger disabled:opacity-50";

type ControleProps = { id: string; label: string; erro?: string; dica?: string };

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
      <input id={id} className={cn(controleClass, className)} {...descrito(id, erro, dica)} {...props} />
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
      <select id={id} className={cn(controleClass, className)} {...descrito(id, erro, dica)} {...props}>
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
}: { id: string; label: ReactNode; erro?: string } & Omit<ComponentProps<"input">, "id" | "type">) {
  return (
    <div className={cn("flex flex-col gap-1", className)}>
      <div className="flex items-start gap-3">
        <input
          id={id}
          type="checkbox"
          className="mt-1 size-5 shrink-0 accent-accent"
          {...descrito(id, erro)}
          {...props}
        />
        <label htmlFor={id} className="text-sm text-fg">
          {label}
        </label>
      </div>
      {erro && (
        <p id={`${id}-desc`} role="alert" className="text-sm text-danger">
          {erro}
        </p>
      )}
    </div>
  );
}
