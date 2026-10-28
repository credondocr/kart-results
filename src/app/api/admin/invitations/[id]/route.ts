import { NextResponse } from "next/server";
import { db, dbUrl } from "@/lib/db";
import { requireRole } from "@/lib/auth";

type Params = { params: Promise<{ id: string }> };

/** Revoca (borra) una invitación pendiente. */
export async function DELETE(request: Request, { params }: Params) {
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
  const sql = db();
  const deleted = (await sql`
    DELETE FROM invitations
    WHERE id = ${idNum} AND accepted_at IS NULL
    RETURNING id
  `) as unknown as Array<{ id: number }>;
  if (!deleted.length) {
    return NextResponse.json(
      { error: "no encontrada o ya aceptada" },
      { status: 404 }
    );
  }
  return NextResponse.json({ ok: true });
}
