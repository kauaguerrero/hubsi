import "server-only";
import { getAsaasEnv } from "@/lib/env.server";
import { AsaasError, AsaasIndisponivelError } from "./errors";
import type {
  AsaasCustomer,
  AsaasLista,
  AsaasPayment,
  AsaasPixQrCode,
  NovaCobrancaAsaas,
  NovoClienteAsaas,
} from "./types";

const TIMEOUT_MS = 10_000;

function lerConfig() {
  try {
    const env = getAsaasEnv();
    return { chave: env.ASAAS_API_KEY, base: env.ASAAS_BASE_URL.replace(/\/$/, "") };
  } catch {
    throw new AsaasIndisponivelError("Asaas não configurado");
  }
}

async function requisitar<T>(metodo: "GET" | "POST" | "DELETE", caminho: string, corpo?: unknown): Promise<T> {
  const { chave, base } = lerConfig();

  let resposta: Response;
  try {
    resposta = await fetch(`${base}${caminho}`, {
      method: metodo,
      headers: {
        access_token: chave,
        "Content-Type": "application/json",
        "User-Agent": "HubSI/1.0",
      },
      body: corpo === undefined ? undefined : JSON.stringify(corpo),
      signal: AbortSignal.timeout(TIMEOUT_MS),
      cache: "no-store",
    });
  } catch (e) {
    // Nunca repassar a mensagem original: pode conter detalhes da requisição.
    const timeout = e instanceof Error && (e.name === "TimeoutError" || e.name === "AbortError");
    throw new AsaasIndisponivelError(timeout ? "Tempo esgotado ao chamar o Asaas" : "Falha de rede ao chamar o Asaas");
  }

  if (!resposta.ok) {
    let codigos: string[] = [];
    let descricao = "";
    try {
      const json = (await resposta.json()) as { errors?: { code?: string; description?: string }[] };
      codigos = (json.errors ?? []).map((e) => e.code ?? "").filter(Boolean);
      descricao = (json.errors ?? []).map((e) => e.description ?? "").filter(Boolean).join("; ");
    } catch {
      // corpo não é JSON
    }
    throw new AsaasError(resposta.status, codigos, descricao);
  }

  return (await resposta.json()) as T;
}

/** GET /customers?cpfCnpj= — primeiro cliente encontrado ou null. */
export async function buscarClientePorCpf(cpf: string): Promise<AsaasCustomer | null> {
  const lista = await requisitar<AsaasLista<AsaasCustomer>>("GET", `/customers?cpfCnpj=${encodeURIComponent(cpf)}`);
  return lista.data[0] ?? null;
}

/** POST /customers */
export function criarCliente(dados: NovoClienteAsaas): Promise<AsaasCustomer> {
  return requisitar<AsaasCustomer>("POST", "/customers", dados);
}

/** POST /payments */
export function criarCobrancaAsaas(dados: NovaCobrancaAsaas): Promise<AsaasPayment> {
  return requisitar<AsaasPayment>("POST", "/payments", dados);
}

/** GET /payments/{id}/pixQrCode */
export function obterQrCodePix(paymentId: string): Promise<AsaasPixQrCode> {
  return requisitar<AsaasPixQrCode>("GET", `/payments/${encodeURIComponent(paymentId)}/pixQrCode`);
}

/** DELETE /payments/{id}. 404 (já removida) é tratado como sucesso. */
export async function cancelarCobranca(paymentId: string): Promise<void> {
  try {
    await requisitar<{ deleted: boolean }>("DELETE", `/payments/${encodeURIComponent(paymentId)}`);
  } catch (e) {
    if (e instanceof AsaasError && e.status === 404) return;
    throw e;
  }
}
