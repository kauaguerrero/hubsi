const brl = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

/** Centavos (inteiro) → "R$ 1.234,56". */
export function formatarBRL(centavos: number): string {
  return brl.format(centavos / 100);
}

/** Reais (decimal, ex.: vindo de um input) → centavos inteiros. */
export function reaisParaCentavos(reais: number): number {
  return Math.round(reais * 100);
}

/** Centavos → reais (decimal), para APIs externas como o Asaas. */
export function centavosParaReais(centavos: number): number {
  return Math.round(centavos) / 100;
}

/** Aceita "12,50", "R$ 1.234,56" ou "12.5" e devolve centavos; null se inválido. */
export function parseBRLParaCentavos(texto: string): number | null {
  const limpo = texto.replace(/[R$\s]/g, "");
  if (!limpo) return null;
  const normalizado = limpo.includes(",") ? limpo.replace(/\./g, "").replace(",", ".") : limpo;
  if (!/^\d+(\.\d{1,2})?$/.test(normalizado)) return null;
  return reaisParaCentavos(Number(normalizado));
}
