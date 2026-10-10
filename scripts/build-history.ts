/**
 * Genera standings históricos (POC: 2023) desde los eventos SpeedHive
 * importados, SIN penalizaciones oficiales (solo resultados de pista).
 * Aplica los ajustes manuales de src/data/penalties.json si existen.
 *
 *   npm run history:build            # genera todos los años HISTORY_YEARS
 *   npm run history:build -- 2023    # solo un año
 *
 * Salida: src/data/history/<year>/index.ts (Championship inline).
 */
import { mkdirSync, readFileSync, writeFileSync, existsSync } from "fs";
import path from "path";
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { loadEvent, type SlimRow } from "../src/app/utils/eventData";
import eventsManifest from "../src/data/events/manifest.json";
import pilotsJson from "../src/data/pilots.json";

/** Normalización local (evita importar pilotHistory → history →2023 en cadena). */
const loose = (v: string) =>
  v
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, "");

interface RegistryEntry {
  name: string;
  team?: string;
  country?: string;
  aliases?: string[];
}

const REGISTRY = pilotsJson as Record<string, RegistryEntry>;

function lookupRegistry(name: string): RegistryEntry | null {
  const key = loose(name);
  if (!key) return null;
  const exact = REGISTRY[key];
  if (exact) return exact;
  for (const entry of Object.values(REGISTRY)) {
    if (entry.aliases?.some((alias) => loose(alias) === key)) return entry;
  }
  const matches = Object.values(REGISTRY).filter((entry) => {
    const entryKey = loose(entry.name);
    return entryKey.startsWith(key + " ") || key.startsWith(entryKey + " ");
  });
  return matches.length === 1 ? matches[0] : null;
}

/** Años generados (histórico sin PointMerge/oficial). */
const HISTORY_YEARS = ["2019", "2020", "2021", "2022", "2023"];

/** Escala oficial CRKC (validada 100% contra PointMerge 2024-2026). */
const QUALI = [5, 4, 3, 2, 1];
const PREFINAL = [12.5, 10, 8, 6.5, 5.5, 5, 4.5, 4, 3.5, 3, 2.5, 2, 1.5, 1, 0.5];
const FINAL = [25, 20, 16, 13, 11, 10, 9, 8, 7, 6, 5.5, 5, 4.5, 4, 3.5, 3, 2.5, 2, 1.5, 1];

type Kind = "quali" | "prefinal" | "final";

interface Penalty {
  year: string;
  season: string;
  fecha: number;
  cls: string;
  driver: string;
  delta: number;
  note?: string;
}

interface PilotAcc {
  name: string;
  numCounts: Map<string, number>;
  scores: number[];
}

function kindOf(session: { type: string; name: string }): Kind | null {
  if (session.type === "qualify") return "quali";
  if (session.type === "race") {
    const n = session.name.toLowerCase();
    if (n.includes("prefinal")) return "prefinal";
    if (/\bfinal\b/.test(n) && !n.includes("pre")) return "final";
    return null;
  }
  return null;
}

/** Fecha (1..N) escrita en el nombre de la sesión: "3era", "4ta", "1ra"… */
function fechaOf(sessionName: string): number | null {
  const m = sessionName.match(/(\d{1,2})\s*(?:era|era|ra|ta|to|a|er)?\s*fe/i);
  if (!m) return null;
  const n = Number(m[1]);
  return Number.isFinite(n) && n >= 1 && n <= 20 ? n : null;
}

/**
 * Fecha de una sesión. Los eventos F1-F3 de 2023 no escriben el número en
 * los nombres ("Kid Kart - Clasificacion"): si el evento del manifiesto es
 * de una sola fecha, se usa esa; en eventos dobles (4ta y 5ta) las sesiones
 * sin número van a la primera fecha del evento (p.ej. clasificación del
 * fin de semana doble).
 */
function fechaForSession(
  sessionName: string,
  eventFechas: number[]
): number | null {
  const fromName = fechaOf(sessionName);
  if (fromName) return fromName;
  if (eventFechas.length === 1) return eventFechas[0];
  if (eventFechas.length > 1) return Math.min(...eventFechas);
  return null;
}

function scaleFor(kind: Kind, posInClass: number): number {
  if (posInClass <= 0) return 0;
  const table = kind === "quali" ? QUALI : kind === "prefinal" ? PREFINAL : FINAL;
  return table[posInClass - 1] ?? 0;
}

function matchesCls(a: string, b: string): boolean {
  const x = loose(a);
  const y = loose(b);
  if (!x || !y) return false;
  return x === y || x.startsWith(y + " ") || y.startsWith(x + " ");
}

