import { describe, expect, it } from "vitest";
import {
  adicionarItem,
  alterarQuantidade,
  lerCarrinhoSalvo,
  removerItem,
  totalCentavos,
  totalUnidades,
  type ItemCarrinho,
} from "./carrinho";

const camisaP: ItemCarrinho = {
  produtoId: "p1",
  variacaoId: "v1",
  quantidade: 1,
  loteId: "l1",
  slug: "camisa",
  nome: "Camisa",
  variacaoRotulo: "P / Preta",
  precoCentavos: 6500,
  foto: null,
};

describe("carrinho", () => {
  it("soma quantidade da mesma linha e limita a 10", () => {
    const r1 = adicionarItem([camisaP], { ...camisaP, quantidade: 2 });
    expect(r1.ok && r1.itens).toHaveLength(1);
    expect(r1.ok && r1.itens[0]?.quantidade).toBe(3);
    const r2 = adicionarItem([{ ...camisaP, quantidade: 9 }], { ...camisaP, quantidade: 5 });
    expect(r2.ok && r2.itens[0]?.quantidade).toBe(10);
  });
  it("mantém linhas distintas por variação", () => {
    const r = adicionarItem([camisaP], { ...camisaP, variacaoId: "v2" });
    expect(r.ok && r.itens).toHaveLength(2);
  });
  it("recusa itens de outro lote", () => {
    const r = adicionarItem([camisaP], { ...camisaP, produtoId: "p2", loteId: "l2" });
    expect(r.ok).toBe(false);
  });
  it("calcula totais, altera e remove", () => {
    const itens = [{ ...camisaP, quantidade: 2 }, { ...camisaP, produtoId: "p2", variacaoId: null, precoCentavos: 3500 }];
    expect(totalCentavos(itens)).toBe(16500);
    expect(totalUnidades(itens)).toBe(3);
    expect(alterarQuantidade(itens, itens[0]!, 0)).toHaveLength(1);
    expect(removerItem(itens, itens[1]!)).toHaveLength(1);
  });
  it("ignora dados salvos corrompidos", () => {
    expect(lerCarrinhoSalvo(null)).toEqual([]);
    expect(lerCarrinhoSalvo("{ruim")).toEqual([]);
    expect(lerCarrinhoSalvo('{"a":1}')).toEqual([]);
    expect(lerCarrinhoSalvo(JSON.stringify([camisaP, { produtoId: 1 }]))).toEqual([camisaP]);
  });
});
