import { NextResponse } from "next/server";
import { db, dbUrl } from "@/lib/db";
import { isAuthenticated } from "@/lib/adminAuth";
import { normalizeName } from "@/app/utils/pilotHistory";

export async function GET(request: Request) {
  if (!isAuthenticated(request)) {
    return NextResponse.json({ error: "no autorizado" }, { status: 401 });
  }
  if (!dbUrl()) {
    return NextResponse.json({ error: "sin base de datos" }, { status: 503 });
  }

  const url = new URL(request.url);
  const q = (url.searchParams.get("q") ?? "").trim();
  const limit = Math.min(Number(url.searchParams.get("limit") ?? 50) || 50, 200);
  const offset = Math.max(Number(url.searchParams.get("offset") ?? 0) || 0, 0);
  const sql = db();

  const rows = q
    ? await sql`
        SELECT key, name, team, teams, country, aliases, updated_at
        FROM pilots
        WHERE key ILIKE ${"%" + q + "%"}
           OR name ILIKE ${"%" + q + "%"}
           OR COALESCE(team, '') ILIKE ${"%" + q + "%"}
           OR aliases::text ILIKE ${"%" + q + "%"}
        ORDER BY name
        LIMIT ${limit} OFFSET ${offset}
      `
    : await sql`
        SELECT key, name, team, teams, country, aliases, updated_at
        FROM pilots
        ORDER BY name
        LIMIT ${limit} OFFSET ${offset}
      `;

  const countResult = q
    ? await sql`
        SELECT count(*)::int AS n FROM pilots
        WHERE key ILIKE ${"%" + q + "%"}
           OR name ILIKE ${"%" + q + "%"}
           OR COALESCE(team, '') ILIKE ${"%" + q + "%"}
           OR aliases::text ILIKE ${"%" + q + "%"}
      `
    : await sql`SELECT count(*)::int AS n FROM pilots`;
  const total = (countResult as unknown as Array<{ n: number }>)[0]?.n ?? 0;

  return NextResponse.json({ pilots: rows, total, limit, offset });
}

export async function POST(request: Request) {
  if (!isAuthenticated(request)) {
    return NextResponse.json({ error: "no autorizado" }, { status: 401 });
  }
  if (!dbUrl()) {
    return NextResponse.json({ error: "sin base de datos" }, { status: 503 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "body inválido" }, { status: 400 });
  }
  const name = String(body?.name ?? "").trim();
  if (!name) {
    return NextResponse.json({ error: "name requerido" }, { status: 400 });
  }
  const key = normalizeName(name);
  const sql = db();
  const rows = await sql`
    INSERT INTO pilots (key, name, team, teams, country, aliases)
    VALUES (
      ${key},
      ${name},
      ${body?.team ? String(body.team) : null},
      ${JSON.stringify(body?.teams ?? {})}::jsonb,
      ${body?.country ? String(body.country) : null},
      ${JSON.stringify(body?.aliases ?? [])}::jsonb
    )
    ON CONFLICT (key) DO UPDATE SET
      name = EXCLUDED.name,
      team = EXCLUDED.team,
      teams = EXCLUDED.teams,
      country = EXCLUDED.country,
      aliases = EXCLUDED.aliases,
      updated_at = now()
    RETURNING key, name, team, teams, country, aliases, updated_at
  `;
  return NextResponse.json({ pilot: (rows as unknown as unknown[])[0] }, { status: 201 });
}
