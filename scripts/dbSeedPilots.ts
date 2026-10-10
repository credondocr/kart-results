/**
 * Seed idempotente: inserta en la DB solo los pilotos que falten.
 * Nunca sobreescribe filas existentes (la DB es la fuente de verdad
 * una vez sembrada; los ajustes se hacen por el panel /admin).
 */
import { readFileSync } from "fs";
import path from "path";
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import { db, dbUrl } from "@/lib/db";

type Entry = {
  name: string;
  team?: string;
  teams?: Record<string, string>;
  country?: string;
  aliases?: string[];
};

async function main() {
  if (!dbUrl()) {
    console.log("Sin POSTGRES_URL — seed omitido.");
    return;
  }
  const file = path.join(process.cwd(), "src/data/pilots.json");
  const data = JSON.parse(readFileSync(file, "utf-8")) as Record<string, Entry>;
  const rows = Object.entries(data).map(([key, e]) => ({
    key,
    name: e.name,
    team: e.team ?? null,
    teams: e.teams ?? {},
    country: e.country ?? null,
    aliases: e.aliases ?? [],
  }));

  const sql = db();
  const result = await sql`
    INSERT INTO pilots (key, name, team, teams, country, aliases)
    SELECT * FROM jsonb_to_recordset(${JSON.stringify(rows)}::jsonb)
      AS x(key text, name text, team text, teams jsonb, country text, aliases jsonb)
    ON CONFLICT (key) DO NOTHING
  `;
  console.log(`Seed OK: ${rows.length} pilotos en archivo, insertados solo faltantes.`);
  void result;
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
