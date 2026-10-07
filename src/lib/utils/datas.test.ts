import { describe, expect, it } from "vitest";
import { dataISOLocal, datetimeLocalParaISO, isoParaDatetimeLocal } from "./datas";

describe("datas", () => {
  it("converte datetime-local de Brasília para ISO UTC e volta", () => {
    expect(datetimeLocalParaISO("2026-06-10T19:30")).toBe("2026-06-10T22:30:00.000Z");
    expect(isoParaDatetimeLocal("2026-06-10T22:30:00.000Z")).toBe("2026-06-10T19:30");
    expect(isoParaDatetimeLocal(null)).toBe("");
  });
  it("rejeita formato inválido", () => {
    expect(datetimeLocalParaISO("")).toBeNull();
    expect(datetimeLocalParaISO("10/06/2026")).toBeNull();
    expect(datetimeLocalParaISO("2026-13-45T25:00")).toBeNull();
  });
  it("dataISOLocal usa o fuso de São Paulo", () => {
    expect(dataISOLocal("2026-06-11T01:00:00Z")).toBe("2026-06-10");
  });
});
