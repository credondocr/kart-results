import { NextResponse } from "next/server";
import { db, dbUrl } from "@/lib/db";
import { isAuthenticated } from "@/lib/adminAuth";

type Params = { params: Promise<{ key: string }> };

interface PilotRow {
  key: string;
  name: string;
  team: string | null;
  teams: Record<string, string> | null;
  country: string | null;
  aliases: string[] | null;
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
    SELECT key, name, team, teams, country, aliases, updated_at
    FROM pilots WHERE key = ${key}
  `) as unknown as PilotRow[];
  const pilot = rows[0];
  if (!pilot) {
    return NextResponse.json({ error: "no encontrado" }, { status: 404 });
  }
  return NextResponse.json({ pilot });
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
    SELECT key, name, team, teams, country, aliases
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

  const updated = (await sql`
    UPDATE pilots SET
      name = ${name},
      team = ${team},
      teams = ${JSON.stringify(teams)}::jsonb,
      country = ${country},
      aliases = ${JSON.stringify(aliases)}::jsonb,
      updated_at = now()
    WHERE key = ${key}
    RETURNING key, name, team, teams, country, aliases, updated_at
  `) as unknown as PilotRow[];

  return NextResponse.json({ pilot: updated[0] });
}
