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

function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;
  let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const current = [i];
    for (let j = 1; j <= b.length; j++) {
      current[j] = Math.min(
        prev[j] + 1,
        current[j - 1] + 1,
        prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)
      );
    }
    prev = current;
  }
  return prev[b.length];
}

/**
 * ¿Son la misma persona con grafías distintas? (nombre parcial, typo
 * leve o nombre+apellido idénticos). NO fusiona por número de kart:
 * los números se reutilizan entre temporadas y pueden ser personas
 * distintas.
 */
export function samePerson(a: string, b: string): boolean {
  if (nameMatches(a, b)) return true;

  const na = normalizeName(a).replace(/[^a-z0-9 ]/g, " ").replace(/\s+/g, " ").trim();
  const nb = normalizeName(b).replace(/[^a-z0-9 ]/g, " ").replace(/\s+/g, " ").trim();
  if (na === nb) return true;

  if (Math.min(na.length, nb.length) >= 6 && levenshtein(na, nb) <= 2) return true;

  const wordsA = na.split(" ");
  const wordsB = nb.split(" ");
  return (
    wordsA.length >= 2 &&
    wordsB.length >= 2 &&
    wordsA[0] === wordsB[0] &&
    wordsA[wordsA.length - 1] === wordsB[wordsB.length - 1]
  );
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
  /** Victorias en carreras individuales (posición 1 en una fecha). */
  wins: number;
  /** Podios (top 3) en carreras individuales. */
  podiums: number;
  /** Títulos de temporada (rank 1 al final del campeonato). */
  titles: number;
  points: number;
  seasons: number;
}

/** Índice de resultados por carrera (fecha) de todos los pilotos. */
export interface RaceResultEntry {
  driver: string;
  number: number | string;
  team: string;
  year: string;
  season: string;
  classTitle: string;
  categoryName: string;
  /** Número de fecha (1-based). */
  fecha: number;
  /** Posición en esa carrera (empates comparten posición). */
  position: number;
  /** Puntos que marcó en esa carrera. */
  points: number;
}

let raceIndexCache: RaceResultEntry[] | null = null;

function buildRaceIndex(): RaceResultEntry[] {
  const entries: RaceResultEntry[] = [];

  for (const championship of Championships.years) {
    const year = String(championship.year);
    for (const season of ["invierno", "verano"] as const) {
      const leaderboard = championship[season];
      if (!leaderboard) continue;

      for (const cls of leaderboard.classes) {
        for (const category of cls.categories) {
          const width = category.results.reduce(
            (max, result) => Math.max(max, result.scores.length),
            0
          );

          for (let i = 0; i < width; i++) {
            const field = category.results.map((result) => ({
              result,
              score: result.scores[i] ?? 0,
            }));
            // Fecha no disputada (nadie puntúa) o sin puntajes.
            if (!field.some((row) => row.score > 0)) continue;

            for (const row of field) {
              // Solo carreras con puntaje: ausencias y DNFs quedan fuera.
              if (row.score <= 0) continue;
              const position =
                1 + field.filter((other) => other.score > row.score).length;
              entries.push({
                driver: row.result.driver,
                number: row.result.number,
                team: row.result.team,
                year,
                season,
                classTitle: cls.title,
                categoryName: category.name,
                fecha: i + 1,
                position,
                points: row.score,
              });
            }
          }
        }
      }
    }
  }

  return entries;
}

function getRaceIndex(): RaceResultEntry[] {
  if (!raceIndexCache) raceIndexCache = buildRaceIndex();
  return raceIndexCache;
}

function sortRaceResults(entries: RaceResultEntry[]): RaceResultEntry[] {
  return [...entries].sort(
    (a, b) =>
      Number(b.year) - Number(a.year) ||
      (SEASON_ORDER[a.season] ?? 9) - (SEASON_ORDER[b.season] ?? 9) ||
      b.fecha - a.fecha ||
      a.position - b.position
  );
}

/** Carrera a carrera de un piloto, más reciente primero. */
export function getPilotRaceResults(
  pilotName: string,
  kartNumber?: number | string
): RaceResultEntry[] {
  const index = getRaceIndex();

  const byName = index.filter((entry) => nameMatches(pilotName, entry.driver));
  if (byName.length > 0) return sortRaceResults(byName);

  if (kartNumber !== undefined && kartNumber !== "") {
    const byNumber = index.filter(
      (entry) => String(entry.number) === String(kartNumber)
    );
    if (byNumber.length > 0) return sortRaceResults(byNumber);
  }

  return [];
}

