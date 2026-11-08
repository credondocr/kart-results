/**
 * Sincroniza el registro de pilotos con el roster 2026 del Excel.
 *
 * Fuente: CUMPLEAÑOS 2026.xlsx (nombre, fecha de nacimiento, equipo).
 * Destino: src/data/pilots.json y (con --push-db) la tabla pilots de Neon,
 * que es la fuente de verdad (el prebuild de Vercel la exporta al JSON).
 *
 * Uso:
 *   npm run registry:2026 -- --dry-run    Reporte sin escribir nada
 *   npm run registry:2026                Escribe pilots.json
 *   npm run registry:2026 -- --push-db   Escribe pilots.json + upserta en la DB
 *
 * Decisiones de mapeo (revisadas con el usuario):
 *   - "TDR - BABYLISS PRO" = losprimos (mismo equipo renombrado).
 *   - Zachary Bridgeman: 1 solo (nac 2013-11-27) → fsa; fila Valerio descartada.
 *   - Makya Rodríguez: fsa (nac 2013-07-05); fila Valerio descartada.
 *   - Samuel: 2 personas — samuel castro (2009, fsa, VLR) y
 *     samuel venegas castro (2015, dr-racing, alias "Samuel Venegas").
 *   - Mauricio Hernández Durán (1982) y Sebastian Arce Garcia (2007):
 *     entradas nuevas (homónimos distintos del registro existente).
 *   - birthDate: solo se completa si falta (fechas en hora local).
 */
import { existsSync, readFileSync, writeFileSync } from "fs";
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import ExcelJS from "exceljs";
import { normalizeName, type PilotEntry } from "./lib/pilots";
import { PILOTS_PATH } from "./lib/paths";

const EXCEL_PATH = "CUMPLEAÑOS 2026.xlsx";
const YEAR = "2026";

/** Nombre exacto del Excel → slug del equipo (src/data/teams.json). */
const TEAM_MAP: Record<string, string> = {
  "FSA (FIK SPORT ACADEMY)": "fsa",
  FMV: "fmv",
  "ADVANCED KARTING": "advanced",
  "VALERIO RACING SYSTEM": "valerio",
  "DR RACING KART COSTA RICA": "dr-racing",
  "FORMULA KART": "formula",
  "MH KARTING": "mhkarting",
  INDEPENDIENTE: "independiente",
  VRT4: "vrt4",
  "TDR - BABYLISS PRO": "losprimos",
};

type Registry = Record<string, PilotEntry>;

interface ExcelRow {
  name: string;
  birthDate: string | null;
  teamRaw: string;
}

/** Filas del Excel descartadas (homónimos/duplicados resueltos a mano). */
function isDiscarded(key: string, slug: string): boolean {
  if (key === "zachary bridgeman" && slug === "valerio") return true;
  if (key === "makya rodriguez" && slug === "valerio") return true;
  return false;
}

/**
 * Duplicados creados por match incompleto (nombre corto del registro vs
 * nombre completo del Excel) — fusionados en sus entradas existentes.
 * Decididos con el usuario; el equipo 2026 del Excel gana.
 */
