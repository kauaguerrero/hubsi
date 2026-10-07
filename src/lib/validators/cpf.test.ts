import { describe, expect, it } from "vitest";
import { formatarCpf, normalizarCpf, validarCpf } from "./cpf";

describe("cpf", () => {
  it("aceita CPFs válidos com e sem máscara", () => {
    expect(validarCpf("529.982.247-25")).toBe(true);
    expect(validarCpf("52998224725")).toBe(true);
  });
  it("rejeita dígitos verificadores errados", () => {
    expect(validarCpf("529.982.247-24")).toBe(false);
    expect(validarCpf("123.456.789-00")).toBe(false);
  });
  it("rejeita sequências repetidas", () => {
    for (let d = 0; d <= 9; d++) expect(validarCpf(String(d).repeat(11))).toBe(false);
    expect(validarCpf("111.111.111-11")).toBe(false);
  });
  it("rejeita tamanho errado e texto", () => {
    expect(validarCpf("")).toBe(false);
    expect(validarCpf("5299822472")).toBe(false);
    expect(validarCpf("abc")).toBe(false);
  });
  it("normaliza e formata", () => {
    expect(normalizarCpf("529.982.247-25")).toBe("52998224725");
    expect(formatarCpf("52998224725")).toBe("529.982.247-25");
  });
});