/** Estadísticas de carrera agregadas del historial de un piloto. */
export function getPilotCareerStats(pilotName: string, kartNumber?: number | string): CareerStats {
  const history = getPilotHistory(pilotName, kartNumber);
  const races = getPilotRaceResults(pilotName, kartNumber);
  const seasons = new Set(history.map((entry) => `${entry.year}-${entry.season}`));
  return {
    wins: races.filter((entry) => entry.position === 1).length,
    podiums: races.filter((entry) => entry.position <= 3).length,
    titles: history.filter((entry) => entry.rank === 1).length,
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

/** Entrada más reciente de un piloto por equipo + número (para fichas sintéticas).
 *  Con `nameHint`, prioriza entradas cuyo nombre coincida: los números se
 *  reutilizan entre temporadas y podrían ser personas distintas. */
export function findHistoryEntry(
  teamSlug: string,
  id: string,
  nameHint?: string
): HistoryEntry | undefined {
  const slug = teamSlug.toLowerCase();
  const candidates = sortEntries(getIndex()).filter(
    (entry) =>
      entry.team.toLowerCase() === slug &&
      String(entry.number).toLowerCase() === id.toLowerCase()
  );
  if (candidates.length === 0) return undefined;
  if (nameHint) {
    const hinted = candidates.find((entry) => nameMatches(nameHint, entry.driver));
    if (hinted) return hinted;
  }
  return candidates[0];
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

/* ==================== Estadísticas generales del campeonato ==================== */

export interface PilotsStatsEntry {
  /** Nombre canónico (primera grafía vista; las variantes se fusionan con samePerson). */
  name: string;
  team: string;
  number: number | string;
  titles: number;
  /** Etiquetas de años con título: "2024", "2025", "2024×2" si ganó ambas temporadas. */
  titleYears: string[];
  subs: number;
  raceWins: number;
  racePodiums: number;
  races: number;
  seasons: number;
  points: number;
}

export interface TeamStatsEntry {
  team: string;
  titles: number;
  wins: number;
}

export interface SeasonRecord {
  points: number;
  driver: string;
  number: number | string;
  team: string;
  year: string;
  season: string;
  classTitle: string;
  categoryName: string;
}

export interface ChampionshipStats {
  totals: { races: number; pilots: number; titles: number; wins: number };
  /** Ordenados por títulos → victorias de carrera → podios. */
  people: PilotsStatsEntry[];
  teams: TeamStatsEntry[];
  seasonRecord: SeasonRecord | null;
}

let statsCache: ChampionshipStats | null = null;

/** Estadísticas agregadas de todo el histórico (cacheada). */
export function getChampionshipStats(): ChampionshipStats {
  if (statsCache) return statsCache;

  const people = new Map<string, PilotsStatsEntry>();
  const findOrCreate = (driver: string): PilotsStatsEntry => {
    for (const [key, entry] of people) {
      if (samePerson(key, driver)) return entry;
    }
    const created: PilotsStatsEntry = {
      name: driver,
      team: "",
      number: "",
      titles: 0,
      titleYears: [],
      subs: 0,
      raceWins: 0,
      racePodiums: 0,
      races: 0,
      seasons: 0,
      points: 0,
    };
    people.set(driver, created);
    return created;
  };

  // Títulos, subcampeonatos y puntos por temporada (orden cronológico inverso
  // para que el equipo/nombre más reciente gane).
  const teamTitles = new Map<string, TeamStatsEntry>();
  for (const entry of sortEntries(getIndex())) {
    const person = findOrCreate(entry.driver);
    if (!person.team) {
      person.team = entry.team;
      person.number = entry.number;
    }
    person.seasons += 1;
    person.points += entry.points;
    if (entry.rank === 1) {
      person.titles += 1;
      const index = person.titleYears.findIndex(
        (label) => label === entry.year || label.startsWith(`${entry.year}×`)
      );
      if (index >= 0) {
        const match = person.titleYears[index].match(/^\d{4}(?:×(\d+))?$/);
        const count = match && match[1] ? parseInt(match[1], 10) + 1 : 2;
        person.titleYears[index] = `${entry.year}×${count}`;
      } else {
        person.titleYears.push(entry.year);
      }
      const team = teamTitles.get(entry.team) ?? { team: entry.team, titles: 0, wins: 0 };
      team.titles += 1;
      teamTitles.set(entry.team, team);
    } else if (entry.rank === 2) {
      person.subs += 1;
    }
  }

  // Victorias/podios por carrera.
  for (const race of getRaceIndex()) {
    const person = findOrCreate(race.driver);
    person.races += 1;
    if (race.position === 1) {
      person.raceWins += 1;
      const team = teamTitles.get(race.team) ?? { team: race.team, titles: 0, wins: 0 };
      team.wins += 1;
      teamTitles.set(race.team, team);
    } else if (race.position <= 3) {
      person.racePodiums += 1;
    }
  }

  // Carreras disputadas (temporada·categoría·fecha con puntaje) + récord.
  let races = 0;
  let seasonRecord: SeasonRecord | null = null;
  for (const championship of Championships.years) {
    const year = String(championship.year);
    for (const season of ["invierno", "verano"] as const) {
      const leaderboard = championship[season];
      if (!leaderboard) continue;
      for (const cls of leaderboard.classes) {
        for (const category of cls.categories) {
          const width = category.results.reduce(
            (max, result) => Math.max(max, result.scores.length),
            0
          );
          for (let i = 0; i < width; i++) {
            if (!category.results.some((result) => (result.scores[i] ?? 0) > 0)) continue;
            races += 1;
          }
          for (const result of category.results) {
            const points = result.scores.reduce((sum, score) => sum + score, 0);
            if (!seasonRecord || points > seasonRecord.points) {
              seasonRecord = {
                points,
                driver: result.driver,
                number: result.number,
                team: result.team,
                year,
                season,
                classTitle: cls.title,
                categoryName: category.name,
              };
            }
          }
        }
      }
    }
  }

  const sortedPeople = [...people.values()].sort(
    (a, b) =>
      b.titles - a.titles ||
      b.raceWins - a.raceWins ||
      b.racePodiums - a.racePodiums ||
      a.name.localeCompare(b.name)
  );

  statsCache = {
    totals: {
      races,
      pilots: sortedPeople.length,
      titles: sortedPeople.reduce((sum, person) => sum + person.titles, 0),
      wins: sortedPeople.reduce((sum, person) => sum + person.raceWins, 0),
    },
    people: sortedPeople,
    teams: [...teamTitles.values()].sort(
      (a, b) => b.titles - a.titles || b.wins - a.wins || a.team.localeCompare(b.team)
    ),
    seasonRecord,
  };

  return statsCache;
}
