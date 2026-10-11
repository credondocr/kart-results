import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import { db, dbUrl } from "@/lib/db";

const SEED = [
  "KID KART",
  "STARS OF TOMORROW",
  "MINI ROK",
  "MICRO ROK",
  "LO 206",
  "TILLOTSON",
  "VLR",
  "ROK SHIFTER",
  "MINI T4",
];

const slugify = (s: string) =>
  s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

async function main() {
  if (!dbUrl()) {
    console.log("Sin POSTGRES_URL — seed categorías omitido.");
    return;
  }
  const sql = db();
  SEED.forEach(() => {});
  for (let i = 0; i < SEED.length; i++) {
    const name = SEED[i];
    await sql`
      INSERT INTO categories (name, slug, active, sort_order)
      VALUES (${name}, ${slugify(name)}, true, ${i})
      ON CONFLICT (slug) DO NOTHING
    `;
  }
  console.log(`Seed categorías OK: ${SEED.length}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
