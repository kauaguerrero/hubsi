import { formatarDataHora } from "@/lib/utils/datas";
import { formatarBRL } from "@/lib/utils/money";

export type DadosConfirmacao = {
  nome: string;
  codigo: string;
  totalCentavos: number;
  itens: { descricao: string; quantidade: number; precoUnitario: number }[];
  retirada?: { local?: string | null; data?: string | null };
  urlPedido: string;
};

export function escaparHtml(texto: string): string {
  return texto
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function assuntoConfirmacao(codigo: string): string {
  return `Pagamento confirmado — pedido ${codigo}`;
}

export function templateConfirmacao(d: DadosConfirmacao): { html: string; texto: string } {
  const linhas = d.itens.map((i) => ({
    desc: `${i.quantidade}× ${i.descricao}`,
    valor: formatarBRL(i.precoUnitario * i.quantidade),
  }));
  const retirada = d.retirada && (d.retirada.local || d.retirada.data)
    ? `${d.retirada.local ?? "Local a confirmar"}${d.retirada.data ? ` · ${formatarDataHora(d.retirada.data)}` : ""}`
    : null;

  const html = `<!doctype html>
<html lang="pt-BR"><body style="margin:0;background:#0a1628;font-family:Arial,sans-serif;color:#ffffff">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:24px">
<table role="presentation" width="100%" style="max-width:560px;background:#1e3a5f;border-radius:12px;padding:24px">
<tr><td>
<p style="margin:0 0 4px;font-size:14px;color:#9fb3c8">HUB S.I.</p>
<h1 style="margin:0 0 16px;font-size:24px">Pagamento confirmado!</h1>
<p>Olá, ${escaparHtml(d.nome)}. Recebemos o pagamento do seu pedido.</p>
<p style="font-size:14px;color:#9fb3c8;margin-bottom:4px">Código do pedido</p>
<p style="font-family:monospace;font-size:28px;margin:0 0 16px">${escaparHtml(d.codigo)}</p>
<table role="presentation" width="100%" style="border-top:1px solid #2d4a73;border-bottom:1px solid #2d4a73;margin:16px 0">
${linhas
  .map(
    (l) =>
      `<tr><td style="padding:6px 0">${escaparHtml(l.desc)}</td><td align="right" style="padding:6px 0;font-family:monospace">${escaparHtml(l.valor)}</td></tr>`,
  )
  .join("\n")}
<tr><td style="padding:8px 0"><strong>Total</strong></td><td align="right" style="padding:8px 0;font-family:monospace"><strong>${escaparHtml(formatarBRL(d.totalCentavos))}</strong></td></tr>
</table>
${retirada ? `<p><strong>Retirada:</strong> ${escaparHtml(retirada)}</p>` : `<p>Avisaremos quando o pedido estiver disponível para retirada.</p>`}
<p><a href="${escaparHtml(d.urlPedido)}" style="color:#22d3ee">Acompanhar pedido</a></p>
</td></tr></table>
</td></tr></table></body></html>`;

  const texto = [
    `Pagamento confirmado — pedido ${d.codigo}`,
    `Olá, ${d.nome}. Recebemos o pagamento do seu pedido.`,
    ...linhas.map((l) => `${l.desc}  ${l.valor}`),
    `Total: ${formatarBRL(d.totalCentavos)}`,
    retirada ? `Retirada: ${retirada}` : "Avisaremos quando o pedido estiver disponível para retirada.",
    `Acompanhe: ${d.urlPedido}`,
  ].join("\n");

  return { html, texto };
}
