import { ImageResponse } from "next/og";
import { archivoFont, OG_COLORS, OG_SIZE } from "@/app/utils/og";

export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "Costa Rica Kart Championship";

export default async function OgImage() {
  const font = await archivoFont();

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          backgroundColor: OG_COLORS.ink,
          color: OG_COLORS.text,
          padding: 80,
          fontFamily: "Archivo",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          <div style={{ width: 80, height: 8, borderRadius: 4, backgroundColor: OG_COLORS.signal }} />
          <div style={{ fontSize: 26, letterSpacing: 10, color: OG_COLORS.dim }}>
            COSTA RICA KART CHAMPIONSHIP
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ display: "flex", flexDirection: "column", fontSize: 96, fontWeight: 700, lineHeight: 1 }}>
            <div>Posiciones,</div>
            <div>equipos y estadísticas</div>
          </div>
          <div style={{ fontSize: 30, color: OG_COLORS.dim }}>Temporada 2026 · a la fecha</div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              width: 14,
              height: 14,
              borderRadius: 999,
              backgroundColor: OG_COLORS.gold,
            }}
          />
          <div style={{ fontSize: 24, color: OG_COLORS.dim, letterSpacing: 4 }}>
            CAMPEONATO · EQUIPOS · CAMPEONES · ESTADÍSTICAS
          </div>
        </div>
      </div>
    ),
    { ...OG_SIZE, fonts: [font] }
  );
}
