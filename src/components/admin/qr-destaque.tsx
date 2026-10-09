"use client";

import QRCode from "qrcode";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";

type Props = {
  titulo: string;
  slug: string;
  /** URL pública absoluta que o QR abre. */
  url: string;
  cta: string;
  /** Linha de apoio sob o título (ex.: "Até 23/10"). */
  apoio?: string;
};

const W = 1080;
const H = 1528; // proporção A4

function retanguloArredondado(c: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  c.beginPath();
  c.roundRect(x, y, w, h, r);
}

function quebrarLinhas(c: CanvasRenderingContext2D, texto: string, larguraMax: number, maxLinhas: number): string[] {
  const palavras = texto.split(/\s+/);
  const linhas: string[] = [];
  let atual = "";
  for (const p of palavras) {
    const teste = atual ? `${atual} ${p}` : p;
    if (c.measureText(teste).width > larguraMax && atual) {
      linhas.push(atual);
      atual = p;
    } else {
      atual = teste;
    }
  }
  if (atual) linhas.push(atual);
  if (linhas.length > maxLinhas) {
    const cortadas = linhas.slice(0, maxLinhas);
    cortadas[maxLinhas - 1] = (cortadas[maxLinhas - 1] ?? "").replace(/\s*\S*$/, "") + "…";
    return cortadas;
  }
  return linhas;
}

