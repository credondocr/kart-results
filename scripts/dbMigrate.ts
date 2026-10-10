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
  await sql`
    CREATE TABLE IF NOT EXISTS teams (
      slug TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      logo_png BYTEA,
      visible BOOLEAN NOT NULL DEFAULT true,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS penalties (
      id SERIAL PRIMARY KEY,
      year TEXT NOT NULL,
      season TEXT NOT NULL,
      fecha INT NOT NULL,
      cls TEXT NOT NULL,
      driver TEXT NOT NULL,
      delta DOUBLE PRECISION NOT NULL,
      note TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `;
  console.log("Migración OK: tablas pilots + teams + penalties.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
