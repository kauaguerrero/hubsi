import { describe, expect, it } from "vitest";
import { celulaCSV, gerarCSVGrafica, resumirGrafica } from "./grafica";
import { acoesDisponiveis, podeTransicionarAdmin } from "./transicoes";

describe("transições de admin", () => {
  it("só cancela pedidos não pagos", () => {
    expect(podeTransicionarAdmin("aguardando_pagamento", "cancelar")).toBe(true);
    for (const s of ["pago", "em_producao", "disponivel", "retirado", "estornado"] as const) {
      expect(podeTransicionarAdmin(s, "cancelar")).toBe(false);
    }
  });
  it("disponível e retirado só a partir de pedidos pagos", () => {
    expect(podeTransicionarAdmin("aguardando_pagamento", "disponivel")).toBe(false);
    expect(podeTransicionarAdmin("pago", "disponivel")).toBe(true);
    expect(podeTransicionarAdmin("disponivel", "retirado")).toBe(true);
    expect(podeTransicionarAdmin("cancelado", "retirado")).toBe(false);
    expect(acoesDisponiveis("pago")).toEqual(["disponivel", "retirado"]);
  });
});

describe("resumo da gráfica e CSV", () => {
  const itens = [
    { produto: "Camisa", tamanho: "M", cor: "Preta", quantidade: 2 },
    { produto: "Camisa", tamanho: "M", cor: "Preta", quantidade: 1 },
    { produto: "Camisa", tamanho: "P", cor: "Azul", quantidade: 1 },
    { produto: "Caneca", tamanho: null, cor: null, quantidade: 4 },
  ];
  it("agrupa e ordena", () => {
    expect(resumirGrafica(itens)).toEqual([
      { produto: "Camisa", tamanho: "M", cor: "Preta", quantidade: 3 },
      { produto: "Camisa", tamanho: "P", cor: "Azul", quantidade: 1 },
      { produto: "Caneca", tamanho: "", cor: "", quantidade: 4 },
    ]);
  });
  it("gera CSV com total e sem dados pessoais", () => {
    const csv = gerarCSVGrafica(resumirGrafica(itens));
    expect(csv).toContain("Produto,Tamanho,Cor,Quantidade");
    expect(csv).toContain("Camisa,M,Preta,3");
    expect(csv).toContain("Total,,,8");
    expect(csv).not.toMatch(/cpf|email|whatsapp/i);
  });
  it("neutraliza fórmulas e escapa aspas e vírgulas", () => {
    expect(celulaCSV("=HYPERLINK(1)")).toBe("'=HYPERLINK(1)");
    expect(celulaCSV("a,b")).toBe('"a,b"');
    expect(celulaCSV('diz "oi"')).toBe('"diz ""oi"""');
  });
});
