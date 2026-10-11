import { NextResponse } from "next/server";
import { db, dbUrl } from "@/lib/db";
import { getAuth, hashPassword, verifyPassword } from "@/lib/auth";

/** Cambia la contraseña de la cuenta propia. */
export async function POST(request: Request) {
  const auth = getAuth(request);
  if (!auth) {
    return NextResponse.json({ error: "no autorizado" }, { status: 401 });
  }
  if (!dbUrl()) {
    return NextResponse.json({ error: "sin base de datos" }, { status: 503 });
  }

  let body: { current?: string; next?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "body inválido" }, { status: 400 });
  }
  const current = String(body.current ?? "");
  const next = String(body.next ?? "");
  if (!current || next.length < 8) {
    return NextResponse.json(
      { error: "contraseña actual y nueva (mín.8) requeridas" },
      { status: 400 }
    );
  }

  const sql = db();
  const rows = (await sql`
    SELECT id, password_hash FROM users WHERE id = ${auth.uid}
  `) as unknown as Array<{ id: number; password_hash: string }>;
  const user = rows[0];
  if (!user || !(await verifyPassword(current, user.password_hash))) {
    return NextResponse.json(
      { error: "la contraseña actual es incorrecta" },
      { status: 400 }
    );
  }

  const hash = await hashPassword(next);
  await sql`
    UPDATE users SET password_hash = ${hash} WHERE id = ${auth.uid}
  `;
  return NextResponse.json({ ok: true });
}
