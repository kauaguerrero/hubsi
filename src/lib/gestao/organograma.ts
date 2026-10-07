export type MembroOrg = {
  id: string;
  nome: string;
  cargo: string;
  foto_url: string | null;
  ordem: number;
  /** Quem está acima na hierarquia (null = topo). */
  superior_id: string | null;
};

export type Organograma = {
  presidente?: MembroOrg;
  vicePresidente?: MembroOrg;
  secretaria: { titular?: MembroOrg; vice?: MembroOrg };
  tesouraria: { titular?: MembroOrg; vice?: MembroOrg };
  /** Cargos fora da estrutura padrão (ou repetidos). */
  outros: MembroOrg[];
};

/** "Vice-Presidente" → "vicepresidente" (sem acento, espaço ou hífen). */
function chave(cargo: string): string {
  return cargo
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z]/g, "");
}

type Vaga =
  | "presidente"
  | "vicePresidente"
  | "secretario"
  | "viceSecretario"
  | "tesoureiro"
  | "viceTesoureiro";

function vagaDoCargo(cargo: string): Vaga | null {
  const c = chave(cargo);
  // "vice" primeiro: "vicepresidente" não pode cair em "presidente".
  if (/^vicepresident/.test(c)) return "vicePresidente";
  if (/^president/.test(c)) return "presidente";
  if (/^vicesecretar/.test(c)) return "viceSecretario";
  if (/^secretar/.test(c)) return "secretario";
  if (/^vicetesour/.test(c)) return "viceTesoureiro";
  if (/^tesour/.test(c)) return "tesoureiro";
  return null;
}

/** Reconhece os cargos padrão de um D.A. (presidente, vice, secretaria, tesouraria). */
export function montarOrganograma(membros: MembroOrg[]): Organograma {
  const org: Organograma = { secretaria: {}, tesouraria: {}, outros: [] };

  for (const m of [...membros].sort((a, b) => a.ordem - b.ordem)) {
    const vaga = vagaDoCargo(m.cargo);
    const ocupada =
      (vaga === "presidente" && org.presidente) ||
      (vaga === "vicePresidente" && org.vicePresidente) ||
      (vaga === "secretario" && org.secretaria.titular) ||
      (vaga === "viceSecretario" && org.secretaria.vice) ||
      (vaga === "tesoureiro" && org.tesouraria.titular) ||
      (vaga === "viceTesoureiro" && org.tesouraria.vice);

    if (!vaga || ocupada) {
      org.outros.push(m);
      continue;
    }
    if (vaga === "presidente") org.presidente = m;
    else if (vaga === "vicePresidente") org.vicePresidente = m;
    else if (vaga === "secretario") org.secretaria.titular = m;
    else if (vaga === "viceSecretario") org.secretaria.vice = m;
    else if (vaga === "tesoureiro") org.tesouraria.titular = m;
    else org.tesouraria.vice = m;
  }
  return org;
}

export function temEstrutura(org: Organograma): boolean {
  return !!(
    org.presidente ||
    org.vicePresidente ||
    org.secretaria.titular ||
    org.secretaria.vice ||
    org.tesouraria.titular ||
    org.tesouraria.vice
  );
}

/**
 * Hierarquia sugerida a partir dos cargos: presidente no topo → vice → secretaria e
 * tesouraria (titular → vice). Cargos desconhecidos ficam abaixo do presidente.
 * Devolve `membroId → superiorId` (null = topo).
 */
export function superioresPadrao(
  membros: MembroOrg[],
): Map<string, string | null> {
  const o = montarOrganograma(membros);
  const topo = o.presidente?.id ?? null;
  const abaixoDoTopo = o.vicePresidente?.id ?? topo;
  const resultado = new Map<string, string | null>();

  const definir = (m: MembroOrg | undefined, superior: string | null) =>
    m && resultado.set(m.id, superior);
  definir(o.presidente, null);
  definir(o.vicePresidente, topo);
  definir(o.secretaria.titular, abaixoDoTopo);
  definir(o.tesouraria.titular, abaixoDoTopo);
  definir(o.secretaria.vice, o.secretaria.titular?.id ?? abaixoDoTopo);
  definir(o.tesouraria.vice, o.tesouraria.titular?.id ?? abaixoDoTopo);
  for (const m of o.outros) resultado.set(m.id, topo);

  return resultado;
}
