import { describe, expect, it } from "vitest";
import { montarOrganograma, temEstrutura, type MembroOrg } from "./organograma";

const m = (nome: string, cargo: string, ordem = 0): MembroOrg => ({
  id: nome,
  nome,
  cargo,
  foto_url: null,
  ordem,
});

describe("montarOrganograma", () => {
  const membros = [
    m("Sofia", "Presidente", 1),
    m("Igor", "Vice-Presidente", 2),
    m("Kauã", "Secretário", 3),
    m("Gabriel", "Vice-Secretário", 4),
    m("Beatriz", "Tesoureira", 5),
    m("Lucas", "Vice-Tesoureiro", 6),
  ];

  it("encaixa cada cargo na sua posição (inclusive flexão de gênero e acentos)", () => {
    const o = montarOrganograma(membros);
    expect(o.presidente?.nome).toBe("Sofia");
    expect(o.vicePresidente?.nome).toBe("Igor");
    expect(o.secretaria.titular?.nome).toBe("Kauã");
    expect(o.secretaria.vice?.nome).toBe("Gabriel");
    expect(o.tesouraria.titular?.nome).toBe("Beatriz");
    expect(o.tesouraria.vice?.nome).toBe("Lucas");
    expect(o.outros).toEqual([]);
    expect(temEstrutura(o)).toBe(true);
  });

  it("'Vice-Presidente' não vira Presidente, e variações de escrita funcionam", () => {
    const o = montarOrganograma([
      m("A", "vice presidente"),
      m("B", "PRESIDENTE"),
      m("C", "Secretária"),
      m("D", "Vice Tesoureira"),
    ]);
    expect(o.presidente?.nome).toBe("B");
    expect(o.vicePresidente?.nome).toBe("A");
    expect(o.secretaria.titular?.nome).toBe("C");
    expect(o.tesouraria.vice?.nome).toBe("D");
  });

  it("cargos desconhecidos ou repetidos vão para 'outros'", () => {
    const o = montarOrganograma([
      m("A", "Presidente", 1),
      m("B", "Presidente", 2),
      m("C", "Diretor de Eventos", 3),
    ]);
    expect(o.presidente?.nome).toBe("A");
    expect(o.outros.map((x) => x.nome)).toEqual(["B", "C"]);
  });

  it("sem membros ou sem cargos conhecidos não há estrutura", () => {
    expect(temEstrutura(montarOrganograma([]))).toBe(false);
    expect(temEstrutura(montarOrganograma([m("X", "Diretor")]))).toBe(false);
  });
});
