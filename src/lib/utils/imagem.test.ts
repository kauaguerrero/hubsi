import { describe, expect, it } from "vitest";
import { brancoParaTransparente, caixaDoConteudo, comMargem } from "./imagem";

/** Imagem w×h toda branca, com um bloco escuro opcional. */
function imagem(
  w: number,
  h: number,
  bloco?: { x: number; y: number; w: number; h: number },
) {
  const d = new Uint8ClampedArray(w * h * 4).fill(255);
  if (bloco) {
    for (let y = bloco.y; y < bloco.y + bloco.h; y++) {
      for (let x = bloco.x; x < bloco.x + bloco.w; x++) {
        const i = (y * w + x) * 4;
        d[i] = 20;
        d[i + 1] = 40;
        d[i + 2] = 90;
      }
    }
  }
  return d;
}

describe("caixaDoConteudo", () => {
  it("acha o retângulo do conteúdo ignorando o fundo branco", () => {
    const d = imagem(100, 100, { x: 10, y: 40, w: 80, h: 20 });
    expect(caixaDoConteudo(d, 100, 100)).toEqual({
      x: 10,
      y: 40,
      w: 80,
      h: 20,
    });
  });
  it("imagem toda branca ou transparente não tem conteúdo", () => {
    expect(caixaDoConteudo(imagem(10, 10), 10, 10)).toBeNull();
    expect(
      caixaDoConteudo(new Uint8ClampedArray(10 * 10 * 4), 10, 10),
    ).toBeNull();
  });
});

describe("comMargem", () => {
  it("adiciona margem proporcional sem sair da imagem", () => {
    expect(comMargem({ x: 10, y: 40, w: 80, h: 20 }, 100, 100, 0.1)).toEqual({
      x: 2,
      y: 32,
      w: 96,
      h: 36,
    });
    expect(comMargem({ x: 0, y: 0, w: 100, h: 100 }, 100, 100, 0.1)).toEqual({
      x: 0,
      y: 0,
      w: 100,
      h: 100,
    });
  });
});

describe("brancoParaTransparente", () => {
  it("zera o alfa do branco, preserva o escuro e suaviza tons intermediários", () => {
    const px = new Uint8ClampedArray([
      255, 255, 255, 255, 20, 40, 90, 255, 238, 238, 238, 255,
    ]);
    brancoParaTransparente(px);
    expect(px[3]).toBe(0);
    expect(px[7]).toBe(255);
    expect(px[11]).toBeGreaterThan(0);
    expect(px[11]).toBeLessThan(255);
  });
});
