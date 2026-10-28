import { NextResponse } from "next/server";
import { db, dbUrl } from "@/lib/db";
import { requireRole } from "@/lib/auth";

type Params = { params: Promise<{ id: string }> };

export async function PUT(request: Request, { params }: Params) {
  if (!requireRole(request, ["admin"])) {
    return NextResponse.json({ error: "no autorizado" }, { status: 401 });
  }
  if (!dbUrl()) {
    return NextResponse.json({ error: "sin base de datos" }, { status: 503 });
  }
  const { id } = await params;
  const idNum = Number(id);
  if (!Number.isInteger(idNum)) {
    return NextResponse.json({ error: "id inválido" }, { status: 400 });
  }
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "body inválido" }, { status: 400 });
  }

  const sql = db();
  const current = (await sql`
    SELECT id, name, race_date, status, location, categories, price_base
    FROM race_dates WHERE id = ${idNum}
  `) as unknown as Array<{
    id: number;
    name: string;
    race_date: string;
    status: string;
    location: string | null;
    categories: string[];
    price_base: number | null;
  }>;
  const row = current[0];
  if (!row) {
    return NextResponse.json({ error: "no encontrada" }, { status: 404 });
  }

  const status =
    body?.status === "open" || body?.status === "closed" || body?.status === "done"
      ? String(body.status)
      : row.status;
  const name = body?.name != null ? String(body.name).trim() || row.name : row.name;
  const raceDate =
    body?.race_date != null
      ? String(body.race_date).trim() || row.race_date
      : row.race_date;
  const location =
    body?.location !== undefined
      ? body.location
        ? String(body.location)
        : null
      : row.location;
  const categories =
    body?.categories != null && Array.isArray(body.categories)
      ? (body.categories as string[]).filter(Boolean)
      : row.categories;
  const priceBase =
    body?.price_base !== undefined
      ? body.price_base == null || body.price_base === ""
        ? null
        : Number(body.price_base)
      : row.price_base;

  if (status === "open") {
    const otherOpen = (await sql`
      SELECT id FROM race_dates WHERE status = 'open' AND id != ${idNum} LIMIT 1
    `) as unknown as Array<{ id: number }>;
    if (otherOpen.length) {
      return NextResponse.json(
        { error: "ya hay otra fecha abierta" },
        { status: 409 }
      );
    }
  }

  const updated = (await sql`
    UPDATE race_dates SET
      name = ${name},
      race_date = ${raceDate}::timestamptz,
      status = ${status},
      location = ${location},
      categories = ${JSON.stringify(categories)}::jsonb,
      price_base = ${priceBase}
    WHERE id = ${idNum}
    RETURNING id, name, race_date, status, location, categories, price_base
  `) as unknown as Array<Record<string, unknown>>;
  return NextResponse.json({ date: updated[0] });
}
