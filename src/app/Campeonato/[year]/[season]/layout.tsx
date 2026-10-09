import type { Metadata } from "next";

interface PageProps {
  params: Promise<{ year: string; season: string }>;
}

const SEASON_NAMES: Record<string, string> = {
  invierno: "Invierno",
  verano: "Verano",
  general: "General",
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { year, season } = await params;
  const label = SEASON_NAMES[season] ?? "Posiciones";
  return {
    title: `${label} ${year} | Costa Rica Kart Championship`,
    description: `Tabla de posiciones del Costa Rica Kart Championship — temporada ${label} ${year}.`,
  };
}

export default function SeasonLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
