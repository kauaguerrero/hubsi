const DUAS_HORAS_MS = 2 * 60 * 60 * 1000;

type EventoCal = {
  slug: string;
  titulo: string;
  descricao?: string | null;
  local?: string | null;
  inicio: string | Date;
  fim?: string | Date | null;
};

/** 20260512T193000Z */
export function formatarUTC(valor: string | Date): string {
  return new Date(valor).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

function intervalo(e: EventoCal): [Date, Date] {
  const inicio = new Date(e.inicio);
  return [inicio, e.fim ? new Date(e.fim) : new Date(inicio.getTime() + DUAS_HORAS_MS)];
}

export function urlGoogleAgenda(e: EventoCal): string {
  const [inicio, fim] = intervalo(e);
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: e.titulo,
    dates: `${formatarUTC(inicio)}/${formatarUTC(fim)}`,
  });
  if (e.descricao) params.set("details", e.descricao);
  if (e.local) params.set("location", e.local);
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

/** Escapa texto conforme RFC 5545 (\\, ;, , e quebras de linha). */
export function escaparICS(texto: string): string {
  return texto.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\r?\n/g, "\\n");
}

export function gerarICS(e: EventoCal, agora = new Date()): string {
  const [inicio, fim] = intervalo(e);
  const linhas = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Hub S.I.//Eventos//PT-BR",
    "CALSCALE:GREGORIAN",
    "BEGIN:VEVENT",
    `UID:${e.slug}@hubsi`,
    `DTSTAMP:${formatarUTC(agora)}`,
    `DTSTART:${formatarUTC(inicio)}`,
    `DTEND:${formatarUTC(fim)}`,
    `SUMMARY:${escaparICS(e.titulo)}`,
  ];
  if (e.descricao) linhas.push(`DESCRIPTION:${escaparICS(e.descricao)}`);
  if (e.local) linhas.push(`LOCATION:${escaparICS(e.local)}`);
  linhas.push("END:VEVENT", "END:VCALENDAR");
  return linhas.join("\r\n") + "\r\n";
}
