import { NextResponse } from "next/server";
import { db, dbUrl } from "@/lib/db";
import { requireRole } from "@/lib/auth";

type Params = { params: Promise<{ id: string }> };

export async function GET(request: Request, { params }: Params) {
  if (!requireRole(request, ["admin", "editor"])) {
    return NextResponse.json({ error: "no autorizado" }, { status: 401 });
  }
  if (!dbUrl()) {
    return NextResponse.json({ error: "sin base de datos" }, { status: 503 });
  }
  const { id } = await params;
  const sql = db();
  const rows = (await sql`
    SELECT * FROM news WHERE id = ${Number(id)}
  `) as unknown as Array<Record<string, unknown>>;
  if (!rows.length) {
    return NextResponse.json({ error: "no encontrada" }, { status: 404 });
  }
  return NextResponse.json({ news: rows[0] });
}

export async function PUT(request: Request, { params }: Params) {
  if (!requireRole(request, ["admin", "editor"])) {
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
    SELECT id, slug, title, excerpt, content, tag, cover_image, status, scheduled_at, published_at
    FROM news WHERE id = ${idNum}
  `) as unknown as Array<{
    id: number;
    slug: string;
    title: string;
    status: string;
    scheduled_at: string | null;
    published_at: string | null;
  }>;
  const row = current[0];
  if (!row) {
    return NextResponse.json({ error: "no encontrada" }, { status: 404 });
  }

  const title = body?.title != null ? String(body.title).trim() || row.title : row.title;
  const status =
    body?.status === "published" || body?.status === "draft"
      ? String(body.status)
      : row.status;
  const scheduledAt =
    body?.scheduled_at !== undefined
      ? body.scheduled_at
        ? String(body.scheduled_at)
        : null
      : row.scheduled_at;

  const updated = (await sql`
    UPDATE news SET
      slug = ${body?.slug ? String(body.slug).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") : row.slug},
      title = ${title},
      excerpt = ${body?.excerpt != null ? String(body.excerpt).slice(0, 300) : null},
      content = ${body?.content != null ? String(body.content) : undefined},
      tag = ${body?.tag != null ? String(body.tag).trim() : null},
      cover_image = ${body?.cover_image != null ? String(body.cover_image) : null},
      status = ${status},
      scheduled_at = ${scheduledAt ? scheduledAt + "Z" : null}::timestamptz,
      published_at = CASE WHEN ${status} = 'published'
        THEN COALESCE(${scheduledAt ? scheduledAt + "Z" : null}::timestamptz, now())
        ELSE NULL
      END,
      updated_at = now()
    WHERE id = ${idNum}
    RETURNING id, slug, title, status, scheduled_at, published_at
  `) as unknown as Array<Record<string, unknown>>;

  return NextResponse.json({ news: updated[0] });
}

export async function DELETE(request: Request, { params }: Params) {
  if (!requireRole(request, ["admin", "editor"])) {
    return NextResponse.json({ error: "no autorizado" }, { status: 401 });
  }
  if (!dbUrl()) {
    return NextResponse.json({ error: "sin base de datos" }, { status: 503 });
  }
  const { id } = await params;
  const sql = db();
  const deleted = (await sql`
    DELETE FROM news WHERE id = ${Number(id)} RETURNING id
  `) as unknown as Array<{ id: number }>;
  if (!deleted.length) {
    return NextResponse.json({ error: "no encontrada" }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
