import { NextResponse } from "next/server";
import { db, dbUrl } from "@/lib/db";
import { hashPassword, hashToken } from "@/lib/auth";

export async function POST(request: Request) {
  let body: { token?: string; password?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "body inválido" }, { status: 400 });
  }
  const token = String(body.token ?? "");
  const password = String(body.password ?? "");
  if (!token || password.length < 8) {
    return NextResponse.json(
      { error: "token y contraseña (mín.8) requeridos" },
      { status: 400 }
    );
  }
  if (!dbUrl()) {
    return NextResponse.json({ error: "sin base de datos" }, { status: 503 });
  }

  const sql = db();
  const rows = (await sql`
    SELECT id, user_id, expires_at, used_at
    FROM password_resets WHERE token_hash = ${hashToken(token)}
  `) as unknown as Array<{
    id: number;
    user_id: number;
    expires_at: string;
    used_at: string | null;
  }>;
  const reset = rows[0];
  if (!reset || reset.used_at) {
    return NextResponse.json({ error: "link inválido o ya usado" }, { status: 400 });
  }
  if (new Date(reset.expires_at).getTime() < Date.now()) {
    return NextResponse.json({ error: "link expirado; pide uno nuevo" }, { status: 400 });
  }

  const hash = await hashPassword(password);
  await sql`UPDATE users SET password_hash = ${hash} WHERE id = ${reset.user_id}`;
  await sql`UPDATE password_resets SET used_at = now() WHERE id = ${reset.id}`;

  return NextResponse.json({ ok: true });
}
