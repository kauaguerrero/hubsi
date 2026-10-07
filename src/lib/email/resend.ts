import "server-only";
import { Resend } from "resend";
import { getEmailEnv } from "@/lib/env.server";
import { assuntoConfirmacao, templateConfirmacao, type DadosConfirmacao } from "./template";

/**
 * Envia o e-mail de confirmação. Sem RESEND_API_KEY/EMAIL_FROM, apenas loga em dev
 * (nunca o conteúdo completo, para não vazar dados pessoais nos logs).
 */
export async function enviarConfirmacaoPedido(para: string, dados: DadosConfirmacao): Promise<void> {
  const { RESEND_API_KEY, EMAIL_FROM } = getEmailEnv();
  const assunto = assuntoConfirmacao(dados.codigo);

  if (!RESEND_API_KEY || !EMAIL_FROM) {
    if (process.env.NODE_ENV !== "production") {
      console.log(`[email:dev] sem Resend configurado; e-mail "${assunto}" não enviado.`);
    }
    return;
  }

  const { html, texto } = templateConfirmacao(dados);
  const { error } = await new Resend(RESEND_API_KEY).emails.send({
    from: EMAIL_FROM,
    to: para,
    subject: assunto,
    html,
    text: texto,
  });
  if (error) throw new Error(`Resend: ${error.name}`);
}
