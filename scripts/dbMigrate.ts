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
  await sql`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL CHECK (role IN ('admin', 'piloto', 'mecanico')),
      name TEXT NOT NULL,
      license_accr TEXT UNIQUE,
      team_slug TEXT,
      pilot_key TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS invitations (
      id SERIAL PRIMARY KEY,
      email TEXT NOT NULL,
      role TEXT NOT NULL CHECK (role IN ('piloto', 'mecanico')),
      name TEXT,
      license_accr TEXT,
      team_slug TEXT,
      pilot_key TEXT,
      token_hash TEXT NOT NULL UNIQUE,
      expires_at TIMESTAMPTZ NOT NULL,
      accepted_at TIMESTAMPTZ,
      accepted_user_id INT REFERENCES users(id),
      created_by INT REFERENCES users(id),
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `;
  // Migraciones aditivas para bases ya existentes.
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS pilot_key TEXT`;
  await sql`ALTER TABLE invitations ADD COLUMN IF NOT EXISTS pilot_key TEXT`;
  console.log("Migración OK: tablas pilots + teams + penalties + users + invitations.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
