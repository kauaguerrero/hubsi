import { describe, expect, it } from "vitest";
import { eventoSchema, loteSchema, pedidoSchema, whatsappSchema } from "./schemas";

const item = { produtoId: "00000000-0000-4000-8000-000000000020", variacaoId: null, quantidade: 2 };
const base = {
  nome: "Maria Silva",
  cpf: "529.982.247-25",
  email: "  Maria@Exemplo.COM ",
  whatsapp: "(11) 91234-5678",
  turma: "SI 1o ano",
  itens: [item],
  aceitePrivacidade: true as const,
};

describe("pedidoSchema", () => {
  it("normaliza campos válidos", () => {
    const r = pedidoSchema.parse(base);
    expect(r.cpf).toBe("52998224725");
    expect(r.email).toBe("maria@exemplo.com");
    expect(r.whatsapp).toBe("11912345678");
  });
  it("rejeita CPF inválido", () => {
    expect(pedidoSchema.safeParse({ ...base, cpf: "111.111.111-11" }).success).toBe(false);
  });
  it("exige aceite de privacidade", () => {
    expect(pedidoSchema.safeParse({ ...base, aceitePrivacidade: false }).success).toBe(false);
  });
  it("rejeita carrinho vazio, quantidade inválida e nome sem sobrenome", () => {
    expect(pedidoSchema.safeParse({ ...base, itens: [] }).success).toBe(false);
    expect(pedidoSchema.safeParse({ ...base, itens: [{ ...item, quantidade: 0 }] }).success).toBe(false);
    expect(pedidoSchema.safeParse({ ...base, nome: "Maria" }).success).toBe(false);
  });
  it("rejeita e-mail inválido", () => {
    expect(pedidoSchema.safeParse({ ...base, email: "maria@" }).success).toBe(false);
  });
});

describe("whatsappSchema", () => {
  it("aceita +55 e fixo; rejeita lixo", () => {
    expect(whatsappSchema.parse("+55 (11) 91234-5678")).toBe("11912345678");
    expect(whatsappSchema.parse("(11) 3456-7890")).toBe("1134567890");
    expect(whatsappSchema.safeParse("12345").success).toBe(false);
    expect(whatsappSchema.safeParse("(00) 91234-5678").success).toBe(false);
  });
});

describe("evento e lote", () => {
  it("rejeita fim antes do início", () => {
    const ev = {
      slug: "x-y",
      titulo: "T",
      tipo: "palestra",
      status: "rascunho",
      inicio: "2026-05-02",
      fim: "2026-05-01",
    };
    expect(eventoSchema.safeParse(ev).success).toBe(false);
    expect(eventoSchema.safeParse({ ...ev, fim: "2026-05-03" }).success).toBe(true);
  });
  it("rejeita fechamento antes da abertura", () => {
    const l = { nome: "L1", status: "aberto", abreEm: "2026-05-02", fechaEm: "2026-05-01" };
    expect(loteSchema.safeParse(l).success).toBe(false);
  });
});
