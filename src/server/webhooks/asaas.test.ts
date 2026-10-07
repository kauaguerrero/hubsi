import { describe, expect, it, vi } from "vitest";
import {
  proximoStatus,
  tokenValido,
  tratarWebhook,
  type AtualizacaoPedido,
  type PedidoDoWebhook,
  type WebhookRepo,
} from "./asaas";

const TOKEN = "token-de-teste-com-mais-de-trinta-e-dois-caracteres";
const PEDIDO_ID = "11111111-1111-4111-8111-111111111111";

function criarRepo(pedido: PedidoDoWebhook | null = { id: PEDIDO_ID, status: "aguardando_pagamento" }) {
  const eventos = new Set<string>();
  const atualizacoes: { id: string; esperado: string; dados: AtualizacaoPedido }[] = [];
  const resultados: Record<string, string> = {};
  const repo: WebhookRepo = {
    registrarEvento: vi.fn(async ({ id }) => {
      if (eventos.has(id)) return false;
      eventos.add(id);
      return true;
    }),
    removerEvento: vi.fn(async (id) => void eventos.delete(id)),
    registrarResultado: vi.fn(async (id, r) => void (resultados[id] = r)),
    buscarPedido: vi.fn(async () => pedido),
    atualizarPedido: vi.fn(async (id, esperado, dados) => {
      atualizacoes.push({ id, esperado, dados });
      return true;
    }),
  };
  return { repo, eventos, atualizacoes, resultados };
}

const evento = (event: string, id = "evt_1", extra: object = {}) => ({
  id,
  event,
  payment: { id: "pay_1", externalReference: PEDIDO_ID, billingType: "PIX", ...extra },
});
const chamar = (corpo: unknown, repo: WebhookRepo, token: string | null = TOKEN, notificar = vi.fn(async () => {})) =>
  tratarWebhook({ tokenRecebido: token, tokenEsperado: TOKEN, corpo }, repo, notificar, () => new Date("2026-06-10T12:00:00Z"));

describe("tokenValido", () => {
  it("aceita só o token exato", () => {
    expect(tokenValido(TOKEN, TOKEN)).toBe(true);
    expect(tokenValido(TOKEN + "x", TOKEN)).toBe(false);
    expect(tokenValido("curto", TOKEN)).toBe(false);
    expect(tokenValido(null, TOKEN)).toBe(false);
    expect(tokenValido("", "")).toBe(false);
  });
});

describe("proximoStatus", () => {
  it("segue as regras de transição", () => {
    expect(proximoStatus("aguardando_pagamento", "PAYMENT_RECEIVED")).toEqual({ status: "pago" });
    expect(proximoStatus("aguardando_pagamento", "PAYMENT_CONFIRMED")).toEqual({ status: "pago" });
    expect(proximoStatus("aguardando_pagamento", "PAYMENT_OVERDUE")).toEqual({ status: "expirado" });
    expect(proximoStatus("pago", "PAYMENT_REFUNDED")).toEqual({ status: "estornado" });
    expect(proximoStatus("pago", "PAYMENT_OVERDUE").status).toBeNull();
    expect(proximoStatus("pago", "PAYMENT_RECEIVED").status).toBeNull();
    expect(proximoStatus("cancelado", "PAYMENT_RECEIVED").status).toBeNull();
    expect(proximoStatus("aguardando_pagamento", "PAYMENT_CREATED").status).toBeNull();
  });
});

describe("tratarWebhook", () => {
  it("401 sem token ou com token errado, sem tocar no banco", async () => {
    const { repo } = criarRepo();
    expect((await chamar(evento("PAYMENT_RECEIVED"), repo, null)).status).toBe(401);
    expect((await chamar(evento("PAYMENT_RECEIVED"), repo, "errado")).status).toBe(401);
    expect(repo.registrarEvento).not.toHaveBeenCalled();
  });

  it("400 com payload inválido", async () => {
    const { repo } = criarRepo();
    expect((await chamar({ foo: 1 }, repo)).status).toBe(400);
    expect((await chamar(null, repo)).status).toBe(400);
  });

  it("pagamento confirmado: marca pago, grava pago_em e forma, e notifica", async () => {
    const { repo, atualizacoes } = criarRepo();
    const notificar = vi.fn(async () => {});
    const r = await chamar(evento("PAYMENT_RECEIVED"), repo, TOKEN, notificar);
    expect(r).toEqual({ status: 200, mensagem: "processado" });
    expect(atualizacoes).toEqual([
      {
        id: PEDIDO_ID,
        esperado: "aguardando_pagamento",
        dados: { status: "pago", pago_em: "2026-06-10T12:00:00.000Z", forma_pagamento: "pix" },
      },
    ]);
    expect(notificar).toHaveBeenCalledWith(PEDIDO_ID);
  });

  it("evento repetido: 200 sem efeito", async () => {
    const { repo, atualizacoes } = criarRepo();
    const notificar = vi.fn(async () => {});
    await chamar(evento("PAYMENT_RECEIVED"), repo, TOKEN, notificar);
    const r = await chamar(evento("PAYMENT_RECEIVED"), repo, TOKEN, notificar);
    expect(r).toEqual({ status: 200, mensagem: "evento repetido" });
    expect(atualizacoes).toHaveLength(1);
    expect(notificar).toHaveBeenCalledTimes(1);
  });

  it("estorno de pedido pago", async () => {
    const { repo, atualizacoes } = criarRepo({ id: PEDIDO_ID, status: "pago" });
    await chamar(evento("PAYMENT_REFUNDED", "evt_2"), repo);
    expect(atualizacoes[0]?.dados).toEqual({ status: "estornado" });
  });

  it("vencimento expira pedido aguardando", async () => {
    const { repo, atualizacoes } = criarRepo();
    await chamar(evento("PAYMENT_OVERDUE", "evt_3"), repo);
    expect(atualizacoes[0]?.dados).toEqual({ status: "expirado" });
  });

  it("transição inválida é ignorada e registrada", async () => {
    const { repo, atualizacoes, resultados } = criarRepo({ id: PEDIDO_ID, status: "pago" });
    const r = await chamar(evento("PAYMENT_OVERDUE", "evt_4"), repo);
    expect(r.status).toBe(200);
    expect(atualizacoes).toHaveLength(0);
    expect(resultados["evt_4"]).toMatch(/^ignorado/);
  });

  it("pedido inexistente ou referência inválida: 200 e registrado", async () => {
    const a = criarRepo(null);
    expect((await chamar(evento("PAYMENT_RECEIVED"), a.repo)).status).toBe(200);
    expect(a.resultados["evt_1"]).toMatch(/inexistente/);

    const b = criarRepo();
    expect((await chamar(evento("PAYMENT_RECEIVED", "evt_5", { externalReference: "nao-e-uuid" }), b.repo)).status).toBe(200);
    expect(b.repo.buscarPedido).not.toHaveBeenCalled();
  });

  it("falha de e-mail não derruba o webhook", async () => {
    const { repo } = criarRepo();
    const notificar = vi.fn(async () => {
      throw new Error("smtp");
    });
    expect((await chamar(evento("PAYMENT_RECEIVED"), repo, TOKEN, notificar)).status).toBe(200);
  });

  it("erro interno: 500 e libera o evento para reenvio", async () => {
    const { repo, eventos } = criarRepo();
    repo.atualizarPedido = vi.fn(async () => {
      throw new Error("db fora");
    });
    const r = await chamar(evento("PAYMENT_RECEIVED", "evt_6"), repo);
    expect(r.status).toBe(500);
    expect(eventos.has("evt_6")).toBe(false);
  });
});
