import type { MembroOrg } from "./organograma";

export type NoArvore = { membro: MembroOrg; filhos: NoArvore[] };

const porOrdem = (a: MembroOrg, b: MembroOrg) =>
  a.ordem - b.ordem || a.nome.localeCompare(b.nome, "pt-BR");

/** Sobe pela cadeia de superiores; se voltar a um já visitado, há ciclo. */
function temCiclo(id: string, superiorDe: Map<string, string | null>): boolean {
  const visitados = new Set<string>([id]);
  let atual = superiorDe.get(id) ?? null;
  while (atual) {
    if (visitados.has(atual)) return true;
    visitados.add(atual);
    atual = superiorDe.get(atual) ?? null;
  }
  return false;
}

/**
 * Monta a árvore do organograma. Superior inexistente ou que forme ciclo é tratado
 * como "sem superior" (o membro vira raiz), então a página nunca quebra.
 */
export function montarArvore(membros: MembroOrg[]): NoArvore[] {
  const ids = new Set(membros.map((m) => m.id));
  const superiorDe = new Map<string, string | null>(
    membros.map((m) => [
      m.id,
      m.superior_id && ids.has(m.superior_id) && m.superior_id !== m.id
        ? m.superior_id
        : null,
    ]),
  );
  for (const m of membros) {
    if (temCiclo(m.id, superiorDe)) superiorDe.set(m.id, null);
  }

  const nos = new Map<string, NoArvore>(
    membros.map((m) => [m.id, { membro: m, filhos: [] }]),
  );
  const raizes: NoArvore[] = [];
  for (const m of [...membros].sort(porOrdem)) {
    const no = nos.get(m.id)!;
    const superior = superiorDe.get(m.id);
    (superior ? nos.get(superior)!.filhos : raizes).push(no);
  }
  return raizes;
}

/** IDs de todos os descendentes (filhos, netos…) de um membro. */
export function descendentes(
  id: string,
  membros: Pick<MembroOrg, "id" | "superior_id">[],
): Set<string> {
  const resultado = new Set<string>();
  const fila = [id];
  while (fila.length) {
    const atual = fila.shift()!;
    for (const m of membros) {
      if (m.superior_id === atual && !resultado.has(m.id)) {
        resultado.add(m.id);
        fila.push(m.id);
      }
    }
  }
  return resultado;
}

/** O superior escolhido não pode ser o próprio membro nem alguém abaixo dele (criaria ciclo). */
export function podeSerSuperior(
  membroId: string,
  novoSuperiorId: string | null,
  membros: Pick<MembroOrg, "id" | "superior_id">[],
): boolean {
  if (novoSuperiorId === null) return true;
  if (novoSuperiorId === membroId) return false;
  if (!membros.some((m) => m.id === novoSuperiorId)) return false;
  return !descendentes(membroId, membros).has(novoSuperiorId);
}

/**
 * Reordena irmãos: devolve a nova `ordem` (1..n) de cada irmão depois de mover
 * `membroId` uma posição para cima ou para baixo. Vazio se não puder mover.
 */
export function moverEntreIrmaos(
  membroId: string,
  direcao: "cima" | "baixo",
  irmaos: Pick<MembroOrg, "id" | "nome" | "ordem">[],
): { id: string; ordem: number }[] {
  const lista = [...irmaos].sort(
    (a, b) => a.ordem - b.ordem || a.nome.localeCompare(b.nome, "pt-BR"),
  );
  const i = lista.findIndex((m) => m.id === membroId);
  const j = direcao === "cima" ? i - 1 : i + 1;
  if (i < 0 || j < 0 || j >= lista.length) return [];
  [lista[i], lista[j]] = [lista[j]!, lista[i]!];
  return lista.map((m, idx) => ({ id: m.id, ordem: idx + 1 }));
}
