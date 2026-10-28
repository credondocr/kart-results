import { NextResponse } from "next/server";
import { db, dbUrl } from "@/lib/db";
import { requireRole } from "@/lib/auth";

export async function GET(request: Request) {
  if (!requireRole(request, ["admin"])) {
    return NextResponse.json({ error: "no autorizado" }, { status: 401 });
  }
  if (!dbUrl()) {
    return NextResponse.json({ error: "sin base de datos" }, { status: 503 });
  }
  const sql = db();
  const rows = (await sql`
    SELECT id, name, race_date, status, location, categories,
           price_base, closes_at, created_at
    FROM race_dates
    ORDER BY race_date DESC
    LIMIT 100
  `) as unknown as Array<Record<string, unknown>>;
  return NextResponse.json({ dates: rows });
}

export async function POST(request: Request) {
  if (!requireRole(request, ["admin"])) {
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
  const raceDate = String(body?.race_date ?? "").trim();
  const location = body?.location ? String(body.location).trim() : null;
  const categories = Array.isArray(body?.categories)
    ? (body.categories as string[]).filter(Boolean)
    : [];
  const priceBase =
    body?.price_base != null && body.price_base !== ""
      ? Number(body.price_base)
      : null;
  const status = body?.status === "closed" ? "closed" : "open";

  if (!name || !raceDate || !categories.length) {
    return NextResponse.json(
      { error: "name, race_date y categories requeridos" },
      { status: 400 }
    );
  }
  if (priceBase != null && (!Number.isFinite(priceBase) || priceBase < 0)) {
    return NextResponse.json({ error: "price_base inválido" }, { status: 400 });
  }

  const sql = db();
  const openCount = (await sql`
    SELECT count(*)::int AS n FROM race_dates WHERE status = 'open'
  `) as unknown as Array<{ n: number }>;
  if (status === "open" && openCount[0]?.n >= 1) {
    return NextResponse.json(
      { error: "ya hay una fecha abierta; ciérrala antes de abrir otra" },
      { status: 409 }
    );
  }

  const rows = (await sql`
    INSERT INTO race_dates (name, race_date, status, location, categories, price_base)
    VALUES (
      ${name},
      ${raceDate}::timestamptz,
      ${status},
      ${location},
      ${JSON.stringify(categories)}::jsonb,
      ${priceBase}
    )
    RETURNING id, name, race_date, status, location, categories, price_base
  `) as unknown as Array<Record<string, unknown>>;
  return NextResponse.json({ date: rows[0] }, { status: 201 });
}
