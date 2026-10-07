import { randomInt } from "node:crypto";

/** Sem 0/O/1/I para evitar confusão ao ditar o código. */
export const ALFABETO_CODIGO = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
export const REGEX_CODIGO_PEDIDO = /^HSI-[A-HJ-NP-Z2-9]{6}$/;

export function gerarCodigoPedido(): string {
  let sufixo = "";
  for (let i = 0; i < 6; i++) {
    sufixo += ALFABETO_CODIGO.charAt(randomInt(ALFABETO_CODIGO.length));
  }
  return `HSI-${sufixo}`;
}

/** Normaliza entrada do usuário ("hsi-ab2cd3 " → "HSI-AB2CD3"). */
export function normalizarCodigoPedido(valor: string): string {
  return valor.trim().toUpperCase();
}

export function codigoPedidoValido(valor: string): boolean {
  return REGEX_CODIGO_PEDIDO.test(normalizarCodigoPedido(valor));
}
