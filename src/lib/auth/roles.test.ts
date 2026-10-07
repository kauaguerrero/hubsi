import { beforeEach, describe, expect, it, vi } from "vitest";

const redirect = vi.fn((url: string) => {
  throw new Error(`REDIRECT:${url}`);
});
vi.mock("next/navigation", () => ({ redirect: (url: string) => redirect(url) }));

let usuario: { id: string } | null = null;
let perfil: { user_id: string; nome: string; email: string; papel: string } | null = null;
vi.mock("@/lib/supabase/server", () => ({
  createClient: async () => ({
    auth: { getUser: async () => ({ data: { user: usuario } }) },
    from: () => ({ select: () => ({ eq: () => ({ maybeSingle: async () => ({ data: perfil }) }) }) }),
  }),
}));

const { requireRole, getPerfil } = await import("./roles");

beforeEach(() => {
  usuario = null;
  perfil = null;
  redirect.mockClear();
});

const comPapel = (papel: string) => {
  usuario = { id: "u1" };
  perfil = { user_id: "u1", nome: "Fulano", email: "f@x.com", papel };
};

describe("requireRole", () => {
  it("sem sessão redireciona para o login", async () => {
    await expect(requireRole(["admin"])).rejects.toThrow("REDIRECT:/admin/login");
  });
  it("usuário logado sem perfil admin é redirecionado", async () => {
    usuario = { id: "u1" };
    await expect(requireRole(["editor", "admin", "superadmin"])).rejects.toThrow("REDIRECT:/admin/login");
    expect(await getPerfil()).toBeNull();
  });
  it("papel fora da lista é redirecionado (editor em área de admin)", async () => {
    comPapel("editor");
    await expect(requireRole(["admin", "superadmin"])).rejects.toThrow("REDIRECT:/admin/login");
  });
  it("papel permitido retorna o perfil", async () => {
    comPapel("admin");
    await expect(requireRole(["admin", "superadmin"])).resolves.toMatchObject({ userId: "u1", papel: "admin" });
    comPapel("superadmin");
    await expect(requireRole(["superadmin"])).resolves.toMatchObject({ papel: "superadmin" });
  });
});