const MERGES: Array<{ from: string; into: string; team: string; birthDate?: string; alias: string }> = [
  { from: "mario andres saborio vargas", into: "mario saborio", team: "advanced", birthDate: "2011-04-13", alias: "Mario Andrés Saborío Vargas" },
  { from: "alondro joseph albouy", into: "joseph albouy", team: "fmv", birthDate: "2012-01-07", alias: "Alondro Joseph Albouy" },
  { from: "ian sebastien leon alvarez", into: "ian sebastian leon", team: "fmv", birthDate: "2006-04-20", alias: "Ian Sebastien Leon Alvarez" },
  { from: "jose aleandro halphen", into: "jose alejandro halphen", team: "fmv", birthDate: "2011-04-26", alias: "Jose Aleandro Halphen" },
  { from: "ruben carrapatozo", into: "ruben carrapatoso", team: "fsa", birthDate: "1981-06-07", alias: "Ruben Carrapatozo" },
  { from: "sergio nicolas palacios requiniva", into: "sergio palacios", team: "fsa", birthDate: "2014-10-23", alias: "Sergio Nicolás Palacios Requiniva" },
  { from: "saul emiliano solis guillen", into: "saul solis", team: "independiente", birthDate: "2019-09-24", alias: "Saúl Emiliano Solís Guillén" },
  { from: "jaden adrian spielman", into: "jaden spielman", team: "mhkarting", birthDate: "2013-11-30", alias: "Jaden Adrian Spielman" },
  { from: "samatha spielman", into: "samantha spielman", team: "mhkarting", birthDate: "2012-10-31", alias: "Samatha Spielman" },
  { from: "thomas joel hof munoz", into: "thomas hof", team: "valerio", birthDate: "2013-11-05", alias: "Thomas Joel Hof Munoz" },
  { from: "timothy vivian", into: "timothy alan vivian", team: "valerio", birthDate: "1966-08-09", alias: "Timothy Vivian" },
];

/** Segundas keys de la misma persona: equipo 2026 según Excel. */
const TEAM_FIXES: Array<{ key: string; team: string }> = [
  { key: "ian leon", team: "fmv" },
  { key: "jose ale. halpen", team: "fmv" },
];

/**
 * Reestructuraciones de claves previas al match (para que el match exacto
 * gane sobre el prefijo y no se pisen personas distintas con el mismo nombre).
 * Devuelve las claves eliminadas.
 */
function applyRestructures(data: Registry): { log: string[]; deleted: string[] } {
  const log: string[] = [];
  const deleted: string[] = [];

  const kid = data["samuel castro"];
  if (kid && !data["samuel venegas castro"]) {
    data["samuel venegas castro"] = {
      name: "Samuel Venegas Castro",
      team: "dr-racing",
      teams: { [YEAR]: "dr-racing" },
      country: kid.country || "CR",
      aliases: ["Samuel Venegas"],
      birthDate: "2015-07-06",
      categories: ["Mini Rok 60cc", "T4 Tilly Mini"],
    };
    delete data["samuel venegas"];
    deleted.push("samuel venegas");
    data["samuel castro"] = {
      name: "Samuel Castro",
      team: "fsa",
      teams: { ...(kid.teams ?? {}), [YEAR]: "fsa" },
      country: kid.country || "CR",
      birthDate: "2009-07-21",
    };
    log.push(
      "reestructurado: samuel castro (2009, fsa, VLR) separado de samuel venegas castro (2015, dr-racing, alias «Samuel Venegas»)"
    );
  }

  if (!data["mauricio hernandez duran"]) {
    data["mauricio hernandez duran"] = {
      name: "Mauricio Hernández Durán",
      team: "formula",
      teams: { [YEAR]: "formula" },
      country: "",
      birthDate: "1982-09-22",
    };
    log.push("entrada nueva: mauricio hernandez duran (formula, nac 1982)");
  }

  // Arce/Recinos: dos personas distintas (confirmado con el usuario —
  // corrieron juntos en Tillotson 2025: Arce #995, Recinos).
  // La key "sebastian arce" quedó contaminada con datos de Recinos en el
  // import fuzzy de inscritos (alias, nacimiento y categoría VLR Junior).
  const arce = data["sebastian arce"];
  if (arce) {
    const withoutYear = arce.teams
      ? Object.fromEntries(Object.entries(arce.teams).filter(([y]) => y !== YEAR))
      : {};
    data["sebastian arce"] = {
      name: "Sebastian Arce Garcia",
      team: "advanced",
      teams: { ...withoutYear, [YEAR]: "advanced" },
      country: arce.country || "CR",
      birthDate: "2007-11-29",
    };
    log.push("corregido: sebastian arce = García (nac 2007, advanced) — datos de Recinos separados");
  }
  if (data["sebastian arce garcia"]) {
    delete data["sebastian arce garcia"];
    deleted.push("sebastian arce garcia");
    log.push("eliminada: sebastian arce garcia (duplicado redundante de sebastian arce)");
  }
  const recinos = data["sebastian recinos"];
  if (recinos) {
    const aliases = recinos.aliases ?? [];
    if (!aliases.some((a) => normalizeName(a) === "sebastian recinos arce")) {
      recinos.aliases = [...aliases, "Sebastián Recinos Arce"];
    }
    if (!recinos.birthDate) recinos.birthDate = "2010-05-13";
    log.push("completado: sebastian recinos — alias «Sebastián Recinos Arce», nac 2010-05-13");
  }

  return { log, deleted };
}

