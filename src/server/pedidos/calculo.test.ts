import { describe, expect, it } from "vitest";
import { montarPedido, type LoteParaPedido, type ProdutoParaPedido } from "./calculo";

const agora = new Date("2026-06-10T12:00:00Z");
const lote: LoteParaPedido = {
  id: "l1",
  status: "aberto",
  abre_em: "2026-06-01T00:00:00Z",
  fecha_em: "2026-07-01T00:00:00Z",
  limite_unidades: null,
};
const camisa: ProdutoParaPedido = {
  id: "p1",
  lote_id: "l1",
  nome: "Camisa",
  preco_centavos: 6500,
  ativo: true,
  variacoes: [{ id: "v1" }, { id: "v2" }],
};
const caneca: ProdutoParaPedido = { id: "p2", lote_id: "l1", nome: "Caneca", preco_centavos: 3500, ativo: true, variacoes: [] };

const base = { produtos: [camisa, caneca], lote, unidadesJaVendidas: 0, agora };

describe("montarPedido", () => {
  it("calcula o total com preços do banco e agrupa linhas iguais", () => {
    const r = montarPedido({
      ...base,
      itens: [
        { produtoId: "p1", variacaoId: "v1", quantidade: 1 },
        { produtoId: "p1", variacaoId: "v1", quantidade: 1 },
        { produtoId: "p2", quantidade: 1 },
      ],
    });
    expect(r).toMatchObject({ ok: true, total: 16500, unidades: 3 });
    expect(r.ok && r.itens).toHaveLength(2);
  });

  it("ignora preço manipulado vindo do navegador", () => {
    const adulterado = { produtoId: "p2", quantidade: 2, precoUnitario: 1, preco_centavos: 1 } as never;
    const r = montarPedido({ ...base, itens: [adulterado] });
    expect(r).toMatchObject({ ok: true, total: 7000 });
    expect(r.ok && r.itens[0]?.precoUnitario).toBe(3500);
  });

  it("rejeita lote fechado, fora do prazo ou ainda não aberto", () => {
    const itens = [{ produtoId: "p2", quantidade: 1 }];
    expect(montarPedido({ ...base, itens, lote: { ...lote, status: "fechado" } }).ok).toBe(false);
    expect(montarPedido({ ...base, itens, agora: new Date("2026-07-02T00:00:00Z") }).ok).toBe(false);
    expect(montarPedido({ ...base, itens, agora: new Date("2026-05-01T00:00:00Z") }).ok).toBe(false);
  });

  it("valida variações", () => {
    expect(montarPedido({ ...base, itens: [{ produtoId: "p1", quantidade: 1 }] }).ok).toBe(false);
    expect(montarPedido({ ...base, itens: [{ produtoId: "p1", variacaoId: "zzz", quantidade: 1 }] }).ok).toBe(false);
    expect(montarPedido({ ...base, itens: [{ produtoId: "p2", variacaoId: "v1", quantidade: 1 }] }).ok).toBe(false);
  });

  it("rejeita produto inativo, inexistente ou de outro lote", () => {
    const itens = [{ produtoId: "p2", quantidade: 1 }];
    expect(montarPedido({ ...base, itens, produtos: [{ ...caneca, ativo: false }] }).ok).toBe(false);
    expect(montarPedido({ ...base, itens: [{ produtoId: "nao", quantidade: 1 }] }).ok).toBe(false);
    expect(montarPedido({ ...base, itens, produtos: [{ ...caneca, lote_id: "outro" }] }).ok).toBe(false);
  });

  it("respeita limite de unidades do lote e do pedido", () => {
    const itens = [{ produtoId: "p2", quantidade: 3 }];
    expect(montarPedido({ ...base, itens, lote: { ...lote, limite_unidades: 10 }, unidadesJaVendidas: 8 }).ok).toBe(false);
    expect(montarPedido({ ...base, itens, lote: { ...lote, limite_unidades: 10 }, unidadesJaVendidas: 7 }).ok).toBe(true);
    const muitos = [{ produtoId: "p2", quantidade: 10 }, { produtoId: "p1", variacaoId: "v1", quantidade: 10 }, { produtoId: "p1", variacaoId: "v2", quantidade: 1 }];
    expect(montarPedido({ ...base, itens: muitos }).ok).toBe(false);
  });

  it("rejeita carrinho vazio e quantidade inválida", () => {
    expect(montarPedido({ ...base, itens: [] }).ok).toBe(false);
    expect(montarPedido({ ...base, itens: [{ produtoId: "p2", quantidade: 0 }] }).ok).toBe(false);
  });
});
