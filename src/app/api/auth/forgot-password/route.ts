import { NextResponse } from "next/server";
import { db, dbUrl } from "@/lib/db";
import { generateInviteToken, hashToken } from "@/lib/auth";
import { sendSafeResetEmail } from "@/lib/email";

const TTL_MIN = 60;

export async function POST(request: Request) {
  let body: { email?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "body inválido" }, { status: 400 });
  }
  const email = String(body.email ?? "").trim().toLowerCase();
  if (!email || !email.includes("@")) {
    return NextResponse.json({ error: "email inválido" }, { status: 400 });
  }
  if (!dbUrl()) {
    return NextResponse.json({ error: "sin base de datos" }, { status: 503 });
  }

  const sql = db();
  const users = (await sql`
    SELECT id, email, name FROM users WHERE email = ${email}
  `) as unknown as Array<{ id: number; email: string; name: string }>;
  const user = users[0];

  // Siempre respondemos ok para no revelar si el email existe.
  if (!user) {
    return NextResponse.json({ ok: true });
  }

  const token = generateInviteToken();
  const expires = new Date(Date.now() + TTL_MIN * 60_000).toISOString();
  await sql`
    INSERT INTO password_resets (user_id, token_hash, expires_at)
    VALUES (${user.id}, ${hashToken(token)}, ${expires}::timestamptz)
  `;

  const origin = new URL(request.url).origin;
  const resetUrl = `${origin}/restablecer/${token}`;
  void sendSafeResetEmail(user.email, user.name, resetUrl);

  return NextResponse.json({ ok: true });
}
