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

/** Valor de <input type="datetime-local"> ("2026-06-10T19:30") em horário de Brasília → ISO UTC. */
export function datetimeLocalParaISO(valor: string): string | null {
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(valor)) return null;
  // O Brasil não tem horário de verão desde 2019: offset fixo -03:00.
  const data = new Date(`${valor}:00-03:00`);
  return Number.isNaN(data.getTime()) ? null : data.toISOString();
}

/** ISO UTC → valor de <input type="datetime-local"> em horário de Brasília. */
export function isoParaDatetimeLocal(iso: string | null | undefined): string {
  if (!iso) return "";
  const partes = new Intl.DateTimeFormat("sv-SE", {
    timeZone: FUSO,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).format(new Date(iso));
  return partes.replace(" ", "T");
}
