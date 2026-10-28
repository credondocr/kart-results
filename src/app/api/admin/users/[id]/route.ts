import { NextResponse } from "next/server";
import { db, dbUrl } from "@/lib/db";
import { requireRole } from "@/lib/auth";

type Params = { params: Promise<{ id: string }> };

/**
 * Actualiza un usuario (solo campos de perfil/vínculo, no password/role).
 * pilot_key: string para vincular, null para desvincular.
 */
export async function PUT(request: Request, { params }: Params) {
  if (!requireRole(request, ["admin"])) {
    return NextResponse.json({ error: "no autorizado" }, { status: 401 });
  }
  if (!dbUrl()) {
    return NextResponse.json({ error: "sin base de datos" }, { status: 503 });
  }
  const { id } = await params;
  const idNum = Number(id);
  if (!Number.isInteger(idNum)) {
    return NextResponse.json({ error: "id inválido" }, { status: 400 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "body inválido" }, { status: 400 });
  }

  const sql = db();
  const current = (await sql`
    SELECT id, name, license_accr, team_slug, pilot_key, parent_id
    FROM users WHERE id = ${idNum}
  `) as unknown as Array<{
    id: number;
    name: string;
    license_accr: string | null;
    team_slug: string | null;
    pilot_key: string | null;
    parent_id: number | null;
  }>;
  const row = current[0];
  if (!row) {
    return NextResponse.json({ error: "no encontrado" }, { status: 404 });
  }

  const name =
    body?.name !== undefined
      ? String(body.name).trim() || row.name
      : row.name;
  const license =
    body?.license_accr !== undefined
      ? body.license_accr === null || body.license_accr === ""
        ? null
        : String(body.license_accr)
      : row.license_accr;
  const team =
    body?.team_slug !== undefined
      ? body.team_slug === null || body.team_slug === ""
        ? null
        : String(body.team_slug)
      : row.team_slug;
  const pilotKey =
    body?.pilot_key !== undefined
      ? body.pilot_key === null || body.pilot_key === ""
        ? null
        : String(body.pilot_key)
      : row.pilot_key;
  const parentId =
    body?.parent_id !== undefined
      ? body.parent_id == null || body.parent_id === ""
        ? null
        : Number(body.parent_id)
      : row.parent_id;

  if (license) {
    const dup = (await sql`
      SELECT id FROM users WHERE license_accr = ${license} AND id != ${idNum}
    `) as unknown as Array<{ id: number }>;
    if (dup.length) {
      return NextResponse.json(
        { error: "otro usuario ya usa esa licencia" },
        { status: 409 }
      );
    }
  }

  const updated = (await sql`
    UPDATE users SET
      name = ${name},
      license_accr = ${license},
      team_slug = ${team},
      pilot_key = ${pilotKey},
      parent_id = ${parentId}
    WHERE id = ${idNum}
    RETURNING id, email, role, name, license_accr, team_slug, pilot_key, parent_id
  `) as unknown as Array<Record<string, unknown>>;

  return NextResponse.json({ user: updated[0] });
}
