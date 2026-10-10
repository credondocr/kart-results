import { ImageResponse } from "next/og";
import { notFound } from "next/navigation";
import { archivoFont, OG_COLORS, OG_SIZE } from "@/app/utils/og";
import { resolvePilot, prettifyTeam } from "@/app/utils/pilotProfile";
import { lookupRegistry } from "@/app/utils/pilotRegistry";
import { getTeam } from "@/data/drivers/teams";

export const size = OG_SIZE;
export const contentType = "image/png";

interface ImageProps {
  params: Promise<{ team: string; id: string }>;
}

export async function generateAlt({ params }: ImageProps): Promise<string> {
  const { team, id } = await params;
  const pilot = resolvePilot((team ?? "").toLowerCase(), id);
  if (!pilot) return "Piloto — Costa Rica Kart Championship";
  return `${pilot.name} (#${pilot.kartNumber}) — Costa Rica Kart Championship`;
}

export default async function OgImage({ params }: ImageProps) {
  const { team, id } = await params;
  const teamSlug = (team ?? "").toLowerCase();
  const pilot = resolvePilot(teamSlug, id);
  if (!pilot) notFound();

  const registryEntry = lookupRegistry(pilot.name);
  const currentTeam = registryEntry?.team || pilot.teamLogo || teamSlug;
  const teamName = getTeam(currentTeam)?.name ?? prettifyTeam(currentTeam);
  const country = (registryEntry?.country || pilot.country || "").toUpperCase();

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
            {teamName.toUpperCase()}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
          <div
            style={{
              fontSize: pilot.name.length > 20 ? 76 : 96,
              fontWeight: 700,
              lineHeight: 1,
            }}
          >
            {pilot.name}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 20, color: OG_COLORS.dim, fontSize: 34 }}>
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

        <div style={{ fontSize: 24, color: OG_COLORS.dim, letterSpacing: 4 }}>
          COSTA RICA KART CHAMPIONSHIP
        </div>
      </div>
    ),
    { ...OG_SIZE, fonts: [font] }
  );
}
