import { describe, expect, it } from "vitest";
import { escaparICS, formatarUTC, gerarICS, urlGoogleAgenda } from "./calendario";

const evento = {
  slug: "workshop-git",
  titulo: "Workshop; Git, GitHub",
  descricao: "Linha 1\nLinha 2",
  local: "Lab 2",
  inicio: "2026-05-12T19:30:00.000Z",
  fim: null,
};

describe("calendario", () => {
  it("formata data em UTC compacto", () => {
    expect(formatarUTC("2026-05-12T19:30:00.123Z")).toBe("20260512T193000Z");
  });
  it("escapa caracteres especiais do ICS", () => {
    expect(escaparICS("a,b;c\\d\ne")).toBe("a\\,b\\;c\\\\d\\ne");
  });
  it("gera ICS com fim padrão de 2h e CRLF", () => {
    const ics = gerarICS(evento, new Date("2026-05-01T00:00:00Z"));
    expect(ics).toContain("DTSTART:20260512T193000Z");
    expect(ics).toContain("DTEND:20260512T213000Z");
    expect(ics).toContain("SUMMARY:Workshop\\; Git\\, GitHub");
    expect(ics).toContain("DESCRIPTION:Linha 1\\nLinha 2");
    expect(ics.split("\r\n")[0]).toBe("BEGIN:VCALENDAR");
  });
  it("monta a URL do Google Agenda", () => {
    const url = new URL(urlGoogleAgenda(evento));
    expect(url.searchParams.get("text")).toBe("Workshop; Git, GitHub");
    expect(url.searchParams.get("dates")).toBe("20260512T193000Z/20260512T213000Z");
    expect(url.searchParams.get("location")).toBe("Lab 2");
  });
});
