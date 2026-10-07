import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { buscarClientePorCpf, cancelarCobranca, criarCobrancaAsaas, obterQrCodePix } from "./client";
import { billingTypeDoPedido, criarCobranca } from "./cobranca";
import { AsaasError, AsaasIndisponivelError } from "./errors";

const CHAVE = "chave-secreta-de-teste";
const resposta = (corpo: unknown, status = 200) =>
  new Response(JSON.stringify(corpo), { status, headers: { "Content-Type": "application/json" } });

beforeEach(() => {
  vi.stubEnv("ASAAS_API_KEY", CHAVE);
  vi.stubEnv("ASAAS_BASE_URL", "https://api-sandbox.asaas.com/v3");
  vi.stubEnv("ASAAS_WEBHOOK_TOKEN", "t".repeat(40));
});
afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe("asaas client", () => {
  it("envia access_token e chama a URL correta", async () => {
    const fetchMock = vi.fn().mockResolvedValue(resposta({ data: [{ id: "cus_1", name: "A", cpfCnpj: "1" }] }));
    vi.stubGlobal("fetch", fetchMock);

    const cliente = await buscarClientePorCpf("52998224725");
    expect(cliente?.id).toBe("cus_1");
    const [url, init] = fetchMock.mock.calls[0]!;
    expect(url).toBe("https://api-sandbox.asaas.com/v3/customers?cpfCnpj=52998224725");
    expect((init as RequestInit).headers).toMatchObject({ access_token: CHAVE });
  });

  it("devolve null quando não há cliente", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(resposta({ data: [] })));
    expect(await buscarClientePorCpf("1")).toBeNull();
  });

  it("converte erro HTTP em AsaasError sem vazar a chave", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(resposta({ errors: [{ code: "invalid_action", description: "Inválido" }] }, 400)),
    );
    const erro = await criarCobrancaAsaas({
      customer: "cus_1",
      value: 10,
      dueDate: "2026-12-01",
      billingType: "PIX",
      externalReference: "x",
      description: "d",
    }).catch((e: unknown) => e);
    expect(erro).toBeInstanceOf(AsaasError);
    expect((erro as AsaasError).status).toBe(400);
    expect((erro as AsaasError).codigos).toEqual(["invalid_action"]);
    expect(String((erro as Error).message)).not.toContain(CHAVE);
  });

  it("erro de rede vira AsaasIndisponivelError sem a mensagem original", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error(`falha com ${CHAVE}`)));
    const erro = await obterQrCodePix("pay_1").catch((e: unknown) => e);
    expect(erro).toBeInstanceOf(AsaasIndisponivelError);
    expect(String((erro as Error).message)).not.toContain(CHAVE);
  });

  it("sem configuração lança AsaasIndisponivelError", async () => {
    vi.stubEnv("ASAAS_API_KEY", "");
    await expect(obterQrCodePix("pay_1")).rejects.toBeInstanceOf(AsaasIndisponivelError);
  });

  it("cancelar cobrança já removida (404) é sucesso", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(resposta({ errors: [] }, 404)));
    await expect(cancelarCobranca("pay_1")).resolves.toBeUndefined();
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(resposta({ errors: [] }, 500)));
    await expect(cancelarCobranca("pay_1")).rejects.toBeInstanceOf(AsaasError);
  });
});

describe("criarCobranca", () => {
  const pedido = {
    id: "ped-uuid",
    codigo: "HSI-ABC234",
    totalCentavos: 16500,
    vencimento: "2026-12-01",
    aceitaCartao: true,
    cliente: { nome: "Maria Silva", cpf: "52998224725", email: "m@x.com", whatsapp: "11912345678", asaasCustomerId: null },
  };

  it("cria cliente, converte centavos em reais e usa o id do pedido como externalReference", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(resposta({ data: [] }))
      .mockResolvedValueOnce(resposta({ id: "cus_9" }))
      .mockResolvedValueOnce(resposta({ id: "pay_9", invoiceUrl: "https://asaas.com/i/9" }));
    vi.stubGlobal("fetch", fetchMock);

    const r = await criarCobranca(pedido);
    expect(r).toEqual({ customerId: "cus_9", paymentId: "pay_9", invoiceUrl: "https://asaas.com/i/9" });
    const corpo = JSON.parse((fetchMock.mock.calls[2]![1] as RequestInit).body as string);
    expect(corpo).toMatchObject({
      customer: "cus_9",
      value: 165,
      dueDate: "2026-12-01",
      billingType: "UNDEFINED",
      externalReference: "ped-uuid",
    });
  });

  it("reaproveita o cliente já salvo e pede só Pix quando não aceita cartão", async () => {
    const fetchMock = vi.fn().mockResolvedValueOnce(resposta({ id: "pay_1", invoiceUrl: null }));
    vi.stubGlobal("fetch", fetchMock);
    await criarCobranca({ ...pedido, aceitaCartao: false, cliente: { ...pedido.cliente, asaasCustomerId: "cus_old" } });
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const corpo = JSON.parse((fetchMock.mock.calls[0]![1] as RequestInit).body as string);
    expect(corpo).toMatchObject({ customer: "cus_old", billingType: "PIX" });
    expect(billingTypeDoPedido(true)).toBe("UNDEFINED");
  });
});
