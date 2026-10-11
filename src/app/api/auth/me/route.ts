import { NextResponse } from "next/server";
import { db, dbUrl } from "@/lib/db";
import { getAuth } from "@/lib/auth";

export async function GET(request: Request) {
  const auth = getAuth(request);
  if (!auth) {
    return NextResponse.json({ user: null });
  }
  if (!dbUrl()) {
    return NextResponse.json({ user: { id: auth.uid, role: auth.role } });
  }
  const sql = db();
  const rows = (await sql`
    SELECT id, email, role, name, license_accr, team_slug
    FROM users WHERE id = ${auth.uid}
  `) as unknown as Array<Record<string, unknown>>;
  if (!rows.length) return NextResponse.json({ user: null });
  return NextResponse.json({ user: rows[0] });
}
