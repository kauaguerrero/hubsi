"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/field";
import { enviarLinkLogin } from "@/server/actions/auth";
import type { EstadoForm } from "@/server/actions/pedidos";

export function LoginForm() {
  const [estado, formAction, pendente] = useActionState<EstadoForm, FormData>(
    enviarLinkLogin,
    {},
  );
  const mensagem = estado.ok;

  return (
    <form
      action={formAction}
      className="flex flex-col gap-5"
      aria-busy={pendente}
    >
      <Input
        id="email"
        name="email"
        type="email"
        label="E-mail"
        autoComplete="email"
        required
      />
      {estado.erro && (
        <p
          role="alert"
          className="border-danger text-danger rounded-lg border px-4 py-3"
        >
          {estado.erro}
        </p>
      )}
      {mensagem && (
        <p
          role="status"
          className="border-accent text-accent rounded-lg border px-4 py-3"
        >
          {mensagem}
        </p>
      )}
      <Button type="submit" tamanho="lg" disabled={pendente}>
        {pendente ? "Enviando…" : "Enviar link de acesso"}
      </Button>
    </form>
  );
}
