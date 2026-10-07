"use client";

import { useState, useTransition, type FormEvent, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import type { EstadoForm } from "@/server/actions/pedidos";

type Props = {
  action: (fd: FormData) => Promise<EstadoForm | void>;
  children: ReactNode;
  rotulo?: string;
  className?: string;
  /** Limpa os campos após salvar com sucesso (útil em formulários de "adicionar"). */
  limparAoSalvar?: boolean;
};

/**
 * Formulário que chama uma server action manualmente (sem `action=` do form), para
 * NÃO resetar os campos quando há erro de validação.
 */
export function FormAcao({
  action,
  children,
  rotulo = "Salvar",
  className,
  limparAoSalvar,
}: Props) {
  const [estado, setEstado] = useState<EstadoForm>({});
  const [pendente, iniciar] = useTransition();

  function aoEnviar(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const dados = new FormData(form);
    iniciar(async () => {
      const r = await action(dados);
      setEstado(r ?? { ok: "Salvo." });
      if (limparAoSalvar && !r?.erro) form.reset();
    });
  }

  return (
    <form
      onSubmit={aoEnviar}
      className={className ?? "flex flex-col gap-4"}
      aria-busy={pendente}
    >
      {children}
      {estado.erro && (
        <p
          role="alert"
          className="border-danger text-danger rounded-lg border px-4 py-3"
        >
          {estado.erro}
        </p>
      )}
      {estado.ok && !estado.erro && (
        <p role="status" className="text-success">
          {estado.ok}
        </p>
      )}
      <div>
        <Button type="submit" disabled={pendente}>
          {pendente ? "Salvando…" : rotulo}
        </Button>
      </div>
    </form>
  );
}
