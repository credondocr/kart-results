/**
 * Imports a championship standings PDF (one per category) into the history data files.
 *
 * Usage:
 *   npm run import:standings -- "<file.pdf>" [options]
 *
 * Options:
 *   --dry-run          Parse and validate without writing anything
 *   --year <yyyy>      Override target year (default: detected from the PDF subtitle)
 *   --season <name>    Override target season: invierno | verano
 *   --class <folder>   Override class folder (default: matched against known class titles)
 *   --category <name>  Override category name inside the class
 *   --fechas <n>       Pad scores to n fechas (season length; existing arrays are never shortened)
 *   --allow-unknown    Keep pilots missing from src/data/pilots.json with empty team/country
 */
import { existsSync, mkdirSync, writeFileSync } from "fs";
import { dirname } from "path";
import { pathToFileURL } from "url";
import type { Category, Class, RaceResult } from "../src/data/types";
import { extractRows } from "./lib/pdfTable";
import { ParseError, parseStandings, type StandingRow } from "./lib/parseStandings";
import { classFilePath, PILOTS_PATH } from "./lib/paths";
import { loadRegistry, normalizeName, resolvePilot, type PilotRegistry } from "./lib/pilots";
import {
  matchClassByTitle,
  ensureSeasonIndex,
  ensureYearRegistered,
  normalizeTitle,
  readClassMeta,
  scanClassFiles,
  TargetError,
} from "./lib/target";
import { serializeClass } from "./lib/codegen";

interface Args {
  pdf: string;
  dryRun: boolean;
  allowUnknown: boolean;
  year?: string;
  season?: string;
  classFolder?: string;
  category?: string;
  fechas?: number;
}

const VALID_SEASONS = ["invierno", "verano"];

function usage(): string {
  return [
    "Uso: npm run import:standings -- <archivo.pdf> [opciones]",
    "",
    "Opciones:",
    "  --dry-run          Parsea y valida sin escribir nada",
    "  --year <yyyy>      Año destino (default: detectado del PDF)",
    "  --season <nombre>  Temporada destino: invierno | verano",
    "  --class <folder>   Carpeta de la clase (default: match por título)",
    "  --category <name>  Categoría dentro de la clase",
    "  --fechas <n>       Rellena scores hasta n fechas (no acorta arrays existentes)",
    "  --allow-unknown    Deja pilotos sin ficha en pilots.json con team/country vacíos",
  ].join("\n");
}

function parseArgs(argv: string[]): Args {
  const args: Partial<Args> & { pdf?: string } = {};
  const takesValue = ["--year", "--season", "--class", "--category", "--fechas"];
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--dry-run") {
      args.dryRun = true;
    } else if (arg === "--allow-unknown") {
      args.allowUnknown = true;
    } else if (arg === "--help" || arg === "-h") {
      console.log(usage());
      process.exit(0);
    } else if (takesValue.includes(arg)) {
      const value = argv[++i];
      if (!value) throw new ParseError(`Falta el valor de ${arg}`);
      if (arg === "--year") args.year = value;
      if (arg === "--season") args.season = value;
      if (arg === "--class") args.classFolder = value;
      if (arg === "--category") args.category = value;
      if (arg === "--fechas") {
        const n = parseInt(value, 10);
        if (!Number.isInteger(n) || n < 1) throw new ParseError(`--fechas inválido: ${value}`);
        args.fechas = n;
      }
    } else if (arg.startsWith("--")) {
      throw new ParseError(`Opción desconocida: ${arg}`);
    } else if (!args.pdf) {
      args.pdf = arg;
    } else {
      throw new ParseError(`Argumento inesperado: ${arg}`);
    }
  }
  if (!args.pdf) throw new ParseError("Falta la ruta del PDF\n\n" + usage());
  if (!existsSync(args.pdf)) throw new ParseError(`No existe el archivo: ${args.pdf}`);
  if (args.year && !/^\d{4}$/.test(args.year)) throw new ParseError(`--year inválido: ${args.year}`);
  if (args.season && !VALID_SEASONS.includes(args.season)) {
    throw new ParseError(`--season inválido: ${args.season} (esperado: ${VALID_SEASONS.join(" | ")})`);
  }
  return args as Args;
}

