import { lerCarrinhoSalvo, type ItemCarrinho } from "./carrinho";

const CHAVE = "hubsi:carrinho";
const VAZIO: ItemCarrinho[] = [];

// Store em módulo, consumida via useSyncExternalStore (seguro para hidratação).
let estado: ItemCarrinho[] | null = null;
const ouvintes = new Set<() => void>();

export function getSnapshot(): ItemCarrinho[] {
  if (estado === null) {
    try {
      estado = lerCarrinhoSalvo(sessionStorage.getItem(CHAVE));
    } catch {
      // sessionStorage indisponível (modo privado/bloqueio): carrinho só em memória
      estado = [];
    }
  }
  return estado;
}

export const getServerSnapshot = (): ItemCarrinho[] => VAZIO;

export function subscribe(ouvinte: () => void): () => void {
  ouvintes.add(ouvinte);
  return () => {
    ouvintes.delete(ouvinte);
  };
}

export function definirItens(novos: ItemCarrinho[]): void {
  estado = novos;
  try {
    sessionStorage.setItem(CHAVE, JSON.stringify(novos));
  } catch {
    // sem persistência; segue em memória
  }
  ouvintes.forEach((o) => o());
}
