import { NextResponse } from "next/server";
import { db, dbUrl } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import {
  generateInviteToken,
  hashToken,
  INVITE_TTL_DAYS,
} from "@/lib/auth";
import { sendInviteEmail } from "@/lib/email";

interface InviteListRow {
  id: number;
  email: string;
  role: string;
  name: string | null;
  license_accr: string | null;
  team_slug: string | null;
  pilot_key: string | null;
  expires_at: string;
  accepted_at: string | null;
  created_at: string;
}

export async function GET(request: Request) {
  if (!requireRole(request, ["admin"])) {
    return NextResponse.json({ error: "no autorizado" }, { status: 401 });
  }
  if (!dbUrl()) {
    return NextResponse.json({ error: "sin base de datos" }, { status: 503 });
  }
  const sql = db();
  const rows = (await sql`
    SELECT id, email, role, name, license_accr, team_slug, pilot_key,
           expires_at, accepted_at, created_at
    FROM invitations
    ORDER BY created_at DESC
    LIMIT 200
  `) as unknown as InviteListRow[];
  const now = Date.now();
  const invitations = rows.map((r) => ({
    ...r,
    status: r.accepted_at
      ? "accepted"
      : new Date(r.expires_at).getTime() < now
        ? "expired"
        : "pending",
  }));
  return NextResponse.json({ invitations });
}

function originFrom(request: Request): string {
  const env = process.env.NEXT_PUBLIC_SITE_URL;
  if (env) return env.replace(/\/$/, "");
  const url = new URL(request.url);
  return url.origin;
}

export async function POST(request: Request) {
  const auth = requireRole(request, ["admin"]);
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
  const email = String(body?.email ?? "").trim().toLowerCase();
  const role = String(body?.role ?? "");
  const name = body?.name ? String(body.name).trim() : null;
  const license = body?.license_accr ? String(body.license_accr).trim() : null;
  const team = body?.team_slug ? String(body.team_slug).trim() : null;
  const pilotKey = body?.pilot_key ? String(body.pilot_key).trim() : null;

  if (!email || !email.includes("@")) {
    return NextResponse.json({ error: "email inválido" }, { status: 400 });
  }
  if (role !== "piloto" && role !== "mecanico") {
    return NextResponse.json({ error: "role debe ser piloto o mecanico" }, { status: 400 });
  }

  const sql = db();
  const existing = (await sql`
    SELECT id FROM users WHERE email = ${email}
  `) as unknown as Array<{ id: number }>;
  if (existing.length) {
    return NextResponse.json(
      { error: "ya existe una cuenta con ese email" },
      { status: 409 }
    );
  }

  const token = generateInviteToken();
  const expires = new Date(Date.now() + INVITE_TTL_DAYS * 86400_000).toISOString();
  const rows = (await sql`
    INSERT INTO invitations (
      email, role, name, license_accr, team_slug, pilot_key,
      token_hash, expires_at, created_by
    )
    VALUES (
      ${email}, ${role}, ${name}, ${license}, ${team}, ${pilotKey},
      ${hashToken(token)}, ${expires}::timestamptz, ${auth.uid}
    )
    RETURNING id, email, role, name, expires_at, created_at
  `) as unknown as Array<Record<string, unknown>>;

  const inviteUrl = `${originFrom(request)}/invitacion/${token}`;
  const emailed = await sendInviteEmail({
    to: email,
    name,
    role,
    inviteUrl,
  });
  return NextResponse.json(
    { invitation: rows[0], inviteUrl, emailed },
    { status: 201 }
  );
}
