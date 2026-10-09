/** Rótulos de exibição (sempre iniciados em maiúscula) para valores de enum do banco. */
export const ROTULO_LOTE: Record<string, string> = {
  aberto: "Aberto",
  fechado: "Fechado",
  em_producao: "Em produção",
  entregue: "Entregue",
};

export const ROTULO_STATUS_EVENTO: Record<string, string> = {
  rascunho: "Rascunho",
  publicado: "Publicado",
  cancelado: "Cancelado",
};

export const ROTULO_PAPEL: Record<string, string> = {
  editor: "Editor",
  admin: "Admin",
  superadmin: "Superadmin",
};

export const ROTULO_PAGAMENTO: Record<string, string> = {
  pix: "Pix",
  cartao: "Cartão",
  indefinido: "Indefinido",
};

/** Primeira letra maiúscula, sem mexer no resto. */
export function capitalizar(texto: string): string {
  return texto.charAt(0).toLocaleUpperCase("pt-BR") + texto.slice(1);
}
