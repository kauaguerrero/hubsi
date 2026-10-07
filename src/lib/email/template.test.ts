import { describe, expect, it } from "vitest";
import { assuntoConfirmacao, escaparHtml, templateConfirmacao } from "./template";

describe("template de confirmação", () => {
  const dados = {
    nome: "<b>Maria</b>",
    codigo: "HSI-ABC234",
    totalCentavos: 16500,
    itens: [{ descricao: "Camisa (P / Preta)", quantidade: 2, precoUnitario: 6500 }],
    retirada: { local: "Sala do D.A.", data: "2026-07-10T17:00:00Z" },
    urlPedido: "https://hubsi.example/pedido/HSI-ABC234",
  };

  it("escapa HTML de dados do usuário", () => {
    expect(escaparHtml(`<a href="x">&'`)).toBe("&lt;a href=&quot;x&quot;&gt;&amp;&#39;");
    const { html } = templateConfirmacao(dados);
    expect(html).not.toContain("<b>Maria</b>");
    expect(html).toContain("&lt;b&gt;Maria&lt;/b&gt;");
  });

  it("inclui código, itens, total e retirada", () => {
    const { html, texto } = templateConfirmacao(dados);
    expect(assuntoConfirmacao("HSI-ABC234")).toContain("HSI-ABC234");
    for (const t of [html, texto]) {
      expect(t).toContain("HSI-ABC234");
      expect(t).toContain("2× Camisa (P / Preta)");
      expect(t).toContain("Sala do D.A.");
    }
    expect(texto).toMatch(/Total: R\$\s165,00/);
  });

  it("sem retirada definida, avisa que será informado", () => {
    expect(templateConfirmacao({ ...dados, retirada: undefined }).texto).toContain("Avisaremos");
  });
});
