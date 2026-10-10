/**
 * Exporta penales DB → src/data/penalties.json (prebuild).
 */
import { writeFileSync } from "fs";
import path from "path";
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import { db, dbUrl } from "@/lib/db";

interface Row {
  year: string;
  season: string;
  fecha: number;
  cls: string;
  driver: string;
  delta: number;
  note: string | null;
}

async function main() {
  const isVercel = process.env.VERCEL === "1";
  const force = process.argv.includes("--force");
  if (!isVercel && !force) {
    console.log("Export de penales solo corre en Vercel (o con --force).");
    return;
  }
  if (!dbUrl()) {
    console.log("Sin POSTGRES_URL — penales = [].");
    writeFileSync(path.join(process.cwd(), "src/data/penalties.json"), "[]\n");
    return;
  }
  const sql = db();
  const rows = (await sql`
    SELECT year, season, fecha, cls, driver, delta, note
    FROM penalties
    ORDER BY year, season, fecha, cls, driver
  `) as unknown as Row[];
  const file = path.join(process.cwd(), "src/data/penalties.json");
  writeFileSync(file, JSON.stringify(rows, null, 2) + "\n");
  console.log(`Export penales OK: ${rows.length} ajustes.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
