import { NextResponse } from "next/server";
import { db, dbUrl } from "@/lib/db";
import {
  createSessionToken,
  sessionCookie,
  verifyPassword,
} from "@/lib/auth";

interface UserRow {
  id: number;
  email: string;
  password_hash: string;
  role: "admin" | "piloto";
  name: string;
}

export async function POST(request: Request) {
  let body: { email?: string; password?: string; remember?: boolean };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "body inválido" }, { status: 400 });
  }
  const email = String(body.email ?? "").trim().toLowerCase();
  const password = String(body.password ?? "");
  const remember = Boolean(body.remember);
  if (!email || !password) {
    return NextResponse.json({ error: "email y contraseña requeridos" }, { status: 400 });
  }
  if (!dbUrl()) {
    return NextResponse.json({ error: "sin base de datos" }, { status: 503 });
  }

  const sql = db();
  const rows = (await sql`
    SELECT id, email, password_hash, role, name
    FROM users WHERE email = ${email}
  `) as unknown as UserRow[];
  const user = rows[0];
  if (!user || !(await verifyPassword(password, user.password_hash))) {
    return NextResponse.json({ error: "credenciales incorrectas" }, { status: 401 });
  }

  const token = createSessionToken(user.id, user.role, remember);
  return NextResponse.json(
    {
      ok: true,
      user: { id: user.id, email: user.email, role: user.role, name: user.name },
    },
    { headers: { "Set-Cookie": sessionCookie(token, remember) } }
  );
}
