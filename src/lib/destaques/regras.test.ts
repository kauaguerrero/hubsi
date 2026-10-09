import { describe, expect, it } from "vitest";
import { calcularKpis, ctaDoDestaque, destaqueAtivo } from "./regras";

describe("destaqueAtivo", () => {
  const agora = new Date("2026-10-10T12:00:00Z");
  it("exige publicado", () => {
    expect(destaqueAtivo({ status: "rascunho", expira_em: null }, agora)).toBe(false);
  });
  it("sem expiração fica ativo", () => {
    expect(destaqueAtivo({ status: "publicado", expira_em: null }, agora)).toBe(true);
  });
  it("expira na data", () => {
    expect(destaqueAtivo({ status: "publicado", expira_em: "2026-10-10T11:00:00Z" }, agora)).toBe(false);
    expect(destaqueAtivo({ status: "publicado", expira_em: "2026-10-11T00:00:00Z" }, agora)).toBe(true);
  });
});

describe("ctaDoDestaque", () => {
  it("usa o texto customizado ou o padrão do tipo", () => {
    expect(ctaDoDestaque({ tipo: "formulario", cta_texto: null })).toBe("Quero participar");
    expect(ctaDoDestaque({ tipo: "formulario", cta_texto: "Garanta o seu" })).toBe("Garanta o seu");
  });
});

describe("calcularKpis", () => {
  it("soma valor, unidades e demanda por item", () => {
    const k = calcularKpis([
      { contatado_em: null, itens: [{ item_id: "a", quantidade: 2, preco_centavos: 5000 }, { item_id: "b", quantidade: 1, preco_centavos: 3000 }] },
      { contatado_em: "2026-10-11T00:00:00Z", itens: [{ item_id: "a", quantidade: 1, preco_centavos: 5000 }] },
    ]);
    expect(k.total).toBe(2);
    expect(k.contatados).toBe(1);
    expect(k.pendentes).toBe(1);
    expect(k.unidades).toBe(4);
    expect(k.valorCentavos).toBe(18000);
    expect(k.ticketMedioCentavos).toBe(9000);
    expect(k.porItem.find((i) => i.itemId === "a")).toMatchObject({ interessados: 2, unidades: 3, valorCentavos: 15000 });
  });
  it("lista vazia não divide por zero", () => {
    expect(calcularKpis([]).ticketMedioCentavos).toBe(0);
  });
});
