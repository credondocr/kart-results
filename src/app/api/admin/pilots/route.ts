import { NextResponse } from "next/server";
import { db, dbUrl } from "@/lib/db";
import { isAuthenticated } from "@/lib/adminAuth";
import { normalizeName } from "@/app/utils/pilotHistory";

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

type PilotRow = {
  key: string;
  name: string;
  team: string | null;
  teams: Record<string, string> | null;
  country: string | null;
  aliases: string[] | null;
  birth_date: unknown;
  categories: string[] | null;
  updated_at?: string;
};

function serialize(row: PilotRow) {
  return { ...row, birth_date: isoDate(row.birth_date) };
}

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
        SELECT key, name, team, teams, country, aliases, birth_date, categories, updated_at
        FROM pilots
        WHERE key ILIKE ${"%" + q + "%"}
           OR name ILIKE ${"%" + q + "%"}
           OR COALESCE(team, '') ILIKE ${"%" + q + "%"}
           OR aliases::text ILIKE ${"%" + q + "%"}
        ORDER BY name
        LIMIT ${limit} OFFSET ${offset}
      `
    : await sql`
        SELECT key, name, team, teams, country, aliases, birth_date, categories, updated_at
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

  return NextResponse.json({
    pilots: (rows as unknown as PilotRow[]).map(serialize),
    total,
    limit,
    offset,
  });
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
  const birthDateRaw = String(body?.birthDate ?? "").trim();
  let birthDate: string | null = null;
  if (birthDateRaw) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(birthDateRaw) || Number.isNaN(Date.parse(birthDateRaw))) {
      return NextResponse.json({ error: "birthDate inválida (usa YYYY-MM-DD)" }, { status: 400 });
    }
    birthDate = birthDateRaw;
  }
  const categories = Array.isArray(body?.categories)
    ? body.categories.map((c) => String(c).trim()).filter(Boolean)
    : [];
  const key = normalizeName(name);
  const sql = db();
  const rows = await sql`
    INSERT INTO pilots (key, name, team, teams, country, aliases, birth_date, categories)
    VALUES (
      ${key},
      ${name},
      ${body?.team ? String(body.team) : null},
      ${JSON.stringify(body?.teams ?? {})}::jsonb,
      ${body?.country ? String(body.country) : null},
      ${JSON.stringify(body?.aliases ?? [])}::jsonb,
      ${birthDate}::date,
      ${JSON.stringify(categories)}::jsonb
    )
    ON CONFLICT (key) DO UPDATE SET
      name = EXCLUDED.name,
      team = EXCLUDED.team,
      teams = EXCLUDED.teams,
      country = EXCLUDED.country,
      aliases = EXCLUDED.aliases,
      birth_date = EXCLUDED.birth_date,
      categories = EXCLUDED.categories,
      updated_at = now()
    RETURNING key, name, team, teams, country, aliases, birth_date, categories, updated_at
  `;
  return NextResponse.json(
    { pilot: serialize((rows as unknown as PilotRow[])[0]) },
    { status: 201 }
  );
}