function carregarImagem(src: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

async function desenhar(canvas: HTMLCanvasElement, { titulo, url, cta, apoio }: Omit<Props, "slug">) {
  const c = canvas.getContext("2d");
  if (!c) return;
  await document.fonts.ready;
  const estilo = getComputedStyle(document.body);
  const display = estilo.getPropertyValue("--font-bricolage").trim() || "system-ui";
  const sans = estilo.getPropertyValue("--font-inter").trim() || "system-ui";
  const mono = estilo.getPropertyValue("--font-jetbrains-mono").trim() || "monospace";

  canvas.width = W;
  canvas.height = H;

  // Fundo em degradê da marca
  const fundo = c.createLinearGradient(0, 0, W, H);
  fundo.addColorStop(0, "#0e7490");
  fundo.addColorStop(0.55, "#6d4ae8");
  fundo.addColorStop(1, "#7c3aed");
  c.fillStyle = fundo;
  c.fillRect(0, 0, W, H);

  // Trilhas de circuito decorativas
  c.strokeStyle = "rgba(255,255,255,0.16)";
  c.fillStyle = "rgba(255,255,255,0.28)";
  c.lineWidth = 4;
  const trilhas: Array<Array<readonly [number, number]>> = [
    [[0, 150], [160, 150], [220, 90], [420, 90]],
    [[W, 240], [W - 140, 240], [W - 200, 300], [W - 360, 300]],
    [[0, H - 210], [140, H - 210], [200, H - 150], [380, H - 150]],
    [[W, H - 120], [W - 180, H - 120], [W - 240, H - 60], [W - 440, H - 60]],
  ];
  for (const t of trilhas) {
    c.beginPath();
    const [inicio, ...resto] = t;
    if (!inicio) continue;
    c.moveTo(inicio[0], inicio[1]);
    for (const p of resto) c.lineTo(p[0], p[1]);
    c.stroke();
    c.beginPath();
    const fim = resto[resto.length - 1] ?? inicio;
    c.arc(fim[0], fim[1], 9, 0, Math.PI * 2);
    c.fill();
  }

  // Cartão branco
  const mx = 70;
  const cy = 120;
  const cw = W - mx * 2;
  const ch = H - cy - 120;
  c.save();
  c.shadowColor = "rgba(18,18,42,0.35)";
  c.shadowBlur = 60;
  c.shadowOffsetY = 24;
  c.fillStyle = "#ffffff";
  retanguloArredondado(c, mx, cy, cw, ch, 56);
  c.fill();
  c.restore();

  const cx = W / 2;
  c.textAlign = "center";
  c.textBaseline = "alphabetic";

  // Logo + wordmark
  const logo = await carregarImagem("/logo-si.png");
  let y = cy + 70;
  if (logo) {
    c.save();
    c.beginPath();
    c.arc(cx - 110, y + 36, 36, 0, Math.PI * 2);
    c.clip();
    c.drawImage(logo, cx - 146, y, 72, 72);
    c.restore();
  }
  c.fillStyle = "#12122a";
  c.font = `800 52px ${display}`;
  c.textAlign = "left";
  c.fillText("Hub ", cx - 62, y + 56);
  const larguraHub = c.measureText("Hub ").width;
  const grad = c.createLinearGradient(cx - 62 + larguraHub, 0, cx - 62 + larguraHub + 80, 0);
  grad.addColorStop(0, "#0891b2");
  grad.addColorStop(1, "#7c3aed");
  c.fillStyle = grad;
  c.fillText("S.I.", cx - 62 + larguraHub, y + 56);
  c.textAlign = "center";

  // Selo
  y += 150;
  c.font = `600 26px ${mono}`;
  const selo = "EM DESTAQUE";
  const larguraSelo = c.measureText(selo).width + 56;
  c.fillStyle = "rgba(124,58,237,0.1)";
  retanguloArredondado(c, cx - larguraSelo / 2, y - 36, larguraSelo, 54, 27);
  c.fill();
  c.fillStyle = "#7c3aed";
  c.fillText(selo, cx, y + 2);

  // Título
  y += 100;
  c.fillStyle = "#12122a";
  c.font = `800 80px ${display}`;
  const linhas = quebrarLinhas(c, titulo, cw - 140, 3);
  for (const l of linhas) {
    c.fillText(l, cx, y);
    y += 88;
  }
  if (apoio) {
    c.fillStyle = "#55587a";
    c.font = `500 32px ${mono}`;
    c.fillText(apoio, cx, y + 4);
    y += 30;
  }

  // QR code com moldura em degradê
  const qr = QRCode.create(url, { errorCorrectionLevel: "H" });
  const n = qr.modules.size;
  const moldura = 540;
  const mxQr = cx - moldura / 2;
  const myQr = y + 40;
  const borda = c.createLinearGradient(mxQr, myQr, mxQr + moldura, myQr + moldura);
  borda.addColorStop(0, "#0891b2");
  borda.addColorStop(1, "#7c3aed");
  c.fillStyle = borda;
  retanguloArredondado(c, mxQr, myQr, moldura, moldura, 48);
  c.fill();
  c.fillStyle = "#ffffff";
  retanguloArredondado(c, mxQr + 14, myQr + 14, moldura - 28, moldura - 28, 36);
  c.fill();

  const area = moldura - 28 - 56;
  const modulo = area / n;
  const ox = mxQr + 14 + 28;
  const oy = myQr + 14 + 28;
  const tracoQr = c.createLinearGradient(ox, oy, ox + area, oy + area);
  tracoQr.addColorStop(0, "#0e5f78");
  tracoQr.addColorStop(1, "#5b21b6");
  c.fillStyle = tracoQr;
  const escuro = (r: number, col: number) => r >= 0 && col >= 0 && r < n && col < n && qr.modules.get(r, col);
  const noOlho = (r: number, col: number) =>
    (r < 7 && col < 7) || (r < 7 && col >= n - 7) || (r >= n - 7 && col < 7);
  for (let r = 0; r < n; r++) {
    for (let col = 0; col < n; col++) {
      if (!escuro(r, col) || noOlho(r, col)) continue;
      // Reserva o centro para a logo
      const dist = Math.hypot(r - n / 2 + 0.5, col - n / 2 + 0.5);
      if (dist < n * 0.12) continue;
      c.beginPath();
      c.arc(ox + col * modulo + modulo / 2, oy + r * modulo + modulo / 2, modulo * 0.46, 0, Math.PI * 2);
      c.fill();
    }
  }
  // Olhos de posicionamento arredondados
  for (const [r0, c0] of [[0, 0], [0, n - 7], [n - 7, 0]] as const) {
    const x0 = ox + c0 * modulo;
    const y0 = oy + r0 * modulo;
    c.fillStyle = tracoQr;
    retanguloArredondado(c, x0, y0, modulo * 7, modulo * 7, modulo * 2);
    c.fill();
    c.fillStyle = "#ffffff";
    retanguloArredondado(c, x0 + modulo, y0 + modulo, modulo * 5, modulo * 5, modulo * 1.4);
    c.fill();
    c.fillStyle = tracoQr;
    retanguloArredondado(c, x0 + modulo * 2, y0 + modulo * 2, modulo * 3, modulo * 3, modulo);
    c.fill();
  }
  // Logo no centro
  if (logo) {
    const d = modulo * n * 0.2;
    c.fillStyle = "#ffffff";
    c.beginPath();
    c.arc(cx, myQr + moldura / 2, d / 2 + 10, 0, Math.PI * 2);
    c.fill();
    c.save();
    c.beginPath();
    c.arc(cx, myQr + moldura / 2, d / 2, 0, Math.PI * 2);
    c.clip();
    c.drawImage(logo, cx - d / 2, myQr + moldura / 2 - d / 2, d, d);
    c.restore();
  }

  // Chamada
  y = myQr + moldura + 90;
  c.fillStyle = "#12122a";
  c.font = `700 44px ${display}`;
  c.fillText("Aponte a câmera e participe", cx, y);

  // Botão visual
  y += 40;
  c.font = `700 36px ${sans}`;
  const textoCta = `${cta} →`;
  const larguraCta = Math.min(c.measureText(textoCta).width + 110, cw - 120);
  const btn = c.createLinearGradient(cx - larguraCta / 2, 0, cx + larguraCta / 2, 0);
  btn.addColorStop(0, "#0e7490");
  btn.addColorStop(1, "#7c3aed");
  c.fillStyle = btn;
  retanguloArredondado(c, cx - larguraCta / 2, y, larguraCta, 84, 42);
  c.fill();
  c.fillStyle = "#ffffff";
  c.fillText(textoCta, cx, y + 54);

  // Rodapé
  c.fillStyle = "rgba(255,255,255,0.92)";
  c.font = `500 28px ${mono}`;
  c.fillText(url.replace(/^https?:\/\//, ""), cx, H - 64);
}

export function QrDestaque({ titulo, slug, url, cta, apoio }: Props) {
  const dialogo = useRef<HTMLDialogElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const [aberto, setAberto] = useState(false);
  const [exportando, setExportando] = useState(false);

  useEffect(() => {
    if (!aberto || !canvas.current) return;
    void desenhar(canvas.current, { titulo, url, cta, apoio });
  }, [aberto, titulo, url, cta, apoio]);

  function abrir() {
    setAberto(true);
    dialogo.current?.showModal();
  }
  function fechar() {
    dialogo.current?.close();
    setAberto(false);
  }

  function baixarPng() {
    if (!canvas.current) return;
    const a = document.createElement("a");
    a.href = canvas.current.toDataURL("image/png");
    a.download = `qrcode-${slug}.png`;
    a.click();
  }

  async function baixarPdf() {
    if (!canvas.current) return;
    setExportando(true);
    try {
      const { jsPDF } = await import("jspdf");
      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const largura = pdf.internal.pageSize.getWidth();
      const altura = pdf.internal.pageSize.getHeight();
      pdf.addImage(canvas.current.toDataURL("image/jpeg", 0.95), "JPEG", 0, 0, largura, altura);
      pdf.save(`qrcode-${slug}.pdf`);
    } finally {
      setExportando(false);
    }
  }

  return (
    <>
      <Button type="button" variante="secundario" onClick={abrir}>
        Gerar QR Code
      </Button>
      <dialog
        ref={dialogo}
        onClose={() => setAberto(false)}
        onClick={(e) => e.target === dialogo.current && fechar()}
        aria-label={`QR Code de ${titulo}`}
        className="bg-surface m-auto max-h-[94vh] w-[min(94vw,560px)] overflow-y-auto rounded-3xl p-4 shadow-2xl backdrop:bg-black/60 sm:p-6"
      >
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-2xl">QR Code do destaque</h2>
            <button type="button" onClick={fechar} aria-label="Fechar" className="text-muted hover:text-accent flex size-11 items-center justify-center rounded-full text-2xl">
              ×
            </button>
          </div>
          <canvas ref={canvas} className="border-border mx-auto h-auto max-h-[62vh] w-auto max-w-full rounded-2xl border" aria-label="Prévia do cartaz com QR Code" />
          <p className="text-muted break-all text-center font-mono text-xs">{url}</p>
          <div className="flex flex-wrap justify-center gap-3">
            <Button type="button" onClick={baixarPng}>Baixar PNG</Button>
            <Button type="button" variante="secundario" onClick={baixarPdf} disabled={exportando}>
              {exportando ? "Gerando…" : "Baixar PDF"}
            </Button>
          </div>
        </div>
      </dialog>
    </>
  );
}