function resolveTarget(
  args: Args,
  parsed: { year: number | null; season: string | null; seasonLabel: string | null }
): { year: string; season: string } {
  const year = args.year ?? (parsed.year !== null ? String(parsed.year) : null);
  const season = args.season ?? parsed.season;
  if (!year || !season) {
    throw new ParseError(
      `No se pudo detectar año/temporada del PDF` +
        (parsed.seasonLabel ? ` (subtítulo: "${parsed.seasonLabel}")` : "") +
        `. Usa --year y --season.`
    );
  }
  if (!VALID_SEASONS.includes(season)) {
    throw new ParseError(`Temporada "${season}" no soportada (esperado: ${VALID_SEASONS.join(" | ")})`);
  }
  return { year, season };
}

function resolveClassFolder(
  args: Args,
  pdfTitle: string
): { folder: string; exportName: string } {
  const templates = scanClassFiles();

  if (args.classFolder) {
    const known = templates.find((t) => t.folder === args.classFolder);
    if (known) return { folder: known.folder, exportName: known.exportName };
    const exportName = sanitizeIdentifier(args.classFolder);
    if (!exportName) throw new TargetError(`Nombre de clase inválido: "${args.classFolder}"`);
    return { folder: args.classFolder, exportName };
  }

  const { template, matches } = matchClassByTitle(pdfTitle, templates);
  if (matches.length > 1) {
    const folders = [...new Set(matches.map((m) => m.folder))];
    throw new TargetError(`El título "${pdfTitle}" es ambiguo (${folders.join(", ")}). Usa --class <folder>.`);
  }
  if (!template) {
    throw new TargetError(
      `No se reconoce la clase "${pdfTitle}". Clases conocidas: ` +
        [...new Set(templates.map((t) => `${t.title} (${t.folder})`))].join(", ") +
        `. Usa --class <folder> si es una clase nueva.`
    );
  }
  return { folder: template.folder, exportName: template.exportName };
}

function sanitizeIdentifier(folder: string): string {
  const id = folder.replace(/[^a-zA-Z0-9_$]/g, "");
  return /^[0-9]/.test(id) ? `_${id}` : id;
}

/** Loads the target class file, or scaffolds metadata from another season's copy of the same class. */
async function loadOrCreateClass(
  targetPath: string,
  exportName: string,
  folder: string,
  year: string,
  pdfTitle: string
): Promise<{ cls: Class; existed: boolean }> {
  if (existsSync(targetPath)) {
    const meta = readClassMeta(targetPath);
    if (!meta) throw new TargetError(`No se pudo leer la clase en ${targetPath}`);
    const mod = (await import(pathToFileURL(targetPath).href)) as Record<string, Class>;
    const cls = mod[meta.exportName];
    if (!cls) throw new TargetError(`La clase "${meta.exportName}" no está exportada en ${targetPath}`);
    return { cls: structuredClone(cls), existed: true };
  }

  const candidates = scanClassFiles().filter((t) => t.folder === folder);
  const fallback = candidates.find((t) => t.year === year) ?? candidates[0];
  const base = fallback
    ? await loadClassMetadata(fallback.path, fallback.exportName)
    : { title: pdfTitle.toUpperCase(), ageGroup: "", details: [], img: "" };

  return { cls: { ...base, categories: [] }, existed: false };
}

async function loadClassMetadata(
  path: string,
  exportName: string
): Promise<Pick<Class, "title" | "ageGroup" | "details" | "img">> {
  const mod = (await import(pathToFileURL(path).href)) as Record<string, Class>;
  const cls = mod[exportName];
  if (!cls) throw new TargetError(`La clase "${exportName}" no está exportada en ${path}`);
  return { title: cls.title, ageGroup: cls.ageGroup, details: [...cls.details], img: cls.img };
}

