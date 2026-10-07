import { describe, expect, it } from "vitest";
import { codigoPedidoValido, gerarCodigoPedido, normalizarCodigoPedido } from "./codigo-pedido";

describe("codigo-pedido", () => {
  it("gera no formato HSI-XXXXXX sem caracteres ambíguos", () => {
    for (let i = 0; i < 500; i++) {
      const c = gerarCodigoPedido();
      expect(c).toMatch(/^HSI-[A-HJ-NP-Z2-9]{6}$/);
      expect(c.slice(4)).not.toMatch(/[01OI]/);
    }
  });
  it("gera códigos distintos", () => {
    const set = new Set(Array.from({ length: 200 }, gerarCodigoPedido));
    expect(set.size).toBeGreaterThan(195);
  });
  it("normaliza e valida entrada do usuário", () => {
    expect(normalizarCodigoPedido(" hsi-ab2cd3 ")).toBe("HSI-AB2CD3");
    expect(codigoPedidoValido("hsi-ab2cd3")).toBe(true);
    expect(codigoPedidoValido("HSI-AB0CD3")).toBe(false);
    expect(codigoPedidoValido("XYZ-AB2CD3")).toBe(false);
  });
});