/**
 * Fusiona duplicados y aplica fixes de equipo. Se ejecuta DESPUÉS del roster
 * para capturar también las claves que el match acaba de crear (corrida fresca).
 * Idempotente.
 */
function applyMerges(data: Registry): { log: string[]; deleted: string[] } {
  const log: string[] = [];
  const deleted: string[] = [];

  for (const m of MERGES) {
    const src = data[m.from];
    if (!src) continue;
    const dst = data[m.into];
    if (!dst) {
      log.push(`✗ fusión pendiente: no existe la clave destino "${m.into}"`);
      continue;
    }
    dst.teams = { ...(dst.teams ?? {}), [YEAR]: m.team };
    dst.team = m.team;
    if (!dst.birthDate && m.birthDate) dst.birthDate = m.birthDate;
    const aliases = dst.aliases ?? [];
    if (!aliases.some((a) => normalizeName(a) === normalizeName(m.alias))) {
      dst.aliases = [...aliases, m.alias];
    }
    delete data[m.from];
    deleted.push(m.from);
    log.push(`fusionado: ${m.from} → ${m.into} (${m.team} ${YEAR})`);
  }
  for (const f of TEAM_FIXES) {
    const entry = data[f.key];
    if (!entry) continue;
    if (entry.teams?.[YEAR] !== f.team) {
      entry.teams = { ...(entry.teams ?? {}), [YEAR]: f.team };
      entry.team = f.team;
      log.push(`equipo ${YEAR}: ${f.key} → ${f.team}`);
    }
  }

  return { log, deleted };
}

/** Mapa de claves de lookup: nombre normalizado → key del registro (claves ganan sobre aliases). */
function buildLookup(data: Registry): Map<string, string> {
  const map = new Map<string, string>();
  for (const key of Object.keys(data)) map.set(normalizeName(key), key);
  for (const [key, entry] of Object.entries(data)) {
    for (const alias of entry.aliases ?? []) {
      const norm = normalizeName(alias);
      if (!map.has(norm)) map.set(norm, key);
    }
  }
  return map;
}

type Match = { type: "exact"; key: string } | { type: "prefix"; key: string } | { type: "none" } | { type: "ambiguous" };

function matchName(lookup: Map<string, string>, name: string): Match {
  const norm = normalizeName(name);
  const exact = lookup.get(norm);
  if (exact) return { type: "exact", key: exact };

  let key: string | null = null;
  for (const [candidate, owner] of lookup) {
    if (candidate.startsWith(norm + " ") || norm.startsWith(candidate + " ")) {
      if (key !== null && key !== owner) return { type: "ambiguous" };
      key = owner;
    }
  }
  return key ? { type: "prefix", key } : { type: "none" };
}

/** Fecha en hora local (evita el off-by-one de toISOString con medianoche). */
function toLocalIsoDate(value: unknown): string | null {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    const y = value.getFullYear();
    const m = String(value.getMonth() + 1).padStart(2, "0");
    const d = String(value.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }
  return null;
}

async function readRoster(): Promise<ExcelRow[]> {
  if (!existsSync(EXCEL_PATH)) throw new Error(`No existe el Excel: ${EXCEL_PATH}`);
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.readFile(EXCEL_PATH);
  const ws = wb.worksheets[0];
  const rows: ExcelRow[] = [];
  ws.eachRow({ includeEmpty: false }, (row, rn) => {
    if (rn === 1) return;
    const name = String(row.getCell(1).value ?? "").trim();
    if (!name) return;
    rows.push({
      name,
      birthDate: toLocalIsoDate(row.getCell(2).value),
      teamRaw: String(row.getCell(3).value ?? "").trim(),
    });
  });
  return rows;
}

