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

export const NAV_ADMIN: { href: string; rotulo: string; area: AreaAdmin }[] = [
  { href: "/admin", rotulo: "Painel", area: "dashboard" },
  { href: "/admin/pedidos", rotulo: "Pedidos", area: "pedidos" },
  { href: "/admin/retirada", rotulo: "Retirada", area: "retirada" },
  { href: "/admin/grafica", rotulo: "Gráfica", area: "grafica" },
  { href: "/admin/lotes", rotulo: "Lotes", area: "lotes" },
  { href: "/admin/produtos", rotulo: "Produtos", area: "produtos" },
  { href: "/admin/eventos", rotulo: "Eventos", area: "eventos" },
  { href: "/admin/destaques", rotulo: "Destaques", area: "destaques" },
  { href: "/admin/hub", rotulo: "Hub", area: "hub" },
  { href: "/admin/gestoes", rotulo: "Gestões", area: "gestoes" },
  { href: "/admin/usuarios", rotulo: "Usuários", area: "usuarios" },
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