/** Agrupa categorías de SpeedHive en clases del sitio (VLR, TILLOTSON…). */
function groupOf(clsRaw: string): { classTitle: string; categoryName: string } {
  const clean = clsRaw.trim().replace(/\s+/g, " ");
  const key = loose(clean);
  if (key.startsWith("tillotson")) {
    return { classTitle: "TILLOTSON", categoryName: clean.toUpperCase() };
  }
  if (key.startsWith("vlr")) {
    return { classTitle: "VLR", categoryName: clean.toUpperCase() };
  }
  const title = clean.toUpperCase();
  return { classTitle: title, categoryName: "" };
}

function prettyClassTitle(title: string): string {
  if (title === "MICRO ROK") return "MICRO ROK";
  if (title === "MINI ROK 60CC" || title === "MINI ROK") return "MINI ROK";
  if (title === "SHIFTER ROK" || title === "ROK SHIFTER") return "ROK SHIFTER";
  if (title === "STARS OF TOMORROW" || title === "STARS OF TOMORROW ") return "STARS OF TOMORROW";
  if (title === "LO 206" || title === "LO206") return "LO 206";
  return title;
}

function loadPenalties(): Penalty[] {
  const file = path.join(process.cwd(), "src/data/penalties.json");
  if (!existsSync(file)) return [];
  try {
    return JSON.parse(readFileSync(file, "utf-8")) as Penalty[];
  } catch {
    return [];
  }
}

interface SeasonResult {
  year: number;
  season: string;
  classes: Array<{
    title: string;
    ageGroup: string;
    details: string[];
    img: string;
    categories: Array<{
      name: string;
      results: Array<{
        rank: number;
        number: string | number;
        driver: string;
        team: string;
        country: string;
        scores: number[];
        points: number;
        worst: number;
      }>;
    }>;
  }>;
}

