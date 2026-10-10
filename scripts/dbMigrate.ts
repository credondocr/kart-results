import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import { db, dbUrl } from "@/lib/db";

async function main() {
  if (!dbUrl()) {
    console.log("Sin POSTGRES_URL — nada que migrar.");
    return;
  }
  const sql = db();
  await sql`
    CREATE TABLE IF NOT EXISTS pilots (
      key TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      team TEXT,
      teams JSONB NOT NULL DEFAULT '{}'::jsonb,
      country TEXT,
      aliases JSONB NOT NULL DEFAULT '[]'::jsonb,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `;
  await sql`
    CREATE INDEX IF NOT EXISTS pilots_name_idx ON pilots (lower(name))
  `;
  console.log("Migración OK: tabla pilots.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
