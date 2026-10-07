"use client";

import Image from "next/image";
import Link from "next/link";
import { useActionState, useState, type FormEvent } from "react";
import { z } from "zod";
import { Button, ButtonLink } from "@/components/ui/button";
import { Card, EmptyState } from "@/components/ui/display";
import { Checkbox, Input } from "@/components/ui/field";
import { formatarBRL } from "@/lib/utils/money";
import { pedidoSchema } from "@/lib/validators/schemas";
import { criarPedido, type EstadoForm } from "@/server/actions/pedidos";
import { useCarrinho } from "./use-carrinho";

function mascaraCpf(v: string) {
  const d = v.replace(/\D/g, "").slice(0, 11);
  return d
    .replace(/^(\d{3})(\d)/, "$1.$2")
    .replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d)/, ".$1-$2");
}

function mascaraTelefone(v: string) {
  const d = v.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 2) return d;
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

export function CheckoutForm() {
  const { itens, pronto, total, alterar, remover } = useCarrinho();
  const [estado, formAction, pendente] = useActionState<EstadoForm, FormData>(criarPedido, {});
  const [valores, setValores] = useState({ nome: "", cpf: "", email: "", whatsapp: "", turma: "" });
  const [aceite, setAceite] = useState(false);
  const [errosCliente, setErrosCliente] = useState<Record<string, string[] | undefined>>({});

  if (!pronto) return <p className="text-muted">Carregando carrinho…</p>;

  if (itens.length === 0) {
    return (
      <EmptyState
        titulo="Seu carrinho está vazio"
        descricao="Escolha um produto na loja para continuar."
        acao={<ButtonLink href="/loja">Ir para a loja</ButtonLink>}
      />
    );
  }

  const itensEnvio = itens.map((i) => ({ produtoId: i.produtoId, variacaoId: i.variacaoId, quantidade: i.quantidade }));
  const erros = { ...estado.campos, ...errosCliente };
  const set = (campo: keyof typeof valores) => (e: { target: { value: string } }) =>
    setValores((v) => ({ ...v, [campo]: e.target.value }));

  function validarAntes(e: FormEvent<HTMLFormElement>) {
    const r = pedidoSchema.safeParse({ ...valores, itens: itensEnvio, aceitePrivacidade: aceite });
    if (!r.success) {
      e.preventDefault();
      setErrosCliente(z.flattenError(r.error).fieldErrors);
    } else {
      setErrosCliente({});
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
      <form action={formAction} onSubmit={validarAntes} noValidate className="flex flex-col gap-5" aria-busy={pendente}>
        <h2 className="text-3xl">Seus dados</h2>
        <input type="hidden" name="itens" value={JSON.stringify(itensEnvio)} />

        <Input id="nome" name="nome" label="Nome completo" autoComplete="name" value={valores.nome} onChange={set("nome")} erro={erros.nome?.[0]} />
        <Input
          id="cpf"
          name="cpf"
          label="CPF"
          inputMode="numeric"
          autoComplete="off"
          value={valores.cpf}
          onChange={(e) => setValores((v) => ({ ...v, cpf: mascaraCpf(e.target.value) }))}
          dica="Usado para emitir a cobrança. Não aparece publicamente."
          erro={erros.cpf?.[0]}
        />
        <Input id="email" name="email" type="email" label="E-mail" autoComplete="email" value={valores.email} onChange={set("email")} erro={erros.email?.[0]} />
        <Input
          id="whatsapp"
          name="whatsapp"
          type="tel"
          label="WhatsApp"
          autoComplete="tel"
          value={valores.whatsapp}
          onChange={(e) => setValores((v) => ({ ...v, whatsapp: mascaraTelefone(e.target.value) }))}
          erro={erros.whatsapp?.[0]}
        />
        <Input id="turma" name="turma" label="Turma (opcional)" value={valores.turma} onChange={set("turma")} erro={erros.turma?.[0]} />

        <Checkbox
          id="aceitePrivacidade"
          name="aceitePrivacidade"
          checked={aceite}
          onChange={(e) => setAceite(e.target.checked)}
          erro={erros.aceitePrivacidade?.[0]}
          label={
            <>
              Li e aceito o{" "}
              <Link href="/privacidade" target="_blank" className="text-accent underline">
                aviso de privacidade
              </Link>
              .
            </>
          }
        />

        {(estado.erro || erros.itens) && (
          <p role="alert" className="rounded-lg border border-danger px-4 py-3 text-danger">
            {estado.erro ?? erros.itens?.[0]}
          </p>
        )}

        <Button type="submit" tamanho="lg" disabled={pendente}>
          {pendente ? "Gerando pagamento…" : `Finalizar pedido · ${formatarBRL(total)}`}
        </Button>
      </form>

      <aside aria-labelledby="resumo">
        <Card className="flex flex-col gap-4 lg:sticky lg:top-24">
          <h2 id="resumo" className="text-3xl">Resumo</h2>
          <ul className="flex flex-col gap-4">
            {itens.map((i) => (
              <li key={`${i.produtoId}:${i.variacaoId}`} className="flex gap-3">
                {i.foto && <Image src={i.foto} alt="" width={56} height={56} className="size-14 rounded-lg object-cover" />}
                <div className="flex flex-1 flex-col gap-1">
                  <p className="font-display text-lg leading-tight font-bold">{i.nome}</p>
                  {i.variacaoRotulo && <p className="text-sm text-muted">{i.variacaoRotulo}</p>}
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      aria-label={`Diminuir quantidade de ${i.nome}`}
                      onClick={() => alterar(i, i.quantidade - 1)}
                      className="size-11 rounded-lg border border-border"
                    >
                      −
                    </button>
                    <span className="min-w-6 text-center font-mono" aria-live="polite">{i.quantidade}</span>
                    <button
                      type="button"
                      aria-label={`Aumentar quantidade de ${i.nome}`}
                      onClick={() => alterar(i, i.quantidade + 1)}
                      className="size-11 rounded-lg border border-border"
                    >
                      +
                    </button>
                    <button type="button" onClick={() => remover(i)} className="ml-auto min-h-11 px-2 text-sm text-danger underline">
                      Remover
                    </button>
                  </div>
                </div>
                <p className="font-mono">{formatarBRL(i.precoCentavos * i.quantidade)}</p>
              </li>
            ))}
          </ul>
          <p className="flex justify-between border-t border-border pt-4 font-mono text-lg">
            <span>Total</span>
            <strong>{formatarBRL(total)}</strong>
          </p>
          <p className="text-sm text-muted">O valor final é confirmado pelo servidor a partir dos preços do lote.</p>
        </Card>
      </aside>
    </div>
  );
}
