import { describe, expect, it } from "vitest";
import { NAV_ADMIN, paginaInicial, podeAcessar, podeAlterarUsuario } from "./permissoes";

describe("podeAcessar", () => {
  it("editor não acessa pedidos, clientes, lotes, produtos nem usuários", () => {
    for (const area of ["pedidos", "retirada", "grafica", "lotes", "produtos", "gestoes", "usuarios", "dashboard"] as const) {
      expect(podeAcessar("editor", area)).toBe(false);
    }
    expect(podeAcessar("editor", "eventos")).toBe(true);
    expect(podeAcessar("editor", "hub")).toBe(true);
  });
  it("admin acessa tudo menos usuários; superadmin acessa tudo", () => {
    expect(podeAcessar("admin", "pedidos")).toBe(true);
    expect(podeAcessar("admin", "usuarios")).toBe(false);
    for (const item of NAV_ADMIN) expect(podeAcessar("superadmin", item.area)).toBe(true);
  });
  it("sem papel não acessa nada", () => {
    expect(podeAcessar(null, "eventos")).toBe(false);
    expect(podeAcessar(undefined, "hub")).toBe(false);
  });
  it("página inicial depende do papel", () => {
    expect(paginaInicial("editor")).toBe("/admin/eventos");
    expect(paginaInicial("admin")).toBe("/admin");
  });
});

describe("podeAlterarUsuario", () => {
  const base = { alvoId: "u1", executorId: "u2" };
  it("bloqueia remover ou rebaixar o último superadmin", () => {
    expect(podeAlterarUsuario({ ...base, alvoPapel: "superadmin", acao: "remover", totalSuperadmins: 1 }).ok).toBe(false);
    expect(
      podeAlterarUsuario({ ...base, alvoPapel: "superadmin", acao: { novoPapel: "admin" }, totalSuperadmins: 1 }).ok,
    ).toBe(false);
  });
  it("permite quando há outro superadmin", () => {
    expect(podeAlterarUsuario({ ...base, alvoPapel: "superadmin", acao: "remover", totalSuperadmins: 2 }).ok).toBe(true);
    expect(
      podeAlterarUsuario({ ...base, alvoPapel: "superadmin", acao: { novoPapel: "superadmin" }, totalSuperadmins: 1 }).ok,
    ).toBe(true);
  });
  it("bloqueia remover a si mesmo e libera mexer em não superadmin", () => {
    expect(podeAlterarUsuario({ alvoId: "u1", executorId: "u1", alvoPapel: "admin", acao: "remover", totalSuperadmins: 3 }).ok).toBe(false);
    expect(podeAlterarUsuario({ ...base, alvoPapel: "editor", acao: "remover", totalSuperadmins: 1 }).ok).toBe(true);
  });
});