/** Category names used by the same class in other seasons (keeps naming consistent for the general view). */
async function loadCategoryHints(folder: string, year: string, targetPath: string): Promise<string[]> {
  const candidates = scanClassFiles().filter((t) => t.folder === folder && t.path !== targetPath);
  const fallback = candidates.find((t) => t.year === year) ?? candidates[0];
  if (!fallback) return [];
  const meta = readClassMeta(fallback.path);
  if (!meta) return [];
  const mod = (await import(pathToFileURL(fallback.path).href)) as Record<string, Class>;
  const cls = mod[meta.exportName];
  return cls ? cls.categories.map((c) => c.name) : [];
}

function resolveCategory(cls: Class, pdfTitle: string, override?: string, hintNames: string[] = []): { category: Category; isNew: boolean } {
  const wanted = (override ?? pdfTitle).trim();
  const wantedNorm = normalizeTitle(wanted);

  const exact = cls.categories.find((c) => c.name.trim() && normalizeTitle(c.name) === wantedNorm);
  if (exact) return { category: exact, isNew: false };

  if (!override) {
    const partial = cls.categories.filter((c) => {
      const cn = normalizeTitle(c.name);
      return cn && (cn.includes(wantedNorm) || wantedNorm.includes(cn));
    });
    if (partial.length === 1) return { category: partial[0], isNew: false };
    if (partial.length > 1) {
      throw new TargetError(
        `Categorías ambiguas: ${partial.map((c) => c.name).join(", ")} — usa --category <name>`
      );
    }
    if (cls.categories.length === 1 && cls.categories[0].name.trim() === "") {
      return { category: cls.categories[0], isNew: false };
    }
  }

  // New category: reuse the name other seasons use for it (e.g. "" for single-category classes).
  let name = wanted;
  if (!override && hintNames.length === 1) {
    name = hintNames[0];
  } else if (!override && hintNames.length > 1) {
    const matched = hintNames.filter((h) => {
      const hn = normalizeTitle(h);
      return hn && (hn.includes(wantedNorm) || wantedNorm.includes(hn));
    });
    if (matched.length === 1) name = matched[0];
  }

  const category: Category = { name, results: [] };
  cls.categories.push(category);
  return { category, isNew: true };
}

function buildResults(
  rows: StandingRow[],
  registry: PilotRegistry,
  year: string,
  allowUnknown: boolean,
  existing: RaceResult[]
): RaceResult[] {
  return rows.map((row) => {
    const norm = normalizeName(row.name);
    const resolved = resolvePilot(registry, row.name, year);
    if (!resolved && !allowUnknown) {
      throw new ParseError(`Piloto sin ficha: "${row.name}"`);
    }
    const pilot = resolved?.entry;
    const prev =
      existing.find((r) => normalizeName(r.driver) === norm) ??
      existing.find((r) => r.number === row.number);
    const result: RaceResult = {
      rank: row.pos,
      number: row.number,
      driver: pilot?.name ?? row.name,
      team: pilot?.team ?? "",
      country: pilot?.country ?? "",
      scores: [...row.scores],
      points: row.scores.reduce((acc, s) => acc + s, 0),
      worst: 0,
    };
    if (prev?.tiebreaker !== undefined) result.tiebreaker = prev.tiebreaker;
    return result;
  });
}

function pad(label: string, width: number): string {
  return label.length >= width ? label : label + " ".repeat(width - label.length);
}

function printTable(rows: StandingRow[], registry: PilotRegistry, year: string): void {
  const header =
    "Po  No   " +
    pad("Piloto", 24) +
    pad("Equipo", 18) +
    pad("País", 6) +
    rows[0].scores.map((_, i) => `F${i + 1}`.padEnd(7)).join("") +
    "Total";
  console.log(header);
  console.log("-".repeat(header.length));
  for (const row of rows) {
    const pilot = resolvePilot(registry, row.name, year)?.entry;
    const scores = row.scores.map((s) => String(s).padEnd(7)).join("");
    console.log(
      `${String(row.pos).padEnd(3)}${String(row.number).padEnd(5)}` +
        `${pad(row.name, 24)}${pad(pilot?.team ?? "?", 18)}${pad(pilot?.country ?? "?", 6)}` +
        `${scores}${row.total}`
    );
  }
}

