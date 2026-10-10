/**
 * Exporta equipos desde la DB → src/data/teams.json y, si hay logo
 * subido por el admin (logo_png), lo escribe a public/logos/{slug}.png.
 * Corre en prebuild de Vercel (o con --force localmente).
 */
import { mkdirSync, readFileSync, writeFileSync, existsSync } from "fs";
import path from "path";
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import { db, dbUrl } from "@/lib/db";

type TeamDbRow = {
  slug: string;
  name: string;
  visible: boolean;
  has_logo: boolean;
  logo_png: Buffer | Uint8Array | null;
};

async function main() {
  const isVercel = process.env.VERCEL === "1";
  const force = process.argv.includes("--force");
  if (!isVercel && !force) {
    console.log("Export de equipos solo corre en Vercel (o con --force).");
    return;
  }
  if (!dbUrl()) {
    console.log("Sin POSTGRES_URL — export de equipos omitido.");
    return;
  }
  const sql = db();
  const rows = (await sql`
    SELECT slug, name, visible,
           (logo_png IS NOT NULL) AS has_logo,
           logo_png
    FROM teams
    ORDER BY visible DESC, name
  `) as unknown as TeamDbRow[];

  if (!rows.length) {
    console.log("DB vacía de equipos — no se sobrescribe teams.json.");
    return;
  }

  const logosDir = path.join(process.cwd(), "public/logos");
  mkdirSync(logosDir, { recursive: true });
  let logosWritten = 0;
  const catalog = rows.map((r) => {
    if (r.logo_png && r.has_logo) {
      const buf = Buffer.from(r.logo_png);
      if (buf.length) {
        writeFileSync(path.join(logosDir, `${r.slug}.png`), buf);
        logosWritten++;
      }
    }
    return {
      slug: r.slug,
      name: r.name,
      logo: `/logos/${r.slug}.png`,
      visible: r.visible,
    };
  });

  const file = path.join(process.cwd(), "src/data/teams.json");
  const next = JSON.stringify(catalog, null, 2) + "\n";
  const prev = existsSync(file) ? readFileSync(file, "utf-8") : "";
  if (prev === next) {
    console.log(`Export equipos OK: teams.json sin cambios (${rows.length}).`);
  } else {
    writeFileSync(file, next);
    console.log(
      `Export equipos OK: teams.json actualizado (${rows.length} equipos, ${logosWritten} logos).`
    );
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
