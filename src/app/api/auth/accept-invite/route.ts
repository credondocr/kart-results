import { NextResponse } from "next/server";
import { db, dbUrl } from "@/lib/db";
import {
  createSessionToken,
  hashPassword,
  hashToken,
  sessionCookie,
} from "@/lib/auth";

interface InviteRow {
  id: number;
  email: string;
  role: "piloto";
  name: string | null;
  license_accr: string | null;
  team_slug: string | null;
  pilot_key: string | null;
  expires_at: string;
  accepted_at: string | null;
}

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
      { error: "token y contraseña (mín. 8 caracteres) requeridos" },
      { status: 400 }
    );
  }
  if (!dbUrl()) {
    return NextResponse.json({ error: "sin base de datos" }, { status: 503 });
  }

  const sql = db();
  const rows = (await sql`
    SELECT id, email, role, name, license_accr, team_slug, pilot_key,
           expires_at, accepted_at
    FROM invitations WHERE token_hash = ${hashToken(token)}
  `) as unknown as InviteRow[];
  const invite = rows[0];
  if (!invite) {
    return NextResponse.json({ error: "invitación inválida" }, { status: 404 });
  }
  if (invite.accepted_at) {
    return NextResponse.json({ error: "invitación ya usada" }, { status: 410 });
  }
  if (new Date(invite.expires_at).getTime() < Date.now()) {
    return NextResponse.json({ error: "invitación expirada" }, { status: 410 });
  }

  // Unicidad de email y licencia.
  const emailTaken = (await sql`
    SELECT id FROM users WHERE email = ${invite.email.toLowerCase()}
  `) as unknown as Array<{ id: number }>;
  if (emailTaken.length) {
    return NextResponse.json(
      { error: "ya existe una cuenta con ese email; pide al admin una nueva invitación" },
      { status: 409 }
    );
  }
  if (invite.license_accr) {
    const licTaken = (await sql`
      SELECT id FROM users WHERE license_accr = ${invite.license_accr}
    `) as unknown as Array<{ id: number }>;
    if (licTaken.length) {
      return NextResponse.json(
        { error: "esa licencia ACCR ya está registrada" },
        { status: 409 }
      );
    }
  }

  const hash = await hashPassword(password);
  const created = (await sql`
    INSERT INTO users (email, password_hash, role, name, license_accr, team_slug, pilot_key)
    VALUES (
      ${invite.email.toLowerCase()},
      ${hash},
      ${invite.role},
      ${invite.name ?? invite.email},
      ${invite.license_accr},
      ${invite.team_slug},
      ${invite.pilot_key}
    )
    RETURNING id, email, role, name
  `) as unknown as Array<{ id: number; email: string; role: string; name: string }>;
  const user = created[0];

  await sql`
    UPDATE invitations SET
      accepted_at = now(),
      accepted_user_id = ${user.id}
    WHERE id = ${invite.id}
  `;

  const sessionToken = createSessionToken(user.id, user.role as "piloto");
  return NextResponse.json(
    { ok: true, user },
    { headers: { "Set-Cookie": sessionCookie(sessionToken) } }
  );
}
