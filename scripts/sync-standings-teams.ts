/**
 * Sincroniza `result.team` en las tablas de standings de un año desde el
 * registro de pilots.json (equipo de la temporada en el registro).
 *
 * Solo actualiza pilotos con dato explícito de equipo para ese año en el
 * registro (teams[year]); los demás conservan su valor actual.
 *
 * Uso:
 *   npm run standings:sync-teams               # año 2026 (default)
 *   npm run standings:sync-teams -- 2025       # otro año
 *   npm run standings:sync-teams -- --dry-run  # reporte sin escribir
 */
import { writeFileSync } from "fs";
import { pathToFileURL } from "url";
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { loadRegistry, resolvePilot } from "./lib/pilots";
import { scanClassFiles, readClassMeta } from "./lib/target";
import { serializeClass } from "./lib/codegen";
import type { Class } from "../src/data/types";

function parseArgs(argv: string[]): { year: string; dryRun: boolean } {
  let year = "2026";
  let dryRun = false;
  for (const arg of argv) {
    if (arg === "--dry-run") dryRun = true;
    else if (/^\d{4}$/.test(arg)) year = arg;
    else throw new Error(`Argumento desconocido: ${arg}`);
  }
  return { year, dryRun };
}

async function main(): Promise<void> {
  const { year, dryRun } = parseArgs(process.argv.slice(2));
  const registry = loadRegistry();
  const templates = scanClassFiles().filter((t) => t.year === year);

  if (!templates.length) {
    console.log(`No hay archivos de clases para ${year}.`);
    return;
  }

  let totalChanged = 0;
  let filesChanged = 0;

  for (const t of templates) {
    const meta = readClassMeta(t.path);
    if (!meta) continue;
    const mod = (await import(pathToFileURL(t.path).href)) as Record<string, Class>;
    const cls = mod[meta.exportName];
    if (!cls) throw new Error(`Export "${meta.exportName}" no encontrado en ${t.path}`);

    const details: string[] = [];
    for (const category of cls.categories) {
      for (const result of category.results) {
        const resolved = resolvePilot(registry, result.driver, year);
        const team = resolved?.entry.teams?.[year];
        if (team && team !== result.team) {
          details.push(`${result.driver}: ${result.team || "(vacío)"} → ${team}`);
          result.team = team;
        }
      }
    }

    if (details.length) {
      filesChanged++;
      totalChanged += details.length;
      console.log(`\n${t.season}/${t.folder} (${details.length}):`);
      for (const d of details) console.log(`  • ${d}`);
      if (!dryRun) writeFileSync(t.path, serializeClass(cls, meta.exportName), "utf8");
    }
  }

  console.log(
    `\n${dryRun ? "[dry-run] " : ""}${totalChanged} resultado(s) actualizado(s) en ${filesChanged} archivo(s) (${year}).`
  );
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
