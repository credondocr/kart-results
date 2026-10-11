import { NextResponse } from "next/server";
import { db, dbUrl } from "@/lib/db";
import { getAuth } from "@/lib/auth";

interface ProfileRow {
  id: number;
  email: string;
  name: string;
  role: string;
  license_accr: string | null;
  team_slug: string | null;
  pilot_key: string | null;
  bio: string | null;
  parent_id: number | null;
}

export async function GET(request: Request) {
  const auth = getAuth(request);
  if (!auth) {
    return NextResponse.json({ user: null, children: [] });
  }
  if (!dbUrl()) {
    return NextResponse.json({ error: "sin base de datos" }, { status: 503 });
  }
  const sql = db();

  const self = (await sql`
    SELECT id, email, name, role, license_accr, team_slug, pilot_key, bio, parent_id
    FROM users WHERE id = ${auth.uid}
  `) as unknown as ProfileRow[];

  // Hijos: usuarios cuyo parent_id es este usuario (solo si es piloto tutor).
  const children = (await sql`
    SELECT id, email, name, role, license_accr, team_slug, pilot_key, bio, parent_id
    FROM users WHERE parent_id = ${auth.uid}
    ORDER BY name
  `) as unknown as ProfileRow[];

  return NextResponse.json({ user: self[0] ?? null, children });
}

/** PUT: actualizar perfil (name, team_slug, bio, license_accr, pilot_key). */
export async function PUT(request: Request) {
  const auth = getAuth(request);
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

  // El id del perfil a editar viene en el body; solo puede ser self o un hijo.
  const targetId = Number(body?.id ?? auth.uid);
  if (!Number.isInteger(targetId)) {
    return NextResponse.json({ error: "id inválido" }, { status: 400 });
  }

  const sql = db();
  let target: ProfileRow | undefined;
  if (targetId === auth.uid) {
    target = ((await sql`
      SELECT id, email, name, role, license_accr, team_slug, pilot_key, bio, parent_id
      FROM users WHERE id = ${auth.uid}
    `) as unknown as ProfileRow[])[0];
  } else {
    // Solo el tutor puede editar a su hijo.
    target = ((await sql`
      SELECT id, email, name, role, license_accr, team_slug, pilot_key, bio, parent_id
      FROM users WHERE id = ${targetId} AND parent_id = ${auth.uid}
    `) as unknown as ProfileRow[])[0];
  }
  if (!target) {
    return NextResponse.json({ error: "no encontrado o sin permiso" }, { status: 404 });
  }

  const name = body?.name != null ? String(body.name).trim() || target.name : target.name;
  const team =
    body?.team_slug !== undefined
      ? body.team_slug
        ? String(body.team_slug)
        : null
      : target.team_slug;
  const bio =
    body?.bio !== undefined
      ? body.bio
        ? String(body.bio).slice(0, 1000)
        : null
      : target.bio;
  const license =
    body?.license_accr !== undefined
      ? body.license_accr
        ? String(body.license_accr).trim()
        : null
      : target.license_accr;

  const updated = (await sql`
    UPDATE users SET
      name = ${name},
      team_slug = ${team},
      bio = ${bio},
      license_accr = ${license}
    WHERE id = ${targetId}
    RETURNING id, email, name, role, license_accr, team_slug, pilot_key, bio, parent_id
  `) as unknown as ProfileRow[];

  return NextResponse.json({ user: updated[0] });
}
