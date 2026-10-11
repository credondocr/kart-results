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
      role TEXT NOT NULL CHECK (role IN ('admin', 'piloto', 'editor')),
      name TEXT NOT NULL,
      license_accr TEXT UNIQUE,
      team_slug TEXT,
      pilot_key TEXT,
      bio TEXT,
      parent_id INT REFERENCES users(id),
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS invitations (
      id SERIAL PRIMARY KEY,
      email TEXT NOT NULL,
      role TEXT NOT NULL CHECK (role IN ('piloto', 'editor')),
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
  await sql`
    CREATE TABLE IF NOT EXISTS race_dates (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      race_date TIMESTAMPTZ NOT NULL,
      status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'closed', 'done')),
      location TEXT,
      categories JSONB NOT NULL DEFAULT '[]'::jsonb,
      price_base NUMERIC,
      price_per_category JSONB,
      closes_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS registrations (
      id SERIAL PRIMARY KEY,
      race_date_id INT NOT NULL REFERENCES race_dates(id),
      user_id INT NOT NULL REFERENCES users(id),
      license_accr TEXT,
      transponder TEXT,
      payment_method TEXT NOT NULL CHECK (payment_method IN ('transfer', 'track')),
      ticket_url TEXT,
      amount_total NUMERIC,
      categories JSONB NOT NULL DEFAULT '[]'::jsonb,
      team_slug TEXT,
      status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'approved', 'rejected')),
      rejection_note TEXT,
      ack_responsibility BOOLEAN NOT NULL DEFAULT false,
      verified_by INT REFERENCES users(id),
      verified_at TIMESTAMPTZ,
      approved_by INT REFERENCES users(id),
      approved_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      UNIQUE (race_date_id, user_id)
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS categories (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      slug TEXT NOT NULL UNIQUE,
      active BOOLEAN NOT NULL DEFAULT true,
      sort_order INT NOT NULL DEFAULT 0,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS password_resets (
      id SERIAL PRIMARY KEY,
      user_id INT NOT NULL REFERENCES users(id),
      token_hash TEXT NOT NULL UNIQUE,
      expires_at TIMESTAMPTZ NOT NULL,
      used_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS news (
      id SERIAL PRIMARY KEY,
      slug TEXT NOT NULL UNIQUE,
      title TEXT NOT NULL,
      excerpt TEXT,
      content TEXT NOT NULL DEFAULT '',
      tag TEXT,
      cover_image TEXT,
      status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
      scheduled_at TIMESTAMPTZ,
      published_at TIMESTAMPTZ,
      author_id INT REFERENCES users(id),
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `;
  console.log("Migración OK: news incluida.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