interface Changes {
  registry: Registry;
  updated: string[];
  added: string[];
  skipped: string[];
  restructureLog: string[];
  deleted: string[];
  changedKeys: Set<string>;
  errors: string[];
}

function applyRoster(roster: ExcelRow[]): Changes {
  const registry: Registry = JSON.parse(readFileSync(PILOTS_PATH, "utf8"));
  const { log, deleted } = applyRestructures(registry);
  const lookup = buildLookup(registry);

  const updated: string[] = [];
  const added: string[] = [];
  const skipped: string[] = [];
  const errors: string[] = [];
  const changedKeys = new Set<string>();
  const seen = new Map<string, string>();

  for (const row of roster) {
    const slug = TEAM_MAP[row.teamRaw];
    if (!slug) {
      errors.push(`Equipo sin mapear: "${row.teamRaw}" (piloto: ${row.name})`);
      continue;
    }

    const match = matchName(lookup, row.name);
    if (match.type === "ambiguous") {
      errors.push(`Match ambiguo (prefijo no único): "${row.name}" — revisar manualmente`);
      continue;
    }

    if (match.type === "none") {
      const key = normalizeName(row.name);
      if (registry[key]) {
        errors.push(`Clave ya ocupada sin match previo: "${row.name}" → ${key}`);
        continue;
      }
      const entry: PilotEntry = { name: row.name, team: slug, teams: { [YEAR]: slug }, country: "" };
      if (row.birthDate) entry.birthDate = row.birthDate;
      registry[key] = entry;
      lookup.set(key, key);
      added.push(`${key} → ${slug}${row.birthDate ? ` (nac ${row.birthDate})` : ""}`);
      changedKeys.add(key);
      seen.set(key, slug);
      continue;
    }

    const key = match.key;
    if (isDiscarded(key, slug)) {
      skipped.push(`${row.name} → ${slug} (fila duplicada descartada)`);
      continue;
    }

    const prevSeen = seen.get(key);
    if (prevSeen !== undefined && prevSeen !== slug) {
      errors.push(
        `Conflicto: "${row.name}" mapea a ${key} con dos equipos (${prevSeen} y ${slug}) — fila no contemplada`
      );
      continue;
    }
    seen.set(key, slug);

    const entry = registry[key];
    const prevFlat = entry.team;
    const prevYear = entry.teams?.[YEAR];
    let dirty = false;
    let birthFilled = false;

    if (prevYear !== slug) {
      entry.teams = { ...(entry.teams ?? {}), [YEAR]: slug };
      dirty = true;
    }
    if (prevFlat !== slug) {
      entry.team = slug;
      dirty = true;
    }
    if (!entry.birthDate && row.birthDate) {
      entry.birthDate = row.birthDate;
      dirty = true;
      birthFilled = true;
    }

    if (dirty) {
      const detail: string[] = [];
      if (prevFlat !== slug) detail.push(`equipo: ${prevFlat || "(vacío)"} → ${slug}`);
      if (prevYear !== undefined && prevYear !== slug) detail.push(`${YEAR}: ${prevYear} → ${slug}`);
      if (prevYear === undefined) detail.push(`${YEAR}: (sin dato) → ${slug}`);
      if (birthFilled) detail.push(`nacimiento: ${row.birthDate} (completado)`);
      updated.push(`${key} — ${detail.join(", ")}`);
      changedKeys.add(key);
    }
  }

  const mergeResult = applyMerges(registry);

  return {
    registry,
    updated,
    added,
    skipped,
    restructureLog: [...log, ...mergeResult.log],
    deleted: [...deleted, ...mergeResult.deleted],
    changedKeys,
    errors,
  };
}

