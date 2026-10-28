import { NextResponse } from "next/server";
import { db, dbUrl } from "@/lib/db";
import { isAuthenticated } from "@/lib/adminAuth";

/** El driver de neon devuelve `date` como Date/timestamp; el admin espera YYYY-MM-DD. */
function isoDate(value: unknown): string | null {
  if (!value) return null;
  if (typeof value === "string") {
    const match = /^(\d{4}-\d{2}-\d{2})/.exec(value);
    return match ? match[1] : null;
  }
  if (value instanceof Date) {
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${value.getFullYear()}-${pad(value.getMonth() + 1)}-${pad(value.getDate())}`;
  }
  return null;
}

type Params = { params: Promise<{ key: string }> };

interface PilotRow {
  key: string;
  name: string;
  team: string | null;
  teams: Record<string, string> | null;
  country: string | null;
  aliases: string[] | null;
  birth_date: unknown;
  categories: string[] | null;
  updated_at?: string;
}

function serialize(row: PilotRow) {
  return { ...row, birth_date: isoDate(row.birth_date) };
}

export async function GET(request: Request, { params }: Params) {
  if (!isAuthenticated(request)) {
    return NextResponse.json({ error: "no autorizado" }, { status: 401 });
  }
  if (!dbUrl()) {
    return NextResponse.json({ error: "sin base de datos" }, { status: 503 });
  }
  const { key } = await params;
  const sql = db();
  const rows = (await sql`
    SELECT key, name, team, teams, country, aliases, birth_date, categories, updated_at
    FROM pilots WHERE key = ${key}
  `) as unknown as PilotRow[];
  const pilot = rows[0];
  if (!pilot) {
    return NextResponse.json({ error: "no encontrado" }, { status: 404 });
  }
  return NextResponse.json({ pilot: serialize(pilot) });
}

export async function PUT(request: Request, { params }: Params) {
  if (!isAuthenticated(request)) {
    return NextResponse.json({ error: "no autorizado" }, { status: 401 });
  }
  if (!dbUrl()) {
    return NextResponse.json({ error: "sin base de datos" }, { status: 503 });
  }
  const { key } = await params;
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "body inválido" }, { status: 400 });
  }

  const sql = db();
  const current = (await sql`
    SELECT key, name, team, teams, country, aliases, birth_date, categories
    FROM pilots WHERE key = ${key}
  `) as unknown as PilotRow[];
  const row = current[0];
  if (!row) {
    return NextResponse.json({ error: "no encontrado" }, { status: 404 });
  }

  // Merge: los campos presentes en el body sobreescriben (aceptan null/vacío
  // para limpiar); los ausentes conservan el valor actual.
  const name =
    body?.name !== undefined ? String(body.name).trim() || row.name : row.name;
  const team =
    body?.team !== undefined
      ? body.team === null || body.team === ""
        ? null
        : String(body.team)
      : row.team;
  const teams =
    body?.teams !== undefined && body.teams !== null
      ? (body.teams as Record<string, string>)
      : row.teams ?? {};
  const country =
    body?.country !== undefined
      ? body.country === null || body.country === ""
        ? null
        : String(body.country)
      : row.country;
  const aliases =
    body?.aliases !== undefined && body.aliases !== null
      ? (body.aliases as string[])
      : row.aliases ?? [];
  let birthDate: string | null;
  if (body?.birthDate === undefined) {
    birthDate = isoDate(row.birth_date);
  } else if (body.birthDate === null || body.birthDate === "") {
    birthDate = null;
  } else {
    birthDate = String(body.birthDate);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(birthDate) || Number.isNaN(Date.parse(birthDate))) {
      return NextResponse.json({ error: "birthDate inválida (usa YYYY-MM-DD)" }, { status: 400 });
    }
  }
  const categories =
    body?.categories !== undefined && body.categories !== null
      ? (body.categories as string[]).map((c) => String(c).trim()).filter(Boolean)
      : row.categories ?? [];

  const updated = (await sql`
    UPDATE pilots SET
      name = ${name},
      team = ${team},
      teams = ${JSON.stringify(teams)}::jsonb,
      country = ${country},
      aliases = ${JSON.stringify(aliases)}::jsonb,
      birth_date = ${birthDate}::date,
      categories = ${JSON.stringify(categories)}::jsonb,
      updated_at = now()
    WHERE key = ${key}
    RETURNING key, name, team, teams, country, aliases, birth_date, categories, updated_at
  `) as unknown as PilotRow[];

  return NextResponse.json({ pilot: serialize(updated[0]) });
}
