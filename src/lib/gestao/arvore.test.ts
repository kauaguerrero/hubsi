import { describe, expect, it } from "vitest";
import {
  descendentes,
  montarArvore,
  moverEntreIrmaos,
  podeSerSuperior,
} from "./arvore";
import type { MembroOrg } from "./organograma";

const m = (
  id: string,
  superior: string | null = null,
  ordem = 0,
): MembroOrg => ({
  id,
  nome: id,
  cargo: "x",
  foto_url: null,
  ordem,
  superior_id: superior,
});

describe("montarArvore", () => {
  it("monta níveis e ordena irmãos por ordem", () => {
    const arvore = montarArvore([
      m("c", "a", 2),
      m("b", "a", 1),
      m("a"),
      m("d", "b"),
    ]);
    expect(arvore).toHaveLength(1);
    expect(arvore[0]?.membro.id).toBe("a");
    expect(arvore[0]?.filhos.map((f) => f.membro.id)).toEqual(["b", "c"]);
    expect(arvore[0]?.filhos[0]?.filhos[0]?.membro.id).toBe("d");
  });

  it("vários membros sem superior viram várias raízes", () => {
    expect(
      montarArvore([m("a", null, 2), m("b", null, 1)]).map((n) => n.membro.id),
    ).toEqual(["b", "a"]);
  });

  it("superior inexistente ou ciclo não quebram: viram raiz", () => {
    const orfao = montarArvore([m("a", "fantasma")]);
    expect(orfao.map((n) => n.membro.id)).toEqual(["a"]);

    const ciclo = montarArvore([m("a", "b"), m("b", "a"), m("c", "a")]);
    const ids = new Set<string>();
    const coletar = (ns: ReturnType<typeof montarArvore>) =>
      ns.forEach((n) => (ids.add(n.membro.id), coletar(n.filhos)));
    coletar(ciclo);
    expect(ids).toEqual(new Set(["a", "b", "c"]));
  });

  it("auto-referência é ignorada", () => {
    expect(montarArvore([m("a", "a")]).map((n) => n.membro.id)).toEqual(["a"]);
  });
});

describe("podeSerSuperior", () => {
  const membros = [m("a"), m("b", "a"), m("c", "b"), m("d")];
  it("recusa a si mesmo e descendentes", () => {
    expect(descendentes("a", membros)).toEqual(new Set(["b", "c"]));
    expect(podeSerSuperior("a", "a", membros)).toBe(false);
    expect(podeSerSuperior("a", "c", membros)).toBe(false);
  });
  it("aceita membros fora da subárvore, ninguém e recusa desconhecidos", () => {
    expect(podeSerSuperior("a", "d", membros)).toBe(true);
    expect(podeSerSuperior("c", "a", membros)).toBe(true);
    expect(podeSerSuperior("c", null, membros)).toBe(true);
    expect(podeSerSuperior("c", "zzz", membros)).toBe(false);
  });
});

describe("moverEntreIrmaos", () => {
  const irmaos = [
    { id: "a", nome: "A", ordem: 1 },
    { id: "b", nome: "B", ordem: 2 },
    { id: "c", nome: "C", ordem: 2 },
  ];
  it("troca de posição e renumera 1..n (inclusive com ordens repetidas)", () => {
    expect(moverEntreIrmaos("b", "cima", irmaos)).toEqual([
      { id: "b", ordem: 1 },
      { id: "a", ordem: 2 },
      { id: "c", ordem: 3 },
    ]);
    expect(moverEntreIrmaos("b", "baixo", irmaos)).toEqual([
      { id: "a", ordem: 1 },
      { id: "c", ordem: 2 },
      { id: "b", ordem: 3 },
    ]);
  });
  it("não move além das pontas", () => {
    expect(moverEntreIrmaos("a", "cima", irmaos)).toEqual([]);
    expect(moverEntreIrmaos("c", "baixo", irmaos)).toEqual([]);
    expect(moverEntreIrmaos("zzz", "cima", irmaos)).toEqual([]);
  });
});
