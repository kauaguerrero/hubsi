export type Caixa = { x: number; y: number; w: number; h: number };

/**
 * Menor retângulo que contém tudo que NÃO é fundo (branco/transparente).
 * `limiar`: canais RGB todos acima dele contam como fundo.
 */
export function caixaDoConteudo(
  rgba: Uint8ClampedArray,
  largura: number,
  altura: number,
  limiar = 240,
): Caixa | null {
  let minX = largura;
  let minY = altura;
  let maxX = -1;
  let maxY = -1;

  for (let y = 0; y < altura; y++) {
    for (let x = 0; x < largura; x++) {
      const i = (y * largura + x) * 4;
      const alfa = rgba[i + 3]!;
      const menorCanal = Math.min(rgba[i]!, rgba[i + 1]!, rgba[i + 2]!);
      if (alfa > 10 && menorCanal < limiar) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }
  return maxX < 0
    ? null
    : { x: minX, y: minY, w: maxX - minX + 1, h: maxY - minY + 1 };
}

/** Expande a caixa com uma margem proporcional, sem sair da imagem. */
export function comMargem(
  c: Caixa,
  largura: number,
  altura: number,
  proporcao = 0.06,
): Caixa {
  const pad = Math.round(Math.max(c.w, c.h) * proporcao);
  const x = Math.max(0, c.x - pad);
  const y = Math.max(0, c.y - pad);
  return {
    x,
    y,
    w: Math.min(largura, c.x + c.w + pad) - x,
    h: Math.min(altura, c.y + c.h + pad) - y,
  };
}

/** Deixa o fundo branco transparente (rampa suave para não serrilhar as bordas). */
export function brancoParaTransparente(rgba: Uint8ClampedArray): void {
  for (let i = 0; i < rgba.length; i += 4) {
    const menor = Math.min(rgba[i]!, rgba[i + 1]!, rgba[i + 2]!);
    if (menor >= 250) rgba[i + 3] = 0;
    else if (menor > 225)
      rgba[i + 3] = Math.round(((250 - menor) / 25) * rgba[i + 3]!);
  }
}

/**
 * (Navegador) Recorta as margens vazias de um logo e torna o fundo branco transparente.
 * Devolve um PNG. Se não achar conteúdo, devolve o arquivo original.
 */
export async function recortarMargens(
  arquivo: File,
  ladoMax = 1024,
): Promise<File> {
  const bitmap = await createImageBitmap(arquivo);
  const escala = Math.min(1, ladoMax / Math.max(bitmap.width, bitmap.height));
  const w = Math.round(bitmap.width * escala);
  const h = Math.round(bitmap.height * escala);

  const origem = new OffscreenCanvas(w, h);
  const ctx = origem.getContext("2d");
  if (!ctx) return arquivo;
  ctx.drawImage(bitmap, 0, 0, w, h);
  const pixels = ctx.getImageData(0, 0, w, h);

  const caixa = caixaDoConteudo(pixels.data, w, h);
  if (!caixa) return arquivo;
  const c = comMargem(caixa, w, h);

  const recorte = ctx.getImageData(c.x, c.y, c.w, c.h);
  brancoParaTransparente(recorte.data);

  const destino = new OffscreenCanvas(c.w, c.h);
  destino.getContext("2d")?.putImageData(recorte, 0, 0);
  const blob = await destino.convertToBlob({ type: "image/png" });
  return new File([blob], arquivo.name.replace(/\.[^.]+$/, "") + ".png", {
    type: "image/png",
  });
}
