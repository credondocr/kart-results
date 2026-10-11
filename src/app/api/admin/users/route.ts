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
    SELECT id, email, role, name, license_accr, team_slug, pilot_key, parent_id, created_at
    FROM users
    ORDER BY role, name
    LIMIT 300
  `) as unknown as Array<Record<string, unknown>>;
  return NextResponse.json({ users: rows });
}