async function main(): Promise<void> {
  const args = parseArgs(process.argv.slice(2));

  const pdfRows = await extractRows(args.pdf);
  const standings = parseStandings(pdfRows);
  const { year, season } = resolveTarget(args, standings);

  const registry = loadRegistry();
  const unknown = standings.rows.filter((row) => !resolvePilot(registry, row.name, year));
  const fuzzy = standings.rows
    .map((row) => ({ row, resolved: resolvePilot(registry, row.name, year) }))
    .filter((r) => r.resolved?.via === "prefix");
  if (unknown.length > 0 && !args.allowUnknown) {
    console.error(`\n${unknown.length} piloto(s) sin ficha en ${PILOTS_PATH.replace(process.cwd(), ".")}:`);
    for (const row of unknown) console.error(`  - ${row.name} (#${row.number})`);
    console.error(`\nAgrégalos al registro o ejecuta "npm run seed:pilots" para sembrarlo desde el histórico.`);
    console.error(`Alternativa: añade --allow-unknown para continuar con team/country vacíos.\n`);
    process.exitCode = 1;
    return;
  }
  if (fuzzy.length > 0) {
    console.log(`\nCoincidencias por prefijo (revisa que sean correctas):`);
    for (const { row, resolved } of fuzzy) {
      console.log(`  ~ "${row.name}" → "${resolved!.entry.name}"`);
    }
  }

  const { folder, exportName } = resolveClassFolder(args, standings.title);
  const targetPath = classFilePath(year, season, folder);
  const { cls, existed } = await loadOrCreateClass(targetPath, exportName, folder, year, standings.title);
  const hintNames = await loadCategoryHints(folder, year, targetPath);
  const { category, isNew: isNewCategory } = resolveCategory(cls, standings.title, args.category, hintNames);

  const previous = category.results;
  const results = buildResults(standings.rows, registry, year, args.allowUnknown, previous);

  // Rellenar scores hasta la longitud de la temporada (máx. entre PDF, datos existentes y --fechas)
  const targetLen = Math.max(
    args.fechas ?? 0,
    results[0]?.scores.length ?? 0,
    previous[0]?.scores.length ?? 0
  );
  for (const result of results) {
    while (result.scores.length < targetLen) result.scores.push(0);
  }
  for (const row of standings.rows) {
    while (row.scores.length < targetLen) row.scores.push(0);
  }
  cls.categories = cls.categories.filter((c) => c !== category);
  cls.categories.push({ ...category, results });

  console.log(`\nPDF:       ${args.pdf}`);
  console.log(`Categoría: ${standings.title}${standings.seasonLabel ? ` — ${standings.seasonLabel}` : ""}`);
  console.log(`Fechas:    ${standings.eventLabels.map((l, i) => `R${i + 1}=${l}`).join(", ")}`);
  console.log(`Destino:   ${targetPath.replace(process.cwd(), ".")}`);
  console.log(
    `           ${existed ? "clase existente" : "clase nueva (metadata copiada de otra temporada)"}` +
      `${isNewCategory ? ", categoría nueva" : ""}`
  );
  console.log("");
  printTable(standings.rows, registry, year);

  if (args.dryRun) {
    console.log(`\n[dry-run] No se escribió nada.`);
    return;
  }

  mkdirSync(dirname(targetPath), { recursive: true });
  writeFileSync(targetPath, serializeClass(cls, exportName), "utf8");
  ensureSeasonIndex(year, season, exportName, folder);
  ensureYearRegistered(year, season);

  const added = results.filter((r) => !previous.some((p) => p.number === r.number)).length;
  const removed = previous.filter((p) => !results.some((r) => r.number === p.number)).length;
  console.log(
    `\n✓ ${results.length} pilotos escritos (${added} nuevos, ${removed} fuera) → ${targetPath.replace(process.cwd(), ".")}`
  );
}

main().catch((error: unknown) => {
  if (error instanceof ParseError || error instanceof TargetError) {
    console.error(`\nError: ${error.message}\n`);
  } else {
    console.error(error);
  }
  process.exitCode = 1;
});
