import { describe, expect, it } from "vitest";
import { centavosParaReais, formatarBRL, parseBRLParaCentavos, reaisParaCentavos } from "./money";

describe("money", () => {
  it("formata centavos em BRL", () => {
    expect(formatarBRL(6500).replace(/\s/g, " ")).toBe("R$ 65,00");
    expect(formatarBRL(123456).replace(/\s/g, " ")).toBe("R$ 1.234,56");
  });
  it("converte sem erro de ponto flutuante", () => {
    expect(reaisParaCentavos(19.9)).toBe(1990);
    expect(reaisParaCentavos(0.1 + 0.2)).toBe(30);
    expect(centavosParaReais(1990)).toBe(19.9);
  });
  it("interpreta texto", () => {
    expect(parseBRLParaCentavos("R$ 1.234,56")).toBe(123456);
    expect(parseBRLParaCentavos("12,5")).toBe(1250);
    expect(parseBRLParaCentavos("12.50")).toBe(1250);
    expect(parseBRLParaCentavos("abc")).toBeNull();
    expect(parseBRLParaCentavos("")).toBeNull();
  });
});
