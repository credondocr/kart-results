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
    SELECT id, name, active, sort_order FROM categories WHERE id = ${idNum}
  `) as unknown as Array<{
    id: number;
    name: string;
    active: boolean;
    sort_order: number;
  }>;
  const row = current[0];
  if (!row) {
    return NextResponse.json({ error: "no encontrada" }, { status: 404 });
  }
  const name = body?.name != null ? String(body.name).trim() || row.name : row.name;
  const active = body?.active != null ? Boolean(body.active) : row.active;
  const sortOrder =
    body?.sort_order != null ? Number(body.sort_order) || 0 : row.sort_order;

  const updated = (await sql`
    UPDATE categories SET name = ${name}, active = ${active}, sort_order = ${sortOrder}
    WHERE id = ${idNum}
    RETURNING id, name, slug, active, sort_order
  `) as unknown as Array<Record<string, unknown>>;
  return NextResponse.json({ category: updated[0] });
}

export async function DELETE(request: Request, { params }: Params) {
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
  const sql = db();
  const deleted = (await sql`
    DELETE FROM categories WHERE id = ${idNum} RETURNING id
  `) as unknown as Array<{ id: number }>;
  if (!deleted.length) {
    return NextResponse.json({ error: "no encontrada" }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
