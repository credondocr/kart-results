import { Championships } from "@/data/history";
import type { Pilot } from "@/data/types";

export interface HistoryEntry {
  driver: string;
  country: string;
  year: string;
  season: string;
  classTitle: string;
  /** Nombre de la categoría dentro de la clase (puede ser ""). */
  categoryName: string;
  team: string;
  rank: number;
  points: number;
  number: number | string;
}

export function normalizeName(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

export function nameMatches(pilotName: string, resultName: string): boolean {
  const a = normalizeName(pilotName);
  const b = normalizeName(resultName);
  return a === b || a.startsWith(b + " ") || b.startsWith(a + " ");
}

const pointsOf = (scores: number[]) => scores.reduce((sum, value) => sum + value, 0);

const best4Of = (scores: number[]) =>
  [...scores]
    .sort((a, b) => b - a)
    .slice(0, 4)
    .reduce((sum, value) => sum + value, 0);

// Orden cronológico inverso: invierno corre a fin de año, verano al inicio.
const SEASON_ORDER: Record<string, number> = { invierno: 0, verano: 1 };

let indexCache: HistoryEntry[] | null = null;

function buildIndex(): HistoryEntry[] {
  const entries: HistoryEntry[] = [];

  for (const championship of Championships.years) {
    const year = String(championship.year);
    for (const season of ["invierno", "verano"] as const) {
      const leaderboard = championship[season];
      if (!leaderboard) continue;

      for (const cls of leaderboard.classes) {
        for (const category of cls.categories) {
          // Mismo criterio que calculatePointsAndSort: Best 4 y tiebreaker.
          const ranked = category.results
            .map((result) => ({
              result,
              total: pointsOf(result.scores),
              best: best4Of(result.scores),
            }))
            .sort(
              (a, b) =>
                b.best - a.best ||
                (b.result.tiebreaker ?? 0) - (a.result.tiebreaker ?? 0)
            );

          ranked.forEach((row, index) => {
            entries.push({
              driver: row.result.driver,
              country: row.result.country,
              year,
              season,
              classTitle: cls.title,
              categoryName: category.name,
              team: row.result.team,
              rank: index + 1,
              points: row.total,
              number: row.result.number,
            });
          });
        }
      }
    }
  }

  return entries;
}

function getIndex(): HistoryEntry[] {
  if (!indexCache) indexCache = buildIndex();
  return indexCache;
}

function sortEntries(entries: HistoryEntry[]): HistoryEntry[] {
  return [...entries].sort(
    (a, b) =>
      Number(b.year) - Number(a.year) ||
      (SEASON_ORDER[a.season] ?? 9) - (SEASON_ORDER[b.season] ?? 9)
  );
}

/** Historial de un piloto: por nombre (parcial, con acentos) y, si no, por número. */
export function getPilotHistory(pilotName: string, kartNumber?: number | string): HistoryEntry[] {
  const index = getIndex();

  const byName = index.filter((entry) => nameMatches(pilotName, entry.driver));
  if (byName.length > 0) return sortEntries(byName);

  if (kartNumber !== undefined) {
    const byNumber = index.filter((entry) => String(entry.number) === String(kartNumber));
    if (byNumber.length > 0) return sortEntries(byNumber);
  }

  return [];
}

/** Categorías únicas en las que ha corrido, con sus años, más recientes primero. */
export interface CategoryStat {
  label: string;
  years: string[];
}

export function getPilotRacedCategories(pilotName: string, kartNumber?: number | string): CategoryStat[] {
  const byCategory = new Map<string, Set<string>>();

  for (const entry of getPilotHistory(pilotName, kartNumber)) {
    const label = entry.categoryName || entry.classTitle;
    if (!label) continue;
    const years = byCategory.get(label) ?? new Set<string>();
    years.add(entry.year);
    byCategory.set(label, years);
  }

  // Map preserva el orden de inserción = categorías más recientes primero.
  return [...byCategory.entries()].map(([label, years]) => ({
    label,
    years: [...years].sort(),
  }));
}

/** "2026" · "2024–2026" (contiguas) · "2024, 2026" (discontinuas) */
export function formatYears(years: string[]): string {
  if (years.length === 1) return years[0];
  const numbers = years.map(Number);
  const contiguous = numbers.every((n, i) => i === 0 || n === numbers[i - 1] + 1);
  if (contiguous) return `${years[0]}–${years[years.length - 1]}`;
  return years.join(", ");
}

export interface CareerStats {
  wins: number;
  podiums: number;
  points: number;
  seasons: number;
}

/** Estadísticas de carrera agregadas del historial de un piloto. */
export function getPilotCareerStats(pilotName: string, kartNumber?: number | string): CareerStats {
  const history = getPilotHistory(pilotName, kartNumber);
  const seasons = new Set(history.map((entry) => `${entry.year}-${entry.season}`));
  return {
    wins: history.filter((entry) => entry.rank === 1).length,
    podiums: history.filter((entry) => entry.rank <= 3).length,
    points: history.reduce((sum, entry) => sum + entry.points, 0),
    seasons: seasons.size,
  };
}

/** Primeros lugares de cada clase/categoría por temporada (orden cronológico inverso). */
export function getChampions(): HistoryEntry[] {
  return sortEntries(getIndex().filter((entry) => entry.rank === 1));
}

export interface HistoryPilot {
  name: string;
  country: string;
  number: number | string;
  team: string;
}

/** Pilotos únicos que han corridado (orden cronológico inverso: equipo actual primero). */
export function getHistoryPilots(): HistoryPilot[] {
  const seen = new Map<string, HistoryPilot>();
  for (const entry of sortEntries(getIndex())) {
    const key = normalizeName(entry.driver);
    if (!seen.has(key)) {
      seen.set(key, {
        name: entry.driver,
        country: entry.country,
        number: entry.number,
        team: entry.team,
      });
    }
  }
  return [...seen.values()];
}

/** Entrada más reciente de un piloto por equipo + número (para fichas sintéticas). */
export function findHistoryEntry(teamSlug: string, id: string): HistoryEntry | undefined {
  const slug = teamSlug.toLowerCase();
  return sortEntries(getIndex()).find(
    (entry) =>
      entry.team.toLowerCase() === slug &&
      String(entry.number).toLowerCase() === id.toLowerCase()
  );
}

/** Convierte un piloto del historial en forma Pilot para fichas/rosters. */
export function toPilotShape(pilot: HistoryPilot): Pilot {
  const raced = getPilotRacedCategories(pilot.name, pilot.number);
  return {
    name: pilot.name,
    kartNumber: pilot.number,
    categories: raced.length > 0 ? raced.map((category) => category.label) : [],
    biography: "",
    country: pilot.country,
    teamName: pilot.team.replace(/-/g, " "),
    profileUrl: "",
    teamLogo: pilot.team,
  };
}
