import { describe, expect, it } from "vitest";
import { conviteUsuarioSchema, linkHubSchema } from "./schemas-admin";

describe("linkHubSchema", () => {
  const base = { titulo: "Site", url: "https://exemplo.com", categoria: "Redes", ordem: 1, ativo: true };
  it("normaliza categoria e aceita http(s)", () => {
    expect(linkHubSchema.parse(base).categoria).toBe("redes");
    expect(linkHubSchema.safeParse({ ...base, url: "http://exemplo.com" }).success).toBe(true);
  });
  it("rejeita esquemas perigosos", () => {
    expect(linkHubSchema.safeParse({ ...base, url: "javascript:alert(1)" }).success).toBe(false);
    expect(linkHubSchema.safeParse({ ...base, url: "ftp://exemplo.com" }).success).toBe(false);
  });
});

describe("conviteUsuarioSchema", () => {
  it("normaliza e valida e-mail e papel", () => {
    expect(conviteUsuarioSchema.parse({ nome: "Ana", email: " ANA@X.com ", papel: "editor" }).email).toBe("ana@x.com");
    expect(conviteUsuarioSchema.safeParse({ nome: "Ana", email: "ana", papel: "editor" }).success).toBe(false);
    expect(conviteUsuarioSchema.safeParse({ nome: "Ana", email: "a@x.com", papel: "root" }).success).toBe(false);
  });
});
