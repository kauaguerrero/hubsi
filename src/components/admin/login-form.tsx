"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/field";
import { entrarComSenha } from "@/server/actions/auth";
import type { EstadoForm } from "@/server/actions/pedidos";

export function LoginForm() {
  const [estado, formAction, pendente] = useActionState<EstadoForm, FormData>(
    entrarComSenha,
    {},
  );

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
      <Input
        id="senha"
        name="senha"
        type="password"
        label="Senha"
        autoComplete="current-password"
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
      <Button type="submit" tamanho="lg" disabled={pendente}>
        {pendente ? "Entrando…" : "Entrar"}
      </Button>
    </form>
  );
}
