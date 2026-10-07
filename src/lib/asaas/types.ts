// Tipos baseados na documentação do Asaas API v3 (docs.asaas.com), conferida em 2026-10.

export type BillingType = "UNDEFINED" | "BOLETO" | "CREDIT_CARD" | "PIX";

export type AsaasCustomer = {
  id: string;
  name: string;
  cpfCnpj: string;
  email?: string | null;
};

export type AsaasPayment = {
  id: string;
  invoiceUrl: string | null;
  status: string;
  customer: string;
  value: number;
  dueDate: string;
  billingType: BillingType;
  externalReference?: string | null;
};

export type AsaasPixQrCode = {
  /** Imagem do QR Code em base64 (PNG). */
  encodedImage: string;
  /** Pix copia e cola. */
  payload: string;
  expirationDate: string;
};

export type NovoClienteAsaas = {
  name: string;
  cpfCnpj: string;
  email: string;
  mobilePhone?: string;
  externalReference?: string;
  notificationDisabled?: boolean;
};

export type NovaCobrancaAsaas = {
  customer: string;
  /** Em reais (decimal), não em centavos. */
  value: number;
  /** YYYY-MM-DD */
  dueDate: string;
  billingType: BillingType;
  externalReference: string;
  description: string;
};

export type AsaasLista<T> = { object: "list"; hasMore: boolean; totalCount: number; data: T[] };
