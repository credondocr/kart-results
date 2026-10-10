import teamsJson from "@/data/teams.json";

export interface TeamMeta {
  slug: string;
  name: string;
  logo: string;
  visible?: boolean;
}

/** Catálogo maestro de equipos (slug = team en los datos de pilotos).
 *  Fuente de verdad: DB Neon → export a teams.json en cada deploy. */
const ALL_TEAMS: TeamMeta[] = teamsJson;

/** Equipos públicos (oculta los marcados como no visibles, ej. "unknown"). */
export const TEAMS: TeamMeta[] = ALL_TEAMS.filter((team) => team.visible !== false);

export function getTeam(slug: string | undefined | string[]): TeamMeta | undefined {
  if (!slug || Array.isArray(slug)) return undefined;
  const key = slug.toLowerCase();
  return ALL_TEAMS.find((team) => team.slug === key);
}
