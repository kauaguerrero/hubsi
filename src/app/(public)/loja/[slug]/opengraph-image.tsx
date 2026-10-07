import { ImageResponse } from "next/og";
import { formatarBRL } from "@/lib/utils/money";
import { getProdutoPorSlug } from "@/server/queries/loja";

export const alt = "Produto do Hub S.I.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const produto = await getProdutoPorSlug(slug);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "linear-gradient(135deg, #ecfeff 0%, #f5f3ff 55%, #ede9fe 100%)",
          color: "#12122a",
          padding: 72,
        }}
      >
        <div style={{ display: "flex", fontSize: 40, fontWeight: 700, letterSpacing: 2 }}>
          HUB <span style={{ color: "#7c3aed", marginLeft: 12 }}>S.I.</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div style={{ display: "flex", fontSize: 84, fontWeight: 700, lineHeight: 1.05 }}>
            {produto?.nome ?? "Produto"}
          </div>
          {produto && (
            <div style={{ display: "flex", fontSize: 48, color: "#7c3aed" }}>{formatarBRL(produto.preco_centavos)}</div>
          )}
        </div>
        <div style={{ display: "flex", fontSize: 28, color: "#55587a" }}>Pré-venda do curso de Sistemas de Informação</div>
      </div>
    ),
    size,
  );
}
