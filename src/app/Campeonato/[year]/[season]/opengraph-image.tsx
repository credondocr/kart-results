import { ImageResponse } from "next/og";
import { archivoFont, OG_COLORS, OG_SIZE } from "@/app/utils/og";

export const size = OG_SIZE;
export const contentType = "image/png";

const SEASON_NAMES: Record<string, string> = {
  invierno: "Invierno",
  verano: "Verano",
  general: "General",
};

interface ImageProps {
  params: Promise<{ year: string; season: string }>;
}

export async function generateAlt({ params }: ImageProps): Promise<string> {
  const { year, season } = await params;
  const label = SEASON_NAMES[season] ?? "Posiciones";
  return `Posiciones ${label} ${year} — Costa Rica Kart Championship`;
}

export default async function OgImage({ params }: ImageProps) {
  const { year, season } = await params;
  const label = SEASON_NAMES[season] ?? "Posiciones";
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
            CRKC · TABLA DE POSICIONES
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ fontSize: 110, fontWeight: 700, lineHeight: 1, textTransform: "uppercase" }}>
            {`${label} ${year}`}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
            <div
              style={{
                padding: "10px 24px",
                borderRadius: 999,
                border: `2px solid ${OG_COLORS.signal}`,
                color: OG_COLORS.signal,
                fontSize: 28,
                letterSpacing: 4,
              }}
            >
              A LA FECHA
            </div>
            <div style={{ fontSize: 28, color: OG_COLORS.dim }}>Best 4 · R1..R6 · Equipos</div>
          </div>
        </div>

        <div style={{ fontSize: 24, color: OG_COLORS.dim, letterSpacing: 4 }}>
          COSTA RICA KART CHAMPIONSHIP
        </div>
      </div>
    ),
    { ...OG_SIZE, fonts: [font] }
  );
}
