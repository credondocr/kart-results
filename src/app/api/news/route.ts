import { NextResponse } from "next/server";
import { db, dbUrl } from "@/lib/db";

/** Listado público de noticias publicadas (para landing y /noticias). */
export async function GET(request: Request) {
  if (!dbUrl()) {
    return NextResponse.json({ news: [] });
  }
  const url = new URL(request.url);
  const limit = Math.min(Number(url.searchParams.get("limit") ?? 10) || 10, 50);
  const sql = db();
  const rows = (await sql`
    SELECT id, slug, title, excerpt, tag, cover_image, published_at
    FROM news
    WHERE status = 'published'
      AND (published_at IS NULL OR published_at <= now())
    ORDER BY published_at DESC NULLS LAST
    LIMIT ${limit}
  `) as unknown as Array<Record<string, unknown>>;
  return NextResponse.json({ news: rows });
}
