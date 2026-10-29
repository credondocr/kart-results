import { ImageResponse } from "next/og";
import { archivoFont, OG_COLORS, OG_SIZE } from "@/app/utils/og";

export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "Latinoamericano de Karting 2027 — IV Edición";

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
          <div style={{ width: 80, height: 8, borderRadius: 4, backgroundColor: OG_COLORS.gold }} />
          <div style={{ fontSize: 26, letterSpacing: 10, color: OG_COLORS.gold }}>
            IV EDICIÓN · COSTA RICA 2027
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ fontSize: 40, color: OG_COLORS.dim, fontWeight: 700 }}>
            Campeonato
          </div>
          <div style={{ fontSize: 92, fontWeight: 700, lineHeight: 1, color: OG_COLORS.signal }}>
            Latinoamericano
          </div>
          <div style={{ fontSize: 48, fontWeight: 700, color: OG_COLORS.text }}>
            de Karting 2027
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              width: 14,
              height: 14,
              borderRadius: 999,
              backgroundColor: OG_COLORS.signal,
            }}
          />
          <div style={{ fontSize: 26, color: OG_COLORS.dim, letterSpacing: 4 }}>
            7 – 9 DE MAYO · P1 SPEEDWAY, COSTA RICA
          </div>
        </div>
      </div>
    ),
    { ...OG_SIZE, fonts: [font] }
  );
}
