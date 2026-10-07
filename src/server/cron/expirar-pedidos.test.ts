import { describe, expect, it, vi } from "vitest";
import { deveExpirar, expirarPedidos, type PedidoAguardando, type RepoCron } from "./expirar-pedidos";

const agora = new Date("2026-07-02T00:00:00Z");
const base: PedidoAguardando = { id: "a", asaas_payment_id: "pay_a", lote_status: "fechado", lote_fecha_em: "2026-07-01T00:00:00Z" };

describe("expirarPedidos", () => {
  it("decide pelo status ou prazo do lote", () => {
    expect(deveExpirar(base, agora)).toBe(true);
    expect(deveExpirar({ ...base, lote_status: "aberto", lote_fecha_em: "2026-07-03T00:00:00Z" }, agora)).toBe(false);
    expect(deveExpirar({ ...base, lote_status: "aberto" }, agora)).toBe(true);
  });

  it("cancela no Asaas e expira só os pedidos de lotes fechados", async () => {
    const pedidos: PedidoAguardando[] = [
      base,
      { ...base, id: "b", asaas_payment_id: null },
      { id: "c", asaas_payment_id: "pay_c", lote_status: "aberto", lote_fecha_em: "2026-08-01T00:00:00Z" },
    ];
    const marcados: string[] = [];
    const repo: RepoCron = { listarAguardando: async () => pedidos, marcarExpirado: async (id) => void marcados.push(id) };
    const cancelar = vi.fn(async () => {});

    expect(await expirarPedidos(repo, cancelar, agora)).toEqual({ expirados: 2, falhas: 0 });
    expect(marcados).toEqual(["a", "b"]);
    expect(cancelar).toHaveBeenCalledTimes(1);
    expect(cancelar).toHaveBeenCalledWith("pay_a");
  });

  it("não expira quando o cancelamento no Asaas falha", async () => {
    const marcados: string[] = [];
    const repo: RepoCron = { listarAguardando: async () => [base], marcarExpirado: async (id) => void marcados.push(id) };
    const r = await expirarPedidos(repo, async () => {
      throw new Error("asaas fora");
    }, agora);
    expect(r).toEqual({ expirados: 0, falhas: 1 });
    expect(marcados).toEqual([]);
  });
});
