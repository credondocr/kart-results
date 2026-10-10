/**
 * Seed idempotente de equipos: inserta solo los que falten.
 * Toma como base src/data/teams.json (catálogo histórico).
 */
import { readFileSync } from "fs";
import path from "path";
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import { db, dbUrl } from "@/lib/db";

type TeamRow = {
  slug: string;
  name: string;
  logo?: string;
  visible?: boolean;
};

async function main() {
  if (!dbUrl()) {
    console.log("Sin POSTGRES_URL — seed de equipos omitido.");
    return;
  }
  const file = path.join(process.cwd(), "src/data/teams.json");
  const rows = (JSON.parse(readFileSync(file, "utf-8")) as TeamRow[]).map((t) => ({
    slug: t.slug,
    name: t.name,
    visible: t.visible !== false,
  }));
  const sql = db();
  await sql`
    INSERT INTO teams (slug, name, visible)
    SELECT * FROM jsonb_to_recordset(${JSON.stringify(rows)}::jsonb)
      AS x(slug text, name text, visible boolean)
    ON CONFLICT (slug) DO NOTHING
  `;
  console.log(`Seed equipos OK: ${rows.length} en archivo, insertados solo faltantes.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
