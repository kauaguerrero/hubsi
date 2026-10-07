/** Integração indisponível (sem configuração, rede, timeout). Mensagens nunca incluem a chave. */
export class AsaasIndisponivelError extends Error {
  constructor(mensagem = "Integração com o Asaas indisponível") {
    super(mensagem);
    this.name = "AsaasIndisponivelError";
  }
}

/** Resposta de erro da API do Asaas (4xx/5xx). */
export class AsaasError extends Error {
  readonly status: number;
  readonly codigos: string[];

  constructor(status: number, codigos: string[], descricao: string) {
    super(`Asaas respondeu ${status}${descricao ? `: ${descricao}` : ""}`);
    this.name = "AsaasError";
    this.status = status;
    this.codigos = codigos;
  }
}
