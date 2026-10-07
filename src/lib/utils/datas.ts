const FUSO = "America/Sao_Paulo";

function paraDate(valor: string | Date): Date {
  return valor instanceof Date ? valor : new Date(valor);
}

export function formatarData(valor: string | Date): string {
  return new Intl.DateTimeFormat("pt-BR", { dateStyle: "long", timeZone: FUSO }).format(paraDate(valor));
}

export function formatarDataCurta(valor: string | Date): string {
  return new Intl.DateTimeFormat("pt-BR", { timeZone: FUSO }).format(paraDate(valor));
}

export function formatarHora(valor: string | Date): string {
  return new Intl.DateTimeFormat("pt-BR", { timeStyle: "short", timeZone: FUSO }).format(paraDate(valor));
}

export function formatarDataHora(valor: string | Date): string {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "long",
    timeStyle: "short",
    timeZone: FUSO,
  }).format(paraDate(valor));
}

/** "YYYY-MM-DD" no fuso de São Paulo (usado em `dueDate` do Asaas). */
export function dataISOLocal(valor: string | Date): string {
  return new Intl.DateTimeFormat("sv-SE", { timeZone: FUSO }).format(paraDate(valor));
}
