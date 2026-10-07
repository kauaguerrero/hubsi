"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/field";
import { consultarPedido, type EstadoForm } from "@/server/actions/pedidos";

export function ConsultaPedidoForm() {
  const [estado, formAction, pendente] = useActionState<EstadoForm, FormData>(consultarPedido, {});

  return (
    <form action={formAction} className="flex max-w-md flex-col gap-5" aria-busy={pendente}>
      <Input id="email" name="email" type="email" label="E-mail usado no pedido" autoComplete="email" required />
      <Input
        id="codigo"
        name="codigo"
        label="Código do pedido"
        placeholder="HSI-XXXXXX"
        autoCapitalize="characters"
        autoComplete="off"
        required
        className="font-mono uppercase"
      />
      {estado.erro && (
        <p role="alert" className="rounded-lg border border-danger px-4 py-3 text-danger">
          {estado.erro}
        </p>
      )}
      <Button type="submit" tamanho="lg" disabled={pendente}>
        {pendente ? "Buscando…" : "Consultar pedido"}
      </Button>
    </form>
  );
}
