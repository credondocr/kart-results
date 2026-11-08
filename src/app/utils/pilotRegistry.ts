import pilotsJson from "@/data/pilots.json";
import { normalizeName, formatYears } from "./naming";

/**
 * Registro maestro de pilotos (src/data/pilots.json) accesible desde la app.
 * Es la FUENTE DE VERDAD de país y equipos por temporada.
 *
 * Módulo hoja: solo importa el JSON y naming.ts, para que data/history,
 * scripts y el resto de la app puedan resolver equipos sin ciclos.
 * El catálogo de equipos (slug/nombre/logo) vive en teams.json (tabla teams).
 */
export interface RegistryEntry {
  name: string;
  team: string;
  teams?: Record<string, string>;
  country: string;
  aliases?: string[];
  /** Fecha de nacimiento ISO (YYYY-MM-DD), si se conoce. */
  birthDate?: string;
  /** Categoría(s) vigente(s) de inscripción (grafía canónica del campeonato). */
  categories?: string[];
}

const REGISTRY = pilotsJson as Record<string, RegistryEntry>;

/** Lookup por nombre normalizado (exacto, alias o prefijo único). */
export function lookupRegistry(name: string): RegistryEntry | null {
  const key = normalizeName(name);
  if (!key) return null;

  const exact = REGISTRY[key];
  if (exact) return exact;

  for (const entry of Object.values(REGISTRY)) {
    if (entry.aliases?.some((alias) => normalizeName(alias) === key)) return entry;
  }

  const matches = Object.values(REGISTRY).filter((entry) => {
    const entryKey = normalizeName(entry.name);
    return entryKey.startsWith(key + " ") || key.startsWith(entryKey + " ");
  });
  return matches.length === 1 ? matches[0] : null;
}

/** Equipo actual del piloto (registro) con fallback al dato viejo. */
const currentTeamCache = new Map<string, string | null>();

export function currentTeamOf(name: string, fallback = ""): string {
  const key = normalizeName(name);
  if (!key) return fallback;
  let team = currentTeamCache.get(key);
  if (team === undefined) {
    team = lookupRegistry(name)?.team ?? null;
    currentTeamCache.set(key, team);
  }
  return team || fallback;
}

/** Equipo del piloto en una temporada (`teams[año]`) con fallback al dato guardado. */
const yearTeamCache = new Map<string, string | null>();

export function teamForYear(name: string, year: string | number, fallback = ""): string {
  const key = `${normalizeName(name)}|${year}`;
  if (!normalizeName(name)) return fallback;
  let team = yearTeamCache.get(key);
  if (team === undefined) {
    team = lookupRegistry(name)?.teams?.[String(year)] ?? null;
    yearTeamCache.set(key, team);
  }
  return team || fallback;
}

export interface TeamSegment {
  team: string;
  /** Años en ese equipo: "2024" · "2025–2026" · "2024, 2026" */
  years: string;
}

/**
 * Trayectoria de equipos agrupada por temporadas consecutivas
 * (del registro `teams: { año: equipo }`).
 */
export function getTeamSegments(entry: RegistryEntry | null): TeamSegment[] {
  const teams = entry?.teams;
  if (!teams) return [];

  const years = Object.keys(teams).sort();
  const groups: { team: string; years: string[] }[] = [];
  for (const year of years) {
    const team = teams[year];
    if (!team) continue;
    const last = groups[groups.length - 1];
    if (last && last.team === team) {
      last.years.push(year);
    } else {
      groups.push({ team, years: [year] });
    }
  }

  return groups.map((group) => ({ team: group.team, years: formatYears(group.years) }));
}
