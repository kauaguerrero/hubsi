import type { PapelAdmin } from "./roles";

export type AreaAdmin =
  | "dashboard"
  | "lotes"
  | "produtos"
  | "pedidos"
  | "grafica"
  | "retirada"
  | "eventos"
  | "destaques"
  | "hub"
  | "gestoes"
  | "usuarios";

const ADMINS: PapelAdmin[] = ["admin", "superadmin"];
const TODOS: PapelAdmin[] = ["editor", "admin", "superadmin"];

/** Quem acessa cada área. Espelha as policies de RLS (a RLS é a barreira real). */
export const PAPEIS_POR_AREA: Record<AreaAdmin, readonly PapelAdmin[]> = {
  dashboard: ADMINS,
  lotes: ADMINS,
  produtos: ADMINS,
  pedidos: ADMINS,
  grafica: ADMINS,
  retirada: ADMINS,
  eventos: TODOS,
  destaques: ADMINS,
  hub: TODOS,
  gestoes: ADMINS,
  usuarios: ["superadmin"],
};

export function podeAcessar(papel: PapelAdmin | null | undefined, area: AreaAdmin): boolean {
  return !!papel && PAPEIS_POR_AREA[area].includes(papel);
}

export type ItemNav = { href: string; rotulo: string; area: AreaAdmin; grupo: string; icone: string };

export const NAV_ADMIN: ItemNav[] = [
  { href: "/admin", rotulo: "Painel", area: "dashboard", grupo: "Visão geral", icone: "painel" },
  { href: "/admin/pedidos", rotulo: "Pedidos", area: "pedidos", grupo: "Loja", icone: "pedidos" },
  { href: "/admin/retirada", rotulo: "Retirada", area: "retirada", grupo: "Loja", icone: "retirada" },
  { href: "/admin/grafica", rotulo: "Gráfica", area: "grafica", grupo: "Loja", icone: "grafica" },
  { href: "/admin/lotes", rotulo: "Lotes", area: "lotes", grupo: "Loja", icone: "lotes" },
  { href: "/admin/produtos", rotulo: "Produtos", area: "produtos", grupo: "Loja", icone: "produtos" },
  { href: "/admin/eventos", rotulo: "Eventos", area: "eventos", grupo: "Conteúdo", icone: "eventos" },
  { href: "/admin/destaques", rotulo: "Destaques", area: "destaques", grupo: "Conteúdo", icone: "destaques" },
  { href: "/admin/hub", rotulo: "Hub", area: "hub", grupo: "Conteúdo", icone: "hub" },
  { href: "/admin/gestoes", rotulo: "Gestões", area: "gestoes", grupo: "Conteúdo", icone: "gestoes" },
  { href: "/admin/usuarios", rotulo: "Usuários", area: "usuarios", grupo: "Sistema", icone: "usuarios" },
];

/** Primeira página que o papel pode abrir (editor não vê o painel). */
export function paginaInicial(papel: PapelAdmin): string {
  return podeAcessar(papel, "dashboard") ? "/admin" : "/admin/eventos";
}

/** Impede remover/rebaixar o último superadmin e a si mesmo ao remover. */
export function podeAlterarUsuario(params: {
  alvoId: string;
  alvoPapel: PapelAdmin;
  acao: "remover" | { novoPapel: PapelAdmin };
  executorId: string;
  totalSuperadmins: number;
}): { ok: true } | { ok: false; erro: string } {
  const { alvoId, alvoPapel, acao, executorId, totalSuperadmins } = params;
  if (acao === "remover" && alvoId === executorId) {
    return { ok: false, erro: "Você não pode remover o próprio acesso." };
  }
  const perdeSuperadmin = alvoPapel === "superadmin" && (acao === "remover" || acao.novoPapel !== "superadmin");
  if (perdeSuperadmin && totalSuperadmins <= 1) {
    return { ok: false, erro: "Não é possível remover ou rebaixar o último superadmin." };
  }
  return { ok: true };
}
