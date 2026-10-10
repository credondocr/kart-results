import { readFile } from "fs/promises";
import { join } from "path";
import sharp from "sharp";
import { ImageResponse } from "next/og";
import { notFound } from "next/navigation";
import { archivoFont, OG_COLORS, OG_SIZE } from "@/app/utils/og";
import { resolvePilot, prettifyTeam } from "@/app/utils/pilotProfile";
import { lookupRegistry } from "@/app/utils/pilotRegistry";
import { findPilotPhoto } from "@/app/utils/pilotPhotos";
import { getTeam } from "@/data/drivers/teams";

export const size = OG_SIZE;
export const contentType = "image/png";

interface ImageProps {
  params: Promise<{ team: string; id: string }>;
  searchParams: Promise<{ p?: string }>;
}

/** Foto /pilotos/x.webp → data URI PNG (satori no decodifica webp). */
async function photoDataUri(name: string): Promise<string | null> {
  const photo = findPilotPhoto(name);
  if (!photo) return null;
  try {
    const file = join(process.cwd(), "public", photo);
    const png = await sharp(await readFile(file))
      .resize(480, 480, { fit: "cover", position: "attention" })
      .png()
      .toBuffer();
    return `data:image/png;base64,${png.toString("base64")}`;
  } catch {
    return null;
  }
}

export async function generateAlt({ params, searchParams }: ImageProps): Promise<string> {
  const { team, id } = await params;
  const { p } = (await searchParams) ?? {};
  const hint = typeof p === "string" ? p : undefined;
  const pilot = resolvePilot((team ?? "").toLowerCase(), id, hint);
  if (!pilot) return "Piloto — Costa Rica Kart Championship";
  return `${pilot.name} (#${pilot.kartNumber}) — Costa Rica Kart Championship`;
}

export default async function OgImage({ params, searchParams }: ImageProps) {
  const { team, id } = await params;
  const { p } = (await searchParams) ?? {};
  const hint = typeof p === "string" ? p : undefined;
  const teamSlug = (team ?? "").toLowerCase();
  const pilot = resolvePilot(teamSlug, id, hint);
  if (!pilot) notFound();

  const registryEntry = lookupRegistry(pilot.name);
  const currentTeam = registryEntry?.team || pilot.teamLogo || teamSlug;
  const teamName = getTeam(currentTeam)?.name ?? prettifyTeam(currentTeam);
  const country = (registryEntry?.country || pilot.country || "").toUpperCase();
  const photo = await photoDataUri(pilot.name);

  const font = await archivoFont();

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "row",
          alignItems: "stretch",
          backgroundColor: OG_COLORS.ink,
          color: OG_COLORS.text,
          fontFamily: "Archivo",
        }}
      >
        {/* Texto */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: "64px 24px 64px 72px",
            minWidth: 0,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            <div style={{ width: 64, height: 7, borderRadius: 4, backgroundColor: OG_COLORS.signal }} />
            <div style={{ fontSize: 24, letterSpacing: 8, color: OG_COLORS.dim }}>
              {teamName.toUpperCase()}
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            <div
              style={{
                fontSize: pilot.name.length > 18 ? 68 : pilot.name.length > 12 ? 82 : 96,
                fontWeight: 700,
                lineHeight: 1,
              }}
            >
              {pilot.name}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 18, color: OG_COLORS.dim, fontSize: 32 }}>
              <div
                style={{
                  padding: "8px 22px",
                  borderRadius: 12,
                  backgroundColor: OG_COLORS.surface,
                  border: `2px solid ${OG_COLORS.signal}`,
                  color: OG_COLORS.signal,
                }}
              >
                {`#${pilot.kartNumber}`}
              </div>
              {country && <div>{country}</div>}
            </div>
          </div>

          <div style={{ fontSize: 22, color: OG_COLORS.dim, letterSpacing: 4 }}>
            COSTA RICA KART CHAMPIONSHIP
          </div>
        </div>

        {/* Foto */}
        <div
          style={{
            width: 480,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 48,
          }}
        >
          {photo ? (
            <div
              style={{
                width: 384,
                height: 384,
                borderRadius: 192,
                overflow: "hidden",
                border: `6px solid ${OG_COLORS.signal}`,
                boxShadow: "0 0 60px rgba(76,141,255,0.35)",
                display: "flex",
              }}
            >
              {/* satori: img con data URI */}
              {/* eslint-disable-next-line jsx-a11y/alt-text */}
              <img src={photo} width={384} height={384} style={{ objectFit: "cover" }} />
            </div>
          ) : (
            <div
              style={{
                width: 384,
                height: 384,
                borderRadius: 192,
                backgroundColor: OG_COLORS.surface,
                border: `6px solid ${OG_COLORS.signal}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 140,
                fontWeight: 700,
                color: OG_COLORS.signal,
              }}
            >
              #{pilot.kartNumber}
            </div>
          )}
        </div>
      </div>
    ),
    { ...OG_SIZE, fonts: [font] }
  );
}