function buildSeason(
  year: string,
  season: "invierno" | "verano",
  penalties: Penalty[]
): SeasonResult | null {
  const entries = (eventsManifest as { events: Array<Record<string, unknown>> }).events
    .filter((e) => String(e.year) === year && e.season === season)
    .sort((a, b) => String(a.startDate).localeCompare(String(b.startDate)));
  if (!entries.length) return null;

  /** clsRaw → pilotKey → acc */
  const byCls = new Map<string, Map<string, PilotAcc>>();
  let maxFecha = 0;

  for (const entry of entries) {
    const event = loadEvent(String(entry.id));
    if (!event) continue;
    const eventFechas = Array.isArray(entry.fechas)
      ? (entry.fechas as number[]).filter((n) => Number.isInteger(n) && n > 0)
      : [];
    for (const day of event.days) {
      for (const session of day.sessions) {
        const kind = kindOf(session);
        if (!kind) continue;
        const rows = session.classification?.rows ?? [];
        if (!rows.length) continue;
        const fecha = fechaForSession(session.name, eventFechas);
        if (!fecha) continue;
        maxFecha = Math.max(maxFecha, fecha);

        for (const row of rows as SlimRow[]) {
          if (!row.name || !row.cls) continue;
          const clsRaw = row.cls.trim();
          if (!clsRaw) continue;
          let pilots = byCls.get(clsRaw);
          if (!pilots) {
            pilots = new Map();
            byCls.set(clsRaw, pilots);
          }
          const key = loose(row.name);
          let acc = pilots.get(key);
          if (!acc) {
            acc = {
              name: row.name.trim().replace(/\s+/g, " "),
              numCounts: new Map(),
              scores: [],
            };
            pilots.set(key, acc);
          }
          if (row.num) {
            acc.numCounts.set(String(row.num), (acc.numCounts.get(String(row.num)) ?? 0) + 1);
          }
          const pts = scaleFor(kind, row.posInClass);
          acc.scores[fecha - 1] = (acc.scores[fecha - 1] ?? 0) + pts;
        }
      }
    }
  }

  // Aplicar penales manuales (solo esta temporada/año).
  let applied = 0;
  for (const p of penalties) {
    if (p.year !== year || p.season !== season) continue;
    for (const [clsRaw, pilots] of byCls) {
      if (!matchesCls(clsRaw, p.cls)) continue;
      const acc = pilots.get(loose(p.driver));
      if (!acc) continue;
      acc.scores[p.fecha - 1] = (acc.scores[p.fecha - 1] ?? 0) + p.delta;
      applied += 1;
    }
  }
  if (applied) {
    console.log(`  penales aplicadas en ${year}/${season}: ${applied}`);
  }

  // Normalizar longitudes de scores a maxFecha.
  for (const pilots of byCls.values()) {
    for (const acc of pilots.values()) {
      for (let i = 0; i < maxFecha; i++) {
        acc.scores[i] = acc.scores[i] ?? 0;
      }
    }
  }

  // Agrupar en clases del sitio.
  const classMap = new Map<string, Map<string, Map<string, PilotAcc>>>();
  for (const [clsRaw, pilots] of byCls) {
    const { classTitle, categoryName } = groupOf(clsRaw);
    let cats = classMap.get(classTitle);
    if (!cats) {
      cats = new Map();
      classMap.set(classTitle, cats);
    }
    let catPilots = cats.get(categoryName);
    if (!catPilots) {
      catPilots = new Map();
      cats.set(categoryName, catPilots);
    }
    for (const [key, acc] of pilots) {
      const existing = catPilots.get(key);
      if (!existing) {
        catPilots.set(key, acc);
      } else {
        // Mismo piloto en sesiones de nombres de cls ligeramente distintos.
        for (let i = 0; i < maxFecha; i++) {
          existing.scores[i] = Math.max(existing.scores[i] ?? 0, acc.scores[i] ?? 0);
        }
        for (const [num, count] of acc.numCounts) {
          existing.numCounts.set(num, (existing.numCounts.get(num) ?? 0) + count);
        }
      }
    }
  }

  const classes = [...classMap.entries()]    .map(([classTitle, cats]) => {
      const categories = [...cats.entries()].map(([catName, pilots]) => {
        const results = [...pilots.values()]
          .map((acc) => {
            const points = acc.scores.reduce((s, v) => s + v, 0);
            const top4 = [...acc.scores]
              .sort((a, b) => b - a)
              .slice(0, 4)
              .reduce((s, v) => s + v, 0);
            let bestNum = "";
            let bestCount = 0;
            for (const [num, count] of acc.numCounts) {
              if (count > bestCount) {
                bestNum = num;
                bestCount = count;
              }
            }
            const reg = lookupRegistry(acc.name);
            return {
              rank: 0,
              number: bestNum || acc.name.slice(0, 3).toUpperCase(),
              driver: acc.name,
              team: reg?.team ?? "",
              country: reg?.country ?? "",
              scores: acc.scores,
              points,
              worst: points - top4,
            };
          })
          .sort((a, b) => b.points - a.points || String(a.driver).localeCompare(String(b.driver)));
        results.forEach((r, i) => {
          r.rank = i + 1;
        });
        return { name: catName, results };
      });
      return {
        title: prettyClassTitle(classTitle),
        ageGroup: "",
        details: [],
        img: "",
        categories,
      };
    })
    .sort((a, b) => a.title.localeCompare(b.title));

  if (!classes.length) return null;
  return { year: Number(year), season, classes };
}

function main(): void {
  const arg = process.argv[2];
  const years = arg ? [arg] : HISTORY_YEARS;
  const penalties = loadPenalties();

  for (const year of years) {
    const dir = path.join(process.cwd(), "src/data/history", year);
    mkdirSync(dir, { recursive: true });
    const invierno = buildSeason(year, "invierno", penalties);
    const verano = buildSeason(year, "verano", penalties);

    if (!invierno && !verano) {
      console.log(`${year}: sin eventos — se omite.`);
      continue;
    }

    const parts: string[] = [
      `import { Championship } from "../../types";`,
      ``,
      `/** Generado por scripts/build-history.ts — SIN penalizaciones oficiales. */`,
      `export const championship${year}: Championship = {`,
      `  year: "${year}",`,
      `  pointsOfficial: false,`,
    ];
    if (invierno) {
      parts.push(`  invierno: ${JSON.stringify(invierno, null, 2).replace(/\n/g, "\n  ")},`);
    }
    if (verano) {
      parts.push(`  verano: ${JSON.stringify(verano, null, 2).replace(/\n/g, "\n  ")},`);
    }
    parts.push(`};`, ``);
    writeFileSync(path.join(dir, "index.ts"), parts.join("\n"));

    const catsI = invierno
      ? invierno.classes.reduce((n, c) => n + c.categories.length, 0)
      : 0;
    const catsV = verano ? verano.classes.reduce((n, c) => n + c.categories.length, 0) : 0;
    console.log(
      `${year}: invierno ${invierno ? `${invierno.classes.length} clases / ${catsI} categorías` : "—"} · verano ${verano ? `${verano.classes.length} clases / ${catsV} categorías` : "—"}`
    );
  }
}

main();
