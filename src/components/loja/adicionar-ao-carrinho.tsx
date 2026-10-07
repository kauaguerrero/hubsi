"use client";

import Link from "next/link";
import { useState } from "react";
import { Button, ButtonLink } from "@/components/ui/button";
import { Select } from "@/components/ui/field";
import { MAX_POR_ITEM } from "@/lib/carrinho";
import { useCarrinho } from "./use-carrinho";

type Variacao = { id: string; tamanho: string | null; cor: string | null };

type Props = {
  produtoId: string;
  loteId: string;
  slug: string;
  nome: string;
  precoCentavos: number;
  foto: string | null;
  variacoes: Variacao[];
};

const unicos = (valores: (string | null)[]) => [
  ...new Set(valores.filter((v): v is string => !!v)),
];

export function AdicionarAoCarrinho({
  produtoId,
  loteId,
  slug,
  nome,
  precoCentavos,
  foto,
  variacoes,
}: Props) {
  const { adicionar } = useCarrinho();
  const tamanhos = unicos(variacoes.map((v) => v.tamanho));
  const cores = unicos(variacoes.map((v) => v.cor));

  const [tamanho, setTamanho] = useState(
    tamanhos.length === 1 ? tamanhos[0]! : "",
  );
  const [cor, setCor] = useState(cores.length === 1 ? cores[0]! : "");
  const [quantidade, setQuantidade] = useState(1);
  const [mensagem, setMensagem] = useState<{
    tipo: "ok" | "erro";
    texto: string;
  } | null>(null);

  const precisaVariacao = variacoes.length > 0;
  const variacao = precisaVariacao
    ? variacoes.find(
        (v) =>
          (v.tamanho ?? "") === (tamanhos.length ? tamanho : "") &&
          (v.cor ?? "") === (cores.length ? cor : ""),
      )
    : undefined;

  function adicionarAoCarrinho() {
    if (precisaVariacao && !variacao) {
      setMensagem({
        tipo: "erro",
        texto: "Escolha o modelo e o tamanho antes de adicionar.",
      });
      return;
    }
    const r = adicionar({
      produtoId,
      variacaoId: variacao?.id ?? null,
      quantidade,
      loteId,
      slug,
      nome,
      variacaoRotulo: variacao
        ? [variacao.tamanho, variacao.cor].filter(Boolean).join(" / ")
        : null,
      precoCentavos,
      foto,
    });
    setMensagem(
      r.ok
        ? { tipo: "ok", texto: "Adicionado ao carrinho." }
        : { tipo: "erro", texto: r.erro },
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        {tamanhos.length > 1 && (
          <Select
            id="tamanho"
            label="Tamanho"
            value={tamanho}
            onChange={(e) => setTamanho(e.target.value)}
          >
            <option value="">Selecione</option>
            {tamanhos.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </Select>
        )}
        {cores.length > 1 && (
          <Select
            id="cor"
            label="Modelo"
            value={cor}
            onChange={(e) => setCor(e.target.value)}
          >
            <option value="">Selecione</option>
            {cores.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </Select>
        )}
        <Select
          id="quantidade"
          label="Quantidade"
          value={quantidade}
          onChange={(e) => setQuantidade(Number(e.target.value))}
        >
          {Array.from({ length: MAX_POR_ITEM }, (_, i) => i + 1).map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </Select>
      </div>

      <Button tamanho="lg" onClick={adicionarAoCarrinho}>
        Adicionar ao carrinho
      </Button>

      <div aria-live="polite">
        {mensagem?.tipo === "ok" && (
          <p className="text-success flex flex-wrap items-center gap-3">
            {mensagem.texto}
            <ButtonLink href="/checkout" variante="secundario">
              Ir para o checkout
            </ButtonLink>
          </p>
        )}
        {mensagem?.tipo === "erro" && (
          <p role="alert" className="text-danger">
            {mensagem.texto}{" "}
            <Link href="/checkout" className="underline">
              Ver carrinho
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}
