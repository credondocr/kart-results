/**
 * Importa la planilla oficial de inscritos (xlsx) al registro de pilotos.
 *
 * Por cada piloto de la planilla actualiza el registro (pilots.json → DB)
 * con: equipo de la temporada (teams[año] + team), fecha de nacimiento y
 * categoría(s) vigente(s) con la grafía canónica del campeonato.
 *
 * Uso:
 *   npm run import:inscritos -- "<archivo.xlsx>" [--apply] [--year 2026]
 *
 * Sin --apply solo genera el reporte (import/inscritos-report.json).
 * Con --apply requiere POSTGRES_URL y hace upsert + merge en la DB.
 * Al terminar el apply corre `npm run db:export -- --force` para
 * refrescar pilots.json desde la DB.
 *
 * No importa PII sensible: cédula, teléfonos, correos, representante ni
 * transponder quedan fuera (solo nombre, nacimiento, categoría y equipo).
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import path from "path";
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import ExcelJS from "exceljs";
import { db, dbUrl } from "@/lib/db";
import { normalizeName, samePerson } from "@/app/utils/pilotHistory";
import { PILOTS_PATH } from "./lib/paths";

const SEASON_DEFAULT = "2026";
const AMBIGUITY_THRESHOLD = 0.7;

/** Nombre suelto: sin acentos/puntuación, colapsa espacios (incl. \xa0). */
function loose(value: string): string {
  return normalizeName(value)
    .replace(/[^a-z0-9 ]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Grafías del Excel → nombre canónico (classes de SpeedHive). */
const CATEGORY_MAP: Record<string, string> = {
  "vlr 100 senior": "VLR Senior",
  "vlr senior": "VLR Senior",
  "vlr 100 junior": "VLR Junior",
  "vlr junior": "VLR Junior",
  "vlr 100 master": "VLR Master",
  "vlr master": "VLR Master",
  "tillotson junior": "Tillotson Junior",
  "tillotson senior": "Tillotson Senior",
  "tillotson heavy": "Tillotson Heavy",
  "t4 tilly mini": "T4 Tilly Mini",
  "tilly mini": "T4 Tilly Mini",
  "kid kart": "KID KART",
  "micro rok": "Micro Rok",
  "mini rok": "Mini Rok 60cc",
  "rok shifter": "Rok Shifter",
  "rok shifter master": "Rok Shifter Master",
  "stars of tomorrow": "Stars Of Tomorrow",
};

/** Nombres de equipo del Excel → slug del catálogo (teams.json). */
const TEAM_MAP: Record<string, string> = {
  "fsa fik sport academy": "fsa",
  "fik sport academy": "fsa",
  fsa: "fsa",
  fmv: "fmv",
  "valerio racing system": "valerio",
  "dr racing kart costa rica": "dr-racing",
  "dr racing": "dr-racing",
  "advanced karting": "advanced",
  "mh karting": "mhkarting",
  "formula kart": "formula",
  "tdr babyliss pro": "losprimos",
  "babyliss pro mmr": "losprimos",
  "babyliss pro": "losprimos",
  independiente: "independiente",
  vrt4: "vrt4",
  "akm motorsport": "akm",
};

interface RegistryEntry {
  name: string;
  team: string;
  teams?: Record<string, string>;
  country: string;
  aliases?: string[];
  birthDate?: string;
  categories?: string[];
}

interface SheetPilot {
  name: string;
  birthDate: string | null;
  teamLabel: string;
  teamSlug: string | null;
  categoryLabel: string;
  categoryCanonical: string | null;
  karts: string[];
}

interface Change {
  field: string;
  from: unknown;
  to: unknown;
}

interface PilotReport {
  name: string;
  key: string | null;
  matchedBy: "exact" | "alias" | "samePerson" | "none";
  ambiguos?: string[];
  karts: string[];
  categories: string[];
  changes: Change[];
  conflicts: string[];
  action: "update" | "create" | "skip-ambiguous" | "noop";
}

function serialToIso(serial: number): string {
  const ms = Date.UTC(1899, 11, 30) + Math.round(serial) * 86400000;
  return new Date(ms).toISOString().slice(0, 10);
}

function cellText(cell: ExcelJS.Cell): string {
  const v = cell.value;
  if (v == null) return "";
  if (typeof v === "string") return v;
  if (typeof v === "number") return String(v);
  if (v instanceof Date) return v.toISOString();
  if (typeof v === "object") {
    if ("richText" in v && Array.isArray(v.richText)) {
      return v.richText.map((t) => t.text ?? "").join("");
    }
    if ("text" in v && v.text != null) return String(v.text);
    if ("result" in v && v.result != null) return String(v.result);
  }
  return "";
}

function cellDate(cell: ExcelJS.Cell): string | null {
  const v = cell.value;
  if (v instanceof Date) {
    // exceljs arma el Date a partir del serial en UTC midnight;
    // getters locales lo correrían un día en zonas UTC-6.
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${v.getUTCFullYear()}-${pad(v.getUTCMonth() + 1)}-${pad(v.getUTCDate())}`;
  }
  if (typeof v === "number" && Number.isFinite(v) && v > 20000 && v < 80000) {
    return serialToIso(v);
  }
  const text = cellText(cell).trim();
  if (!text) return null;
  const iso = text.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (iso) {
    return `${iso[1]}-${iso[2].padStart(2, "0")}-${iso[3].padStart(2, "0")}`;
  }
  return null;
}

function canonicalCategory(label: string): string | null {
  return CATEGORY_MAP[loose(label)] ?? null;
}

function canonicalTeam(label: string): string | null {
  return TEAM_MAP[loose(label)] ?? null;
}

/** Fusiona filas del Excel del mismo piloto (corre 2 categorías). */
function dedupeRows(rows: SheetPilot[]): { pilots: SheetPilot[]; anomalies: string[] } {
  const byName = new Map<string, SheetPilot>();
  const anomalies: string[] = [];
  for (const row of rows) {
    const key = loose(row.name);
    const existing = byName.get(key);
    if (!existing) {
      byName.set(key, { ...row, karts: [...row.karts] });
      continue;
    }
    if (row.birthDate && existing.birthDate && row.birthDate !== existing.birthDate) {
      anomalies.push(
        `${row.name}: nacimiento distinto entre filas (${existing.birthDate} vs ${row.birthDate}) — se conserva el primero`
      );
    }
    if (row.teamSlug && existing.teamSlug && row.teamSlug !== existing.teamSlug) {
      anomalies.push(
        `${row.name}: equipo distinto entre filas (${existing.teamSlug} vs ${row.teamSlug}) — se conserva el primero`
      );
    }
    if (!existing.birthDate && row.birthDate) existing.birthDate = row.birthDate;
    if (!existing.teamSlug && row.teamSlug) {
      existing.teamSlug = row.teamSlug;
      existing.teamLabel = row.teamLabel;
    }
    existing.categoryLabel = `${existing.categoryLabel}|${row.categoryLabel}`;
    for (const kart of row.karts) {
      if (!existing.karts.includes(kart)) existing.karts.push(kart);
    }
  }
  return { pilots: [...byName.values()], anomalies };
}

function expandCategories(pilot: SheetPilot): string[] {
  const labels = pilot.categoryLabel.split("|");
  const out: string[] = [];
  for (const label of labels) {
    const cat = canonicalCategory(label);
    const finalCat = cat ?? label.trim();
    if (finalCat && !out.includes(finalCat)) out.push(finalCat);
  }
  return out;
}

async function readSheet(file: string): Promise<SheetPilot[]> {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(file);
  const sheet = workbook.worksheets[0];
  if (!sheet) throw new Error("El xlsx no tiene hojas.");

  let headerRow = 0;
  sheet.eachRow((row, rowNumber) => {
    if (loose(cellText(row.getCell(1))) === "piloto") {
      headerRow = rowNumber;
      return false;
    }
    return true;
  });
  if (!headerRow) throw new Error('No se encontró la fila encabezado con "PILOTO".');

  const rows: SheetPilot[] = [];
  sheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
    if (rowNumber <= headerRow) return;
    const name = cellText(row.getCell(1)).replace(/\s+/g, " ").trim();
    if (!name) return false; // fin del bloque de inscritos
    const teamLabel = cellText(row.getCell(10)).replace(/\s+/g, " ").trim();
    const categoryLabel = cellText(row.getCell(9)).replace(/\s+/g, " ").trim();
    const kart = cellText(row.getCell(6)).replace(/\s+/g, " ").trim();
    rows.push({
      name,
      birthDate: cellDate(row.getCell(3)),
      teamLabel,
      teamSlug: teamLabel ? canonicalTeam(teamLabel) : null,
      categoryLabel,
      categoryCanonical: categoryLabel ? canonicalCategory(categoryLabel) : null,
      karts: kart ? [kart] : [],
    });
    return true;
  });
  return rows;
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

function similarity(a: string, b: string): number {
  const max = Math.max(a.length, b.length);
  if (max === 0) return 1;
  return 1 - levenshtein(a, b) / max;
}

/** Score de candidatos: levenshtein o solapamiento de tokens (nombre+apellido). */
function candidateScore(xlsxName: string, entryName: string): number {
  const a = loose(xlsxName);
  const b = loose(entryName);
  const lev = similarity(a, b);
  const tokensA = a.split(" ");
  const tokensB = b.split(" ");
  const shorter = tokensA.length <= tokensB.length ? tokensA : tokensB;
  const longer = tokensA.length <= tokensB.length ? tokensB : tokensA;
  const matched = shorter.filter((t) => longer.includes(t)).length;
  const overlap = shorter.length ? matched / shorter.length : 0;
  return Math.max(lev, overlap);
}

function bestCandidates(
  name: string,
  entries: Array<{ key: string; entry: RegistryEntry }>,
  limit = 3
): Array<{ key: string; name: string; score: number }> {
  return entries
    .map(({ key, entry }) => ({ key, name: entry.name, score: candidateScore(name, entry.name) }))
    .filter((c) => c.score >= 0.5)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

interface RegistryIndex {
  entries: Array<{ key: string; entry: RegistryEntry }>;
  byExact: Map<string, { key: string; entry: RegistryEntry }>;
}

function loadRegistryIndex(): RegistryIndex {
  const raw = JSON.parse(readFileSync(PILOTS_PATH, "utf-8")) as Record<string, RegistryEntry>;
  const entries = Object.entries(raw).map(([key, entry]) => ({ key, entry }));
  const byExact = new Map<string, { key: string; entry: RegistryEntry }>();
  for (const item of entries) {
    byExact.set(loose(item.key), item);
    byExact.set(loose(item.entry.name), item);
    for (const alias of item.entry.aliases ?? []) {
      const k = loose(alias);
      if (!byExact.has(k)) byExact.set(k, item);
    }
  }
  return { entries, byExact };
}

function matchPilot(
  name: string,
  registry: RegistryIndex
): {
  match: { key: string; entry: RegistryEntry; matchedBy: "exact" | "alias" | "samePerson" } | null;
  ambiguos: string[];
} {
  const key = loose(name);

  const exactByName = registry.byExact.get(key);
  if (exactByName) {
    const matchedBy = loose(exactByName.entry.name) === key ? "exact" : "alias";
    return { match: { ...exactByName, matchedBy }, ambiguos: [] };
  }

  const sameHits = registry.entries.filter(({ entry }) => samePerson(entry.name, name));
  if (sameHits.length === 1) {
    return { match: { ...sameHits[0], matchedBy: "samePerson" }, ambiguos: [] };
  }
  if (sameHits.length > 1) {
    return {
      match: { ...sameHits[0], matchedBy: "samePerson" },
      ambiguos: sameHits.map((h) => h.entry.name),
    };
  }

  return { match: null, ambiguos: [] };
}

function mergeEntry(
  base: RegistryEntry,
  pilot: SheetPilot,
  categories: string[],
  year: string,
  changes: Change[],
  conflicts: string[]
): RegistryEntry {
  const merged: RegistryEntry = { ...base, teams: { ...(base.teams ?? {}) } };

  if (pilot.teamSlug) {
    const prevSeason = merged.teams?.[year];
    if (prevSeason !== pilot.teamSlug) {
      changes.push({ field: `teams.${year}`, from: prevSeason ?? null, to: pilot.teamSlug });
      merged.teams = { ...(merged.teams ?? {}), [year]: pilot.teamSlug };
    }
    if (merged.team !== pilot.teamSlug) {
      changes.push({ field: "team", from: merged.team || null, to: pilot.teamSlug });
      merged.team = pilot.teamSlug;
    }
  }

  if (pilot.birthDate) {
    if (!merged.birthDate) {
      changes.push({ field: "birthDate", from: null, to: pilot.birthDate });
      merged.birthDate = pilot.birthDate;
    } else if (merged.birthDate !== pilot.birthDate) {
      conflicts.push(
        `birthDate: registro ${merged.birthDate} vs planilla ${pilot.birthDate} — se conserva el registro`
      );
    }
  }

  const prevCats = (merged.categories ?? []).join(" · ");
  const nextCats = categories.join(" · ");
  if (prevCats !== nextCats) {
    changes.push({
      field: "categories",
      from: merged.categories ?? [],
      to: categories,
    });
    merged.categories = categories;
  }

  if (loose(merged.name) !== loose(pilot.name)) {
    const aliases = merged.aliases ?? [];
    if (!aliases.some((alias) => loose(alias) === loose(pilot.name))) {
      changes.push({ field: "aliases", from: aliases, to: [...aliases, pilot.name] });
      merged.aliases = [...aliases, pilot.name];
    }
  }

  return merged;
}

async function main() {
  const args = process.argv.slice(2);
  const apply = args.includes("--apply");
  const yearIndex = args.indexOf("--year");
  const year = yearIndex >= 0 ? args[yearIndex + 1] : SEASON_DEFAULT;
  if (!year || !/^\d{4}$/.test(year)) {
    console.error(" --year debe ser un año (ej. 2026).");
    process.exit(1);
  }
  const fileArg = args.find((a) => !a.startsWith("--") && a !== year);
  const fallback = path.join(process.cwd(), "3RA FECHA INVIERNO OFICIAL PILOTOS INSCRITOS .xlsx");
  const file = fileArg ?? (existsSync(fallback) ? fallback : null);
  if (!file || !existsSync(file)) {
    console.error("Uso: npm run import:inscritos -- <archivo.xlsx> [--apply] [--year 2026]");
    process.exit(1);
  }

  const rows = await readSheet(file);
  const { pilots: uniquePilots, anomalies } = dedupeRows(rows);
  const registry = loadRegistryIndex();

  const report: PilotReport[] = [];
  const unknownTeams = new Map<string, number>();
  const unknownCategories = new Map<string, number>();
  const mergedByKey = new Map<string, { key: string; entry: RegistryEntry }>();
  const created: Array<{ key: string; entry: RegistryEntry }> = [];

  for (const pilot of uniquePilots) {
    const categories = expandCategories(pilot);
    if (pilot.teamLabel && !pilot.teamSlug) {
      unknownTeams.set(pilot.teamLabel, (unknownTeams.get(pilot.teamLabel) ?? 0) + 1);
    }
    for (const label of pilot.categoryLabel.split("|")) {
      if (!canonicalCategory(label)) {
        unknownCategories.set(label, (unknownCategories.get(label) ?? 0) + 1);
      }
    }

    const { match, ambiguos } = matchPilot(pilot.name, registry);
    const item: PilotReport = {
      name: pilot.name,
      key: match?.key ?? null,
      matchedBy: match?.matchedBy ?? "none",
      ambiguos: ambiguos.length ? ambiguos : undefined,
      karts: pilot.karts,
      categories,
      changes: [],
      conflicts: [],
      action: "noop",
    };

    if (match) {
      const changes: Change[] = [];
      const merged = mergeEntry(match.entry, pilot, categories, year, changes, item.conflicts);
      item.changes = changes;
      item.action = changes.length ? "update" : "noop";
      if (changes.length) {
        mergedByKey.set(match.key, { key: match.key, entry: merged });
      }
    } else {
      const candidates = bestCandidates(pilot.name, registry.entries);
      const ambiguous = candidates.find((c) => c.score >= AMBIGUITY_THRESHOLD);
      if (ambiguous) {
        item.action = "skip-ambiguous";
        item.conflicts.push(
          `posible candidato: "${ambiguous.name}" (similitud ${ambiguous.score.toFixed(2)}) — revisar alias o alta manual`
        );
      } else {
        const key = loose(pilot.name);
        const entry: RegistryEntry = {
          name: pilot.name,
          team: pilot.teamSlug ?? "",
          teams: pilot.teamSlug ? { [year]: pilot.teamSlug } : {},
          country: "CR",
          birthDate: pilot.birthDate ?? undefined,
          categories,
        };
        item.action = "create";
        item.key = key;
        item.changes.push({ field: "(piloto nuevo)", from: null, to: entry });
        created.push({ key, entry });
      }
    }
    report.push(item);
  }

  const summary = {
    generatedAt: new Date().toISOString(),
    source: path.basename(file),
    year,
    apply,
    totals: {
      sheetRows: rows.length,
      uniquePilots: uniquePilots.length,
      updates: report.filter((r) => r.action === "update").length,
      creates: report.filter((r) => r.action === "create").length,
      ambiguous: report.filter((r) => r.action === "skip-ambiguous").length,
      noops: report.filter((r) => r.action === "noop").length,
    },
    unknownTeams: [...unknownTeams.entries()].map(([label, count]) => ({ label, count })),
    unknownCategories: [...unknownCategories.entries()].map(([label, count]) => ({
      label,
      count,
    })),
    anomalies,
    pilots: report,
  };

  const outDir = path.join(process.cwd(), "import");
  mkdirSync(outDir, { recursive: true });
  const reportPath = path.join(outDir, "inscritos-report.json");
  writeFileSync(reportPath, JSON.stringify(summary, null, 2) + "\n");

  console.log(`Planilla: ${summary.totals.sheetRows} filas → ${summary.totals.uniquePilots} pilotos (año ${year}).`);
  console.log(
    `Updates: ${summary.totals.updates} · Altas: ${summary.totals.creates} · Ambiguos: ${summary.totals.ambiguous} · Sin cambios: ${summary.totals.noops}`
  );
  if (summary.unknownTeams.length) {
    console.log("Equipos sin mapear:", summary.unknownTeams.map((t) => `${t.label} (x${t.count})`).join(", "));
  }
  if (summary.unknownCategories.length) {
    console.log(
      "Categorías sin mapear:",
      summary.unknownCategories.map((c) => `${c.label} (x${c.count})`).join(", ")
    );
  }
  for (const a of anomalies) console.log(` ! ${a}`);
  for (const r of report.filter((p) => p.action === "skip-ambiguous")) {
    console.log(` ? ${r.name}: ${r.conflicts.join("; ")}`);
  }
  console.log(`Reporte: ${path.relative(process.cwd(), reportPath)}`);

  if (!apply) {
    console.log("Dry-run (sin --apply): nada se escribió en la DB.");
    return;
  }

  if (!dbUrl()) {
    console.error("--apply requiere POSTGRES_URL (corre `vercel env pull` o revisa .env.local).");
    process.exit(1);
  }
  const sql = db();

  // Base desde la DB para las filas que van a cambiar (la DB manda sobre pilots.json).
  const affectedKeys = [...mergedByKey.keys()];
  const dbRows = affectedKeys.length
    ? ((await sql`
        SELECT key, name, team, teams, country, aliases,
               birth_date::text AS birth_date, categories
        FROM pilots
        WHERE key = ANY(${affectedKeys})
      `) as unknown as Array<{
        key: string;
        name: string;
        team: string | null;
        teams: Record<string, string> | null;
        country: string | null;
        aliases: string[] | null;
        birth_date: string | null;
        categories: string[] | null;
      }>)
    : [];
  const dbByKey = new Map(dbRows.map((r) => [r.key, r]));

  const upserts: Array<{
    key: string;
    entry: RegistryEntry;
    source: "update" | "create";
  }> = [];
  for (const [key, { entry }] of mergedByKey) {
    const row = dbByKey.get(key);
    const base: RegistryEntry = row
      ? {
          name: row.name,
          team: row.team ?? "",
          teams: row.teams ?? {},
          country: row.country ?? "",
          aliases: row.aliases ?? [],
          birthDate: row.birth_date ?? undefined,
          categories: row.categories ?? [],
        }
      : (registry.entries.find((e) => e.key === key)?.entry ?? entry);
    const reportItem = report.find((r) => r.key === key);
    const pilot = uniquePilots.find((p) => loose(p.name) === loose(reportItem?.name ?? ""));
    const categories = reportItem?.categories ?? [];
    if (pilot) {
      const changes: Change[] = [];
      const merged = mergeEntry(base, pilot, categories, year, changes, []);
      upserts.push({ key, entry: merged, source: "update" });
    } else {
      upserts.push({ key, entry, source: "update" });
    }
  }
  for (const item of created) {
    upserts.push({ ...item, source: "create" });
  }

  if (!upserts.length) {
    console.log("Nada que aplicar.");
    return;
  }

  const payload = upserts.map(({ key, entry }) => ({
    key,
    name: entry.name,
    team: entry.team || null,
    teams: entry.teams ?? {},
    country: entry.country || null,
    aliases: entry.aliases ?? [],
    birth_date: entry.birthDate ?? null,
    categories: entry.categories ?? [],
  }));

  // `teams` se mergea aditivo (pilots.teams ∪ EXCLUDED.teams) para no borrar
  // temporadas históricas que ya estaban en la DB pero no en el registro leído.
  // birth_date/categories solo se pisan si el Excel trae dato (evita borrar
  // lo ya curado a mano cuando la planilla viene incompleta).
  await sql`
    INSERT INTO pilots (key, name, team, teams, country, aliases, birth_date, categories)
    SELECT * FROM jsonb_to_recordset(${JSON.stringify(payload)}::jsonb)
      AS x(key text, name text, team text, teams jsonb, country text, aliases jsonb, birth_date date, categories jsonb)
    ON CONFLICT (key) DO UPDATE SET
      name = EXCLUDED.name,
      team = EXCLUDED.team,
      teams = COALESCE(pilots.teams, '{}'::jsonb) || COALESCE(EXCLUDED.teams, '{}'::jsonb),
      country = EXCLUDED.country,
      aliases = EXCLUDED.aliases,
      birth_date = COALESCE(EXCLUDED.birth_date, pilots.birth_date),
      categories = COALESCE(NULLIF(EXCLUDED.categories, '[]'::jsonb), pilots.categories),
      updated_at = now()
  `;

  const updates = upserts.filter((u) => u.source === "update").length;
  const creates = upserts.filter((u) => u.source === "create").length;
  console.log(`Apply OK: ${updates} actualizados, ${creates} altas en la DB.`);
  console.log("Refresca pilots.json local: npm run db:export -- --force");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
