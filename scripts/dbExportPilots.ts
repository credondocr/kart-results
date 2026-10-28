/**
 * Exporta pilots desde la DB → src/data/pilots.json.
 * Corre como prebuild en Vercel (si hay POSTGRES_URL) para que el
 * sitio estático use los datos curados del panel /admin.
 * Sin DB disponible: no-op (se usa el pilots.json del repo).
 */
import { readFileSync, writeFileSync } from "fs";
import path from "path";
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import { db, dbUrl } from "@/lib/db";

type Row = {
  key: string;
  name: string;
  team: string | null;
  teams: Record<string, string> | null;
  country: string | null;
  aliases: string[] | null;
  birth_date: Date | string | null;
  categories: string[] | null;
};

/** El driver de neon devuelve `date` como Date local; el registro guarda solo YYYY-MM-DD. */
function toIsoDate(value: Date | string | null): string | null {
  if (!value) return null;
  if (typeof value === "string") {
    const match = /^(\d{4}-\d{2}-\d{2})/.exec(value);
    return match ? match[1] : null;
  }
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${value.getFullYear()}-${pad(value.getMonth() + 1)}-${pad(value.getDate())}`;
}

async function main() {
  const isVercel = process.env.VERCEL === "1";
  const force = process.argv.includes("--force");
  if (!isVercel && !force) {
    console.log("Export solo corre en Vercel (o con npm run db:export -- --force).");
    return;
  }
  if (!dbUrl()) {
    console.log("Sin POSTGRES_URL — export omitido, se usa pilots.json del repo.");
    return;
  }
  const sql = db();
  const rows = (await sql`
    SELECT key, name, team, teams, country, aliases, birth_date, categories
    FROM pilots
    ORDER BY key
  `) as unknown as Row[];

  if (!rows.length) {
    console.log("DB vacía — no se sobrescribe pilots.json. Corre npm run db:seed primero.");
    return;
  }

  const out: Record<
    string,
    {
      name: string;
      team?: string;
      teams?: Record<string, string>;
      country?: string;
      aliases?: string[];
      birthDate?: string;
      categories?: string[];
    }
  > = {};
  for (const r of rows) {
    // Orden de claves igual al pilots.json original (name, team, teams,
    // country, aliases, birthDate, categories) y team/country siempre
    // presentes (string vacío si no hay dato): pilotRegistry hace
    // `as Record<string, RegistryEntry>` con esos campos requeridos y el
    // cast rompe si las claves faltan.
    const entry: (typeof out)[string] = {
      name: r.name,
      team: r.team ?? "",
    };
    if (r.teams && Object.keys(r.teams).length) entry.teams = r.teams;
    entry.country = r.country ?? "";
    if (r.aliases?.length) entry.aliases = r.aliases;
    const birthDate = toIsoDate(r.birth_date);
    if (birthDate) entry.birthDate = birthDate;
    if (r.categories?.length) entry.categories = r.categories;
    out[r.key] = entry;
  }

  const file = path.join(process.cwd(), "src/data/pilots.json");
  const prev = readFileSync(file, "utf-8");
  const next = JSON.stringify(out, null, 2) + "\n";
  if (prev === next) {
    console.log(`Export OK: pilots.json sin cambios (${rows.length} pilotos).`);
    return;
  }
  writeFileSync(file, next);
  console.log(`Export OK: pilots.json actualizado desde DB (${rows.length} pilotos).`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
