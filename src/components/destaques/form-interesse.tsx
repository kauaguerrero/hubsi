"use client";

import Link from "next/link";
import { useActionState, useState, type FormEvent } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/display";
import { Checkbox, Input, Select, Textarea } from "@/components/ui/field";
import { formatarBRL } from "@/lib/utils/money";
import { interesseSchema } from "@/lib/validators/destaques";
import { registrarInteresse } from "@/server/actions/destaques";
import type { EstadoForm } from "@/server/actions/pedidos";
import type { ItemDestaque } from "@/server/queries/destaques";

function mascaraTelefone(v: string) {
  const d = v.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 2) return d;
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

export function FormInteresse({ destaqueId, itens }: { destaqueId: string; itens: ItemDestaque[] }) {
  const [estado, formAction, pendente] = useActionState<EstadoForm, FormData>(
    registrarInteresse.bind(null, destaqueId),
    {},
  );
  const [valores, setValores] = useState({ nome: "", email: "", whatsapp: "", turma: "", observacao: "" });
  const [quantidades, setQuantidades] = useState<Record<string, number>>({});
  const [aceite, setAceite] = useState(false);
  const [errosCliente, setErrosCliente] = useState<Record<string, string[] | undefined>>({});

  const selecao = Object.entries(quantidades).map(([itemId, quantidade]) => ({ itemId, quantidade }));
  const estimativa = itens.reduce((s, i) => s + (quantidades[i.id] ?? 0) * i.preco_centavos, 0);
  const erros = { ...estado.campos, ...errosCliente };
  const set = (campo: keyof typeof valores) => (e: { target: { value: string } }) =>
    setValores((v) => ({ ...v, [campo]: e.target.value }));

  function alternar(id: string, marcado: boolean) {
    setQuantidades((q) => {
      const resto = { ...q };
      delete resto[id];
      return marcado ? { ...resto, [id]: 1 } : resto;
    });
  }

  function validarAntes(e: FormEvent<HTMLFormElement>) {
    const r = interesseSchema.safeParse({ ...valores, selecao, aceitePrivacidade: aceite });
    if (!r.success) {
      e.preventDefault();
      setErrosCliente(z.flattenError(r.error).fieldErrors);
    } else {
      setErrosCliente({});
    }
  }

  if (estado.ok) {
    return (
      <Card role="status" className="border-accent flex flex-col gap-2">
        <h2 className="text-3xl">Tudo certo! 🎉</h2>
        <p>{estado.ok}</p>
        <p className="text-muted">Entraremos em contato pelo WhatsApp ou e-mail quando o lançamento acontecer.</p>
      </Card>
    );
  }

  return (
    <form action={formAction} onSubmit={validarAntes} noValidate className="flex flex-col gap-6" aria-busy={pendente}>
      <input type="hidden" name="selecao" value={JSON.stringify(selecao)} />

      <fieldset className="flex flex-col gap-3">
        <legend className="text-3xl">O que você quer?</legend>
        <p className="text-muted">Marque um ou mais itens. Sem compromisso: ainda não é uma compra.</p>
        <ul className="flex flex-col gap-3">
          {itens.map((i) => {
            const marcado = i.id in quantidades;
            return (
              <li key={i.id}>
                <Card className={`flex flex-wrap items-center justify-between gap-3 ${marcado ? "border-accent" : ""}`}>
                  <Checkbox
                    id={`item-${i.id}`}
                    checked={marcado}
                    onChange={(e) => alternar(i.id, e.target.checked)}
                    label={
                      <span className="flex flex-col">
                        <span className="font-semibold">{i.nome}</span>
                        {i.descricao && <span className="text-muted">{i.descricao}</span>}
                        {i.preco_centavos > 0 && <span className="font-mono text-sm">{formatarBRL(i.preco_centavos)}</span>}
                      </span>
                    }
                  />
                  {marcado && (
                    <Select
                      id={`qtd-${i.id}`}
                      label="Quantidade"
                      value={quantidades[i.id]}
                      onChange={(e) => setQuantidades((q) => ({ ...q, [i.id]: Number(e.target.value) }))}
                    >
                      {Array.from({ length: 10 }, (_, n) => n + 1).map((n) => (
                        <option key={n} value={n}>{n}</option>
                      ))}
                    </Select>
                  )}
                </Card>
              </li>
            );
          })}
        </ul>
        {erros.selecao && <p role="alert" className="text-danger text-sm">{erros.selecao[0]}</p>}
        {estimativa > 0 && (
          <p className="font-mono text-sm text-muted">Estimativa: {formatarBRL(estimativa)} (valores finais confirmados no lançamento)</p>
        )}
      </fieldset>

      <div className="flex flex-col gap-5">
        <h2 className="text-3xl">Seus dados</h2>
        <Input id="nome" name="nome" label="Nome completo" autoComplete="name" value={valores.nome} onChange={set("nome")} erro={erros.nome?.[0]} />
        <Input id="email" name="email" type="email" label="E-mail" autoComplete="email" value={valores.email} onChange={set("email")} erro={erros.email?.[0]} />
        <Input
          id="whatsapp"
          name="whatsapp"
          label="WhatsApp"
          inputMode="tel"
          autoComplete="tel"
          value={valores.whatsapp}
          onChange={(e) => setValores((v) => ({ ...v, whatsapp: mascaraTelefone(e.target.value) }))}
          dica="Usado só para avisar você sobre o lançamento."
          erro={erros.whatsapp?.[0]}
        />
        <Input id="turma" name="turma" label="Turma (opcional)" value={valores.turma} onChange={set("turma")} erro={erros.turma?.[0]} />
        <Textarea id="observacao" name="observacao" label="Algo a mais? (opcional)" rows={2} maxLength={500} value={valores.observacao} onChange={set("observacao")} erro={erros.observacao?.[0]} />
        <Checkbox
          id="aceitePrivacidade"
          name="aceitePrivacidade"
          checked={aceite}
          onChange={(e) => setAceite(e.target.checked)}
          erro={erros.aceitePrivacidade?.[0]}
          label={
            <>
              Li e aceito o{" "}
              <Link href="/privacidade" target="_blank" className="text-accent underline">aviso de privacidade</Link>.
            </>
          }
        />
      </div>

      {estado.erro && (
        <p role="alert" className="border-danger text-danger rounded-lg border px-4 py-3">{estado.erro}</p>
      )}
      <Button type="submit" tamanho="lg" disabled={pendente}>
        {pendente ? "Enviando…" : "Registrar meu interesse"}
      </Button>
    </form>
  );
}
