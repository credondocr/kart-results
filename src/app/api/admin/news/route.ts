import { NextResponse } from "next/server";
import { db, dbUrl } from "@/lib/db";
import { requireRole } from "@/lib/auth";

export async function GET(request: Request) {
  if (!requireRole(request, ["admin", "editor"])) {
    return NextResponse.json({ error: "no autorizado" }, { status: 401 });
  }
  if (!dbUrl()) {
    return NextResponse.json({ error: "sin base de datos" }, { status: 503 });
  }
  const url = new URL(request.url);
  const csv = url.searchParams.get("csv") === "1";
  const sql = db();
  const rows = (await sql`
    SELECT id, slug, title, excerpt, tag, status, scheduled_at, published_at,
           created_at, updated_at, cover_image
    FROM news
    ORDER BY created_at DESC
    LIMIT 200
  `) as unknown as Array<Record<string, unknown>>;

  if (csv) {
    const header = ["id","slug","titulo","tag","estado","programada","publicada","creada"];
    const lines = rows.map((r) =>
      [r.id, r.slug, r.title, r.tag, r.status, r.scheduled_at, r.published_at, r.created_at]
        .map((v) => `"${String(v ?? "").replace(/"/g, '""')}"`)
        .join(",")
    );
    return new NextResponse([header.join(","), ...lines].join("\n"), {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": 'attachment; filename="noticias.csv"',
      },
    });
  }

  return NextResponse.json({ news: rows });
}

export async function POST(request: Request) {
  const auth = requireRole(request, ["admin", "editor"]);
  if (!auth) {
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

  const title = String(body?.title ?? "").trim();
  if (!title) {
    return NextResponse.json({ error: "title requerido" }, { status: 400 });
  }
  const slug =
    String(body?.slug ?? "")
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") ||
    title
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "").slice(0, 80);

  const status = body?.status === "published" ? "published" : "draft";
  const scheduledAt = body?.scheduled_at ? String(body.scheduled_at) : null;

  const sql = db();
  const rows = (await sql`
    INSERT INTO news (slug, title, excerpt, content, tag, cover_image, status, scheduled_at, published_at, author_id)
    VALUES (
      ${slug}, ${title},
      ${body?.excerpt ? String(body.excerpt).slice(0, 300) : null},
      ${String(body?.content ?? "")},
      ${body?.tag ? String(body.tag).trim() : null},
      ${body?.cover_image ? String(body.cover_image) : null},
      ${status},
      ${scheduledAt ? scheduledAt + "Z" : null}::timestamptz,
      CASE WHEN ${status} = 'published'
        THEN COALESCE(${scheduledAt ? scheduledAt + "Z" : null}::timestamptz, now())
        ELSE NULL
      END,
      ${auth.uid}
    )
    RETURNING id, slug, title, status, scheduled_at, published_at
  `) as unknown as Array<Record<string, unknown>>;

  return NextResponse.json({ news: rows[0] }, { status: 201 });
}
