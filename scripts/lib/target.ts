import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from "fs";
import { join } from "path";
import { HISTORY_INDEX, HISTORY_ROOT } from "./paths";

export class TargetError extends Error {}

export interface ClassTemplate {
  year: string;
  season: string;
  folder: string;
  exportName: string;
  title: string;
  path: string;
}

const TITLE_RE = /(?:^|\n)\s*title:\s*(['"])(.*?)\1/;
const EXPORT_RE = /export\s+const\s+(\w+)\s*:\s*Class\b/;

export function normalizeTitle(title: string): string {
  return title
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, " ")
    .trim()
    .toLowerCase();
}

export function readClassMeta(path: string): { exportName: string; title: string } | null {
  if (!existsSync(path)) return null;
  const src = readFileSync(path, "utf8");
  const title = src.match(TITLE_RE);
  const exportName = src.match(EXPORT_RE);
  if (!title || !exportName) return null;
  return { exportName: exportName[1], title: title[2] };
}

/** Lists every class file across all seasons: src/data/history/<year>/<season>/<folder>/index.ts */
export function scanClassFiles(): ClassTemplate[] {
  const templates: ClassTemplate[] = [];
  if (!existsSync(HISTORY_ROOT)) return templates;
  for (const year of readdirSync(HISTORY_ROOT)) {
    if (!/^\d{4}$/.test(year)) continue;
    const yearDir = join(HISTORY_ROOT, year);
    if (!statSync(yearDir).isDirectory()) continue;
    for (const season of readdirSync(yearDir)) {
      const seasonDir = join(yearDir, season);
      if (!statSync(seasonDir).isDirectory()) continue;
      for (const folder of readdirSync(seasonDir)) {
        const classDir = join(seasonDir, folder);
        if (!statSync(classDir).isDirectory()) continue;
        const path = join(classDir, "index.ts");
        const meta = readClassMeta(path);
        if (meta) {
          templates.push({ year, season, folder, exportName: meta.exportName, title: meta.title, path });
        }
      }
    }
  }
  return templates;
}

/**
 * Resolves a PDF title (e.g. "Kid Kart", "VLR Junior") to a known class folder.
 * Matches against class titles found in other seasons so folder quirks (starts vs Stars) are handled.
 */
export function matchClassByTitle(pdfTitle: string, templates: ClassTemplate[]): { template?: ClassTemplate; matches: ClassTemplate[] } {
  const wanted = normalizeTitle(pdfTitle);
  const byFolder = new Map<string, ClassTemplate>();
  const matches: ClassTemplate[] = [];
  for (const t of templates) {
    if (byFolder.has(t.folder)) continue;
    const known = normalizeTitle(t.title);
    const exact = known === wanted;
    const prefix = known.startsWith(wanted + " ") || wanted.startsWith(known + " ");
    if (exact || prefix) {
      byFolder.set(t.folder, t);
      matches.push(t);
    }
  }
  return { template: matches[0], matches };
}

function insertAfterImports(content: string, line: string): string {
  const lines = content.split("\n");
  let lastImport = -1;
  for (let i = 0; i < lines.length; i++) {
    if (/^import\s/.test(lines[i])) lastImport = i;
  }
  lines.splice(lastImport + 1, 0, line);
  return lines.join("\n");
}

function insertIntoArray(content: string, arrayLabel: string, itemLine: string): string {
  const lines = content.split("\n");
  const openIdx = lines.findIndex((l) => new RegExp(`\\b${arrayLabel}\\s*:\\s*\\[`).test(l));
  if (openIdx < 0) throw new TargetError(`No se encontró el arreglo "${arrayLabel}" para registrar el import`);
  for (let i = openIdx + 1; i < lines.length; i++) {
    if (/^\s*\],?\s*$/.test(lines[i])) {
      lines.splice(i, 0, itemLine);
      return lines.join("\n");
    }
  }
  throw new TargetError(`No se encontró el cierre del arreglo "${arrayLabel}"`);
}

function hasImport(content: string, folder: string): boolean {
  return new RegExp(`from\\s+["']\\./${folder}["']`).test(content);
}

/** Ensures <year>/<season>/index.ts exists and imports the class. Returns the season export name. */
export function ensureSeasonIndex(year: string | number, season: string, exportName: string, folder: string): void {
  const seasonDir = join(HISTORY_ROOT, String(year), season);
  const indexPath = join(seasonDir, "index.ts");
  const seasonExport = /^[a-zA-Z_$][\w$]*$/.test(season) ? season : "seasonData";

  if (!existsSync(indexPath)) {
    mkdirSync(seasonDir, { recursive: true });
    const content = [
      `import { Leaderboard } from "@/data/types";`,
      `import { ${exportName} } from "./${folder}";`,
      ``,
      `export const ${seasonExport}: Leaderboard = {`,
      `  year: ${Number(year)},`,
      `  season: '${season}',`,
      `  classes: [`,
      `    ${exportName},`,
      `  ],`,
      `}`,
      ``,
    ].join("\n");
    writeFileSync(indexPath, content, "utf8");
    return;
  }

  let content = readFileSync(indexPath, "utf8");
  if (!hasImport(content, folder)) {
    content = insertAfterImports(content, `import { ${exportName} } from "./${folder}";`);
    content = insertIntoArray(content, "classes", `    ${exportName},`);
    writeFileSync(indexPath, content, "utf8");
  }
}

/** Ensures <year>/index.ts exists and exposes the season. */
export function ensureYearRegistered(year: string | number, season: string): void {
  const yearDir = join(HISTORY_ROOT, String(year));
  const yearIndexPath = join(yearDir, "index.ts");
  const seasonExport = /^[a-zA-Z_$][\w$]*$/.test(season) ? season : "seasonData";
  const championshipExport = `championship${year}`;

  if (!existsSync(yearIndexPath)) {
    mkdirSync(yearDir, { recursive: true });
    const content = [
      `import { Championship } from "../../types";`,
      `import { ${seasonExport} } from "./${season}";`,
      ``,
      `export const ${championshipExport}: Championship = {`,
      `  year: "${year}",`,
      `  ${season}: ${seasonExport},`,
      `}`,
      ``,
    ].join("\n");
    writeFileSync(yearIndexPath, content, "utf8");
    ensureHistoryRegistered(year, championshipExport);
    return;
  }

  let content = readFileSync(yearIndexPath, "utf8");
  if (!hasImport(content, season)) {
    content = insertAfterImports(content, `import { ${seasonExport} } from "./${season}";`);
    const yearLine = content.match(/(?:^|\n)(\s*)year:.*(?:,|\n)/);
    if (!yearLine) throw new TargetError(`No se encontró la línea "year:" en ${yearIndexPath}`);
    const insertAt = content.indexOf(yearLine[0]) + yearLine[0].length;
    const indent = yearLine[1];
    content = content.slice(0, insertAt) + `${indent}${season}: ${seasonExport},\n` + content.slice(insertAt);
    writeFileSync(yearIndexPath, content, "utf8");
  }
  ensureHistoryRegistered(year, championshipExport);
}

/** Ensures src/data/history/index.ts lists the championship year. */
function ensureHistoryRegistered(year: string | number, championshipExport: string): void {
  let content = readFileSync(HISTORY_INDEX, "utf8");
  if (content.includes(`from "./${year}"`)) return;
  content = insertAfterImports(content, `import { ${championshipExport} } from "./${year}";`);
  content = insertIntoArray(content, "years", `    ${championshipExport},`);
  writeFileSync(HISTORY_INDEX, content, "utf8");
}