function sortRegistry(data: Registry): Registry {
  return Object.fromEntries(Object.entries(data).sort(([a], [b]) => a.localeCompare(b)));
}

/** Sincroniza JSON → DB: upsert de todas las claves y elimina las que ya no existan en el JSON. */
async function pushDb(data: Registry): Promise<void> {
  const { db, dbUrl } = await import("@/lib/db");
  if (!dbUrl()) throw new Error("Sin POSTGRES_URL — no se puede hacer push a la DB.");
  const sql = db();

  const rows = (await sql`SELECT key FROM pilots`) as unknown as Array<{ key: string }>;
  const dbKeys = new Set(rows.map((r) => r.key));
  const jsonKeys = new Set(Object.keys(data));

  let deleted = 0;
  for (const key of dbKeys) {
    if (!jsonKeys.has(key)) {
      await sql`DELETE FROM pilots WHERE key = ${key}`;
      deleted++;
    }
  }

  let n = 0;
  for (const [key, e] of Object.entries(data)) {
    await sql`
      INSERT INTO pilots (key, name, team, teams, country, aliases, birth_date, categories)
      VALUES (
        ${key},
        ${e.name},
        ${e.team},
        ${JSON.stringify(e.teams ?? {})}::jsonb,
        ${e.country ?? ""},
        ${JSON.stringify(e.aliases ?? [])}::jsonb,
        ${e.birthDate ?? null},
        ${JSON.stringify(e.categories ?? [])}::jsonb
      )
      ON CONFLICT (key) DO UPDATE SET
        name = EXCLUDED.name,
        team = EXCLUDED.team,
        teams = EXCLUDED.teams,
        country = EXCLUDED.country,
        aliases = EXCLUDED.aliases,
        birth_date = EXCLUDED.birth_date,
        categories = EXCLUDED.categories
    `;
    n++;
  }
  console.log(`DB: ${n} upsert(s), ${deleted} eliminada(s).`);
}

async function main(): Promise<void> {
  const dryRun = process.argv.includes("--dry-run");
  const pushDbFlag = process.argv.includes("--push-db");

  const roster = await readRoster();
  const { registry, updated, added, skipped, restructureLog, changedKeys, errors } =
    applyRoster(roster);

  console.log(`Excel:     ${EXCEL_PATH} (${roster.length} filas)`);
  console.log(`Destino:   ${PILOTS_PATH.replace(process.cwd(), ".")}`);
  console.log("");
  if (restructureLog.length) {
    console.log("Reestructuraciones:");
    for (const l of restructureLog) console.log(`  • ${l}`);
    console.log("");
  }
  if (skipped.length) {
    console.log(`Filas descartadas (${skipped.length}):`);
    for (const l of skipped) console.log(`  − ${l}`);
    console.log("");
  }
  if (updated.length) {
    console.log(`Actualizados (${updated.length}):`);
    for (const l of updated) console.log(`  • ${l}`);
    console.log("");
  }
  if (added.length) {
    console.log(`Agregados (${added.length}):`);
    for (const l of added) console.log(`  + ${l}`);
    console.log("");
  }
  if (errors.length) {
    console.log(`ERRORES (${errors.length}):`);
    for (const l of errors) console.log(`  ✗ ${l}`);
    console.log("");
  }

  if (errors.length > 0) {
    console.error("No se escribe nada hasta resolver los errores.");
    process.exitCode = 1;
    return;
  }

  if (dryRun) {
    console.log(`[dry-run] ${changedKeys.size} claves cambiarían. No se escribió nada.`);
    return;
  }

  const sorted = sortRegistry(registry);
  writeFileSync(PILOTS_PATH, JSON.stringify(sorted, null, 2) + "\n", "utf8");
  console.log(`pilots.json escrito: ${changedKeys.size} claves cambiadas (${Object.keys(sorted).length} total).`);

  if (pushDbFlag) {
    await pushDb(sorted);
  } else {
    console.log("DB no tocada (sin --push-db). Corre con --push-db para sincronizar Neon.");
  }
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
