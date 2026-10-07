import { ImageResponse } from "next/og";
import { formatarDataHora } from "@/lib/utils/datas";
import { getEventoPorSlug } from "@/server/queries/eventos";

export const alt = "Evento do Hub S.I.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const evento = await getEventoPorSlug(slug);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#0A1628",
          color: "#fff",
          padding: 72,
        }}
      >
        <div style={{ display: "flex", fontSize: 40, fontWeight: 700, letterSpacing: 2 }}>
          HUB <span style={{ color: "#22D3EE", marginLeft: 12 }}>S.I.</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div style={{ display: "flex", fontSize: 76, fontWeight: 700, lineHeight: 1.05 }}>
            {evento?.titulo ?? "Evento"}
          </div>
          {evento && (
            <div style={{ display: "flex", fontSize: 32, color: "#9FB3C8" }}>
              {formatarDataHora(evento.inicio)}
              {evento.local ? ` · ${evento.local}` : ""}
            </div>
          )}
        </div>
        <div style={{ display: "flex", height: 6, width: 240, background: "#22D3EE" }} />
      </div>
    ),
    size,
  );
}
