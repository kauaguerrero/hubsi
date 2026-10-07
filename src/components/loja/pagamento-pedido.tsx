import { obterQrCodePix } from "@/lib/asaas/client";
import { ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/display";
import type { AsaasPixQrCode } from "@/lib/asaas/types";
import { CopiarPix } from "./copiar-pix";
import { PollingStatus } from "./polling-status";

type Props = {
  codigo: string;
  status: string;
  paymentId: string | null;
  invoiceUrl: string | null;
  aceitaCartao: boolean;
};

/** Instruções de pagamento de um pedido aguardando: QR Pix, copia e cola e link de cartão. */
export async function PagamentoPedido({ codigo, status, paymentId, invoiceUrl, aceitaCartao }: Props) {
  let qr: AsaasPixQrCode | null = null;
  if (paymentId) {
    try {
      qr = await obterQrCodePix(paymentId);
    } catch {
      qr = null; // mostra só o link da fatura
    }
  }

  return (
    <Card className="flex flex-col gap-6">
      <PollingStatus codigo={codigo} statusAtual={status} />
      <h2 className="text-2xl">Pagamento</h2>

      {qr ? (
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
          {/* QR em base64 vindo do Asaas: <img> simples, sem otimização do Next. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`data:image/png;base64,${qr.encodedImage}`}
            alt="QR Code Pix para pagar o pedido"
            width={208}
            height={208}
            className="rounded-lg bg-white p-2"
          />
          <div className="w-full flex-1">
            <CopiarPix codigo={qr.payload} />
          </div>
        </div>
      ) : (
        <p className="text-muted">Não foi possível exibir o QR Code agora. Use o link de pagamento abaixo.</p>
      )}

      {invoiceUrl && (
        <div className="flex flex-col gap-2">
          <ButtonLink href={invoiceUrl} target="_blank" rel="noopener noreferrer" variante={qr ? "secundario" : "primario"}>
            {aceitaCartao ? "Pagar com cartão ou Pix" : "Abrir link de pagamento"}
          </ButtonLink>
        </div>
      )}

      <p className="text-sm text-muted">Esta página atualiza sozinha quando o pagamento for confirmado.</p>
    </Card>
  );
}
