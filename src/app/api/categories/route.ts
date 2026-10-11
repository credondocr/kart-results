import { NextResponse } from "next/server";
import { db, dbUrl } from "@/lib/db";
import { requireRole } from "@/lib/auth";

export async function GET(request: Request) {
  // Público para el marquee del landing y formularios.
  if (!dbUrl()) {
    return NextResponse.json({ categories: [] });
  }
  const sql = db();
  const onlyActive = new URL(request.url).searchParams.get("active") === "1";
  const rows = onlyActive
    ? ((await sql`
        SELECT id, name, slug, active, sort_order
        FROM categories WHERE active = true
        ORDER BY sort_order, name
      `) as unknown as Array<Record<string, unknown>>)
    : ((await sql`
        SELECT id, name, slug, active, sort_order
        FROM categories
        ORDER BY sort_order, name
      `) as unknown as Array<Record<string, unknown>>);
  return NextResponse.json({ categories: rows });
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
  if (!name) {
    return NextResponse.json({ error: "name requerido" }, { status: 400 });
  }
  const slug =
    String(body?.slug ?? "")
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") ||
    name
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  const active = body?.active !== false;
  const sortOrder = Number(body?.sort_order ?? 99) || 99;

  const sql = db();
  const rows = (await sql`
    INSERT INTO categories (name, slug, active, sort_order)
    VALUES (${name}, ${slug}, ${active}, ${sortOrder})
    ON CONFLICT (slug) DO UPDATE SET
      name = EXCLUDED.name, active = EXCLUDED.active, sort_order = EXCLUDED.sort_order
    RETURNING id, name, slug, active, sort_order
  `) as unknown as Array<Record<string, unknown>>;
  return NextResponse.json({ category: rows[0] }, { status: 201 });
}
