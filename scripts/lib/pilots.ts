import { existsSync, readFileSync, writeFileSync } from "fs";
import type { History } from "../../src/data/types";
import { Championships } from "../../src/data/history";
import { PILOTS_PATH } from "./paths";

/**
 * Registry entry for a pilot (src/data/pilots.json).
 *
 * - `team`/`country` are the latest known values (fallback and quick reading).
 * - `teams` maps year -> team so historical imports resolve the team the
 *   pilot actually drove for in that season (a pilot can switch teams).
 * - `aliases` are extra names accepted when matching PDF names.
 */
export interface PilotEntry {
  name: string;
  team: string;
  teams?: Record<string, string>;
  country: string;
  aliases?: string[];
}

export type PilotRegistry = Map<string, PilotEntry>;

export function normalizeName(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

export function loadRegistry(path: string = PILOTS_PATH): PilotRegistry {
  const map: PilotRegistry = new Map();
  if (!existsSync(path)) return map;
  const data = JSON.parse(readFileSync(path, "utf8")) as Record<string, PilotEntry>;
  for (const [key, entry] of Object.entries(data)) {
    map.set(normalizeName(key), entry);
    for (const alias of entry.aliases ?? []) {
      map.set(normalizeName(alias), entry);
    }
  }
  return map;
}

/**
 * Picks the team a pilot drove for in `year`:
 * exact year -> closest known year below -> closest known year above -> flat `team`.
 */
export function resolveTeam(entry: PilotEntry, year: string | number): string {
  const teams = entry.teams;
  if (!teams) return entry.team;
  const keys = Object.keys(teams);
  if (keys.length === 0) return entry.team;

  const exact = teams[String(year)];
  if (exact) return exact;

  const target = Number(year);
  const years = keys.map(Number).filter((n) => Number.isFinite(n)).sort((a, b) => a - b);
  let below: number | undefined;
  for (const y of years) {
    if (y < target) below = y;
  }
  if (below !== undefined) return teams[String(below)];
  const above = years.find((y) => y > target);
  if (above !== undefined) return teams[String(above)];
  return entry.team;
}

export interface ResolvedPilot {
  entry: PilotEntry;
  via: "exact" | "prefix";
}

function withTeamForYear(entry: PilotEntry, year?: string | number): PilotEntry {
  if (year === undefined) {
    const years = entry.teams ? Object.keys(entry.teams).sort() : [];
    const latest = years[years.length - 1];
    return latest !== undefined ? { ...entry, team: entry.teams![latest] } : { ...entry };
  }
  return { ...entry, team: resolveTeam(entry, year) };
}

/**
 * Resolves a name from a PDF against the registry for the target `year`
 * (the returned entry carries the team for that season).
 * Exact (or alias) matches win; otherwise a unique word-prefix match is accepted
 * so shortened timing-system names ("Clara SALAZAR") find full ones
 * ("Clara Salazar Valerio"). Ambiguous prefixes do not match.
 */
export function resolvePilot(registry: PilotRegistry, name: string, year?: string | number): ResolvedPilot | null {
  const norm = normalizeName(name);
  const exact = registry.get(norm);
  if (exact) return { entry: withTeamForYear(exact, year), via: "exact" };

  let match: PilotEntry | null = null;
  for (const [key, entry] of registry) {
    if (key.startsWith(norm + " ") || norm.startsWith(key + " ")) {
      if (match && match !== entry) return null;
      match = entry;
    }
  }
  return match ? { entry: withTeamForYear(match, year), via: "prefix" } : null;
}

/**
 * Flattens the whole championship history into name -> { name, team (latest), teams: year -> team, country }.
 * Seasons are visited in chronological order so later years win for the flat fields.
 */
export function collectHistoryPilots(history: History = Championships): Map<string, PilotEntry> {
  const map = new Map<string, PilotEntry>();
  for (const championship of history.years) {
    const year = String(championship.year ?? "").trim();
    if (!year) continue;
    for (const season of [championship.invierno, championship.verano]) {
      if (!season?.classes) continue;
      for (const cls of season.classes) {
        for (const cat of cls.categories ?? []) {
          for (const result of cat.results ?? []) {
            const driver = result.driver?.trim();
            const country = result.country?.trim().toUpperCase().slice(0, 2);
            const team = result.team?.trim();
            if (!driver || !country || !team) continue;
            const norm = normalizeName(driver);
            const prev = map.get(norm);
            map.set(norm, {
              name: driver,
              team,
              teams: { ...(prev?.teams ?? {}), [year]: team },
              country,
            });
          }
        }
      }
    }
  }
  return map;
}

/** Merges history-derived pilots into the on-disk registry, preserving manual aliases and manual year entries not present in history. */
export function mergeIntoRegistry(history: History = Championships, path: string = PILOTS_PATH): { added: number; updated: number; total: number } {
  const existing: Record<string, PilotEntry> = existsSync(path)
    ? (JSON.parse(readFileSync(path, "utf8")) as Record<string, PilotEntry>)
    : {};
  const existingNorms = new Map<string, string>();
  for (const key of Object.keys(existing)) {
    existingNorms.set(normalizeName(key), key);
  }

  let added = 0;
  let updated = 0;
  for (const [norm, entry] of collectHistoryPilots(history)) {
    const existingKey = existingNorms.get(norm);
    if (existingKey === undefined) {
      existing[norm] = { ...entry };
      existingNorms.set(norm, norm);
      added++;
    } else {
      const prev = existing[existingKey];
      const mergedTeams = { ...(prev.teams ?? {}), ...(entry.teams ?? {}) };
      const same =
        prev.name === entry.name &&
        prev.team === entry.team &&
        prev.country === entry.country &&
        JSON.stringify(prev.teams ?? {}) === JSON.stringify(mergedTeams);
      if (!same) {
        existing[existingKey] = {
          ...entry,
          teams: mergedTeams,
          ...(prev.aliases ? { aliases: prev.aliases } : {}),
        };
        updated++;
      }
    }
  }

  const sorted = Object.fromEntries(
    Object.entries(existing).sort(([a], [b]) => a.localeCompare(b))
  );
  const json = JSON.stringify(sorted, null, 2) + "\n";
  writeFileSync(path, json, "utf8");
  return { added, updated, total: Object.keys(sorted).length };
}
