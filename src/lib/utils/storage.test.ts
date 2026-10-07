import { describe, expect, it } from "vitest";
import { caminhoNoStorage } from "./storage";

const base = "https://abc.supabase.co";

describe("caminhoNoStorage", () => {
  it("aceita URL do bucket certo", () => {
    expect(caminhoNoStorage(`${base}/storage/v1/object/public/produtos/p1/a.png`, base, "produtos")).toBe("p1/a.png");
  });
  it("rejeita outro host, outro bucket e path traversal", () => {
    expect(caminhoNoStorage("https://evil.com/storage/v1/object/public/produtos/a.png", base, "produtos")).toBeNull();
    expect(caminhoNoStorage(`${base}/storage/v1/object/public/eventos/a.png`, base, "produtos")).toBeNull();
    expect(caminhoNoStorage(`${base}/storage/v1/object/public/produtos/../x.png`, base, "produtos")).toBeNull();
  });
});
