import { NextResponse } from "next/server";
import { db, dbUrl } from "@/lib/db";
import { getAuth } from "@/lib/auth";
import { lookupRegistry } from "@/app/utils/pilotRegistry";

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

/** Si users.team_slug es null, cae al equipo del registro maestro (pilot_key). */
function withRegistryTeam(row: ProfileRow): ProfileRow {
  if (row.team_slug || !row.pilot_key) return row;
  const entry = lookupRegistry(row.pilot_key.replace(/-/g, " "));
  if (entry?.team) {
    return { ...row, team_slug: entry.team };
  }
  return row;
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

  const children = (await sql`
    SELECT id, email, name, role, license_accr, team_slug, pilot_key, bio, parent_id
    FROM users WHERE parent_id = ${auth.uid}
    ORDER BY name
  `) as unknown as ProfileRow[];

  return NextResponse.json({
    user: self[0] ? withRegistryTeam(self[0]) : null,
    children: children.map(withRegistryTeam),
  });
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

  // Si el usuario tiene pilot_key, sincronizar el equipo en el registro
  // maestro (tabla pilots) para que el piloto quede "activo" en ese equipo.
  const user = updated[0];
  if (user?.pilot_key) {
    const year = String(new Date().getFullYear());
    const teamVal = team ?? "";
    try {
      await sql`
        UPDATE pilots SET
          team = ${team ?? null},
          teams = COALESCE(teams, '{}'::jsonb) || jsonb_build_object(${year}::text, ${teamVal}::text),
          updated_at = now()
        WHERE key = ${user.pilot_key}
      `;
    } catch (err) {
      console.error("[profile] sync pilots team failed", err);
    }
  }

  return NextResponse.json({ user: withRegistryTeam(updated[0]) });
}
