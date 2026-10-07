import { notificarPagamentoConfirmado } from "@/server/email/notificar-pagamento";
import { getAsaasEnv } from "@/lib/env.server";
import { tratarWebhook } from "@/server/webhooks/asaas";
import { criarWebhookRepo } from "@/server/webhooks/asaas-repo";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  let tokenEsperado: string;
  try {
    tokenEsperado = getAsaasEnv().ASAAS_WEBHOOK_TOKEN;
  } catch {
    // Sem token configurado nada é aceito.
    return Response.json({ ok: false }, { status: 401 });
  }

  let corpo: unknown = null;
  try {
    corpo = await req.json();
  } catch {
    // corpo inválido: tratarWebhook responde 401/400 conforme o token
  }

  const r = await tratarWebhook(
    { tokenRecebido: req.headers.get("asaas-access-token"), tokenEsperado, corpo },
    criarWebhookRepo(),
    notificarPagamentoConfirmado,
  );
  return Response.json({ ok: r.status === 200, mensagem: r.mensagem }, { status: r.status });
}
