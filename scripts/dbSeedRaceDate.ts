/**
 * Seed de la próxima fecha (solo si no hay ninguna open/futura).
 * El admin la editará desde el panel en Fase 2.
 */
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import { db, dbUrl } from "@/lib/db";

async function main() {
  if (!dbUrl()) {
    console.log("Sin POSTGRES_URL — seed race_dates omitido.");
    return;
  }
  const sql = db();
  const existing = (await sql`
    SELECT id FROM race_dates WHERE status = 'open' AND race_date > now() LIMIT 1
  `) as unknown as Array<{ id: number }>;
  if (existing.length) {
    console.log("Ya hay una fecha abierta — seed omitido.");
    return;
  }
  // Fecha de ejemplo editable (sábado +3 semanas a las 08:00 CR).
  const d = new Date(Date.now() + 21 * 86400_000);
  d.setHours(8, 0, 0, 0);
  await sql`
    INSERT INTO race_dates (name, race_date, status, location, categories, price_base)
    VALUES (
      'CRKC — Próxima fecha',
      ${d.toISOString()}::timestamptz,
      'open',
      'Costa Rica',
      ${JSON.stringify([
        "KID KART",
        "STARS OF TOMORROW",
        "MINI ROK",
        "MICRO ROK",
        "LO 206",
        "TILLOTSON",
        "VLR",
        "ROK SHIFTER",
      ])}::jsonb,
      35000
    )
  `;
  console.log(`Seed race_dates OK: ${d.toISOString()}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
