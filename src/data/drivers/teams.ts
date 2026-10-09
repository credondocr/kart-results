export interface TeamMeta {
  slug: string;
  name: string;
  logo: string;
}

/** Catálogo maestro de equipos (slug = teamLogo en los datos de pilotos). */
export const TEAMS: TeamMeta[] = [
  { slug: "fsa", name: "FIK Sport Academy", logo: "/logos/fsa.png" },
  { slug: "formula", name: "Formula Kart", logo: "/logos/formula.png" },
  { slug: "advanced", name: "Advanced Karting", logo: "/logos/advanced.png" },
  { slug: "losprimos", name: "Babyliss Pro - MMR", logo: "/logos/losprimos.png" },
  { slug: "fmv", name: "FMV Racing", logo: "/logos/fmv.png" },
  { slug: "mhkarting", name: "MH Karting", logo: "/logos/mhkarting.png" },
  { slug: "valerio", name: "Valerio Racing System", logo: "/logos/valerio.png" },
];

export function getTeam(slug: string | undefined | string[]): TeamMeta | undefined {
  if (!slug || Array.isArray(slug)) return undefined;
  return TEAMS.find((team) => team.slug === slug.toLowerCase());
}
