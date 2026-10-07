export type LinhaItem = { produto: string; tamanho: string | null; cor: string | null; quantidade: number };
export type LinhaResumo = { produto: string; tamanho: string; cor: string; quantidade: number };

/** Soma as quantidades por produto/tamanho/cor. Nunca recebe nem devolve dados pessoais. */
export function resumirGrafica(itens: LinhaItem[]): LinhaResumo[] {
  const mapa = new Map<string, LinhaResumo>();
  for (const i of itens) {
    const tamanho = i.tamanho ?? "";
    const cor = i.cor ?? "";
    const chave = JSON.stringify([i.produto, tamanho, cor]);
    const atual = mapa.get(chave);
    mapa.set(chave, { produto: i.produto, tamanho, cor, quantidade: (atual?.quantidade ?? 0) + i.quantidade });
  }
  return [...mapa.values()].sort(
    (a, b) =>
      a.produto.localeCompare(b.produto, "pt-BR") ||
      a.tamanho.localeCompare(b.tamanho) ||
      a.cor.localeCompare(b.cor, "pt-BR"),
  );
}

/** Evita injeção de fórmula em planilhas (= + - @) e escapa aspas/separadores. */
export function celulaCSV(valor: string | number): string {
  let texto = String(valor);
  if (/^[=+\-@\t\r]/.test(texto)) texto = "'" + texto;
  return /[",\n\r;]/.test(texto) ? `"${texto.replace(/"/g, '""')}"` : texto;
}

export function gerarCSVGrafica(linhas: LinhaResumo[]): string {
  const cabecalho = ["Produto", "Tamanho", "Cor", "Quantidade"];
  const corpo = linhas.map((l) => [l.produto, l.tamanho, l.cor, l.quantidade].map(celulaCSV).join(","));
  const total = linhas.reduce((s, l) => s + l.quantidade, 0);
  const linhasCsv = ["﻿" + cabecalho.join(","), ...corpo, ["Total", "", "", total].map(celulaCSV).join(",")];
  return linhasCsv.join("\r\n") + "\r\n";
}
