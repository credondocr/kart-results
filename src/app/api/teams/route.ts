import { NextResponse } from "next/server";
import { db, dbUrl } from "@/lib/db";

/** Catálogo público de equipos (solo visibles). Para selects de pilotos. */
export async function GET() {
  if (!dbUrl()) {
    return NextResponse.json({ teams: [] });
  }
  const sql = db();
  const rows = (await sql`
    SELECT slug, name FROM teams WHERE visible = true
    ORDER BY name
  `) as unknown as Array<{ slug: string; name: string }>;
  return NextResponse.json({ teams: rows });
}
