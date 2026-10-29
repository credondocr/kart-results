import { NextResponse } from "next/server";
import { db, dbUrl } from "@/lib/db";
import { isAuthenticated } from "@/lib/adminAuth";
import { deletePreRegistroSheetRow } from "@/app/api/latinoamericano/lib/sheets";

export const runtime = "nodejs";

type Params = { params: Promise<{ id: string }> };

export async function DELETE(request: Request, { params }: Params) {
  if (!isAuthenticated(request)) {
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
    DELETE FROM latinoamericano_registrations
    WHERE id = ${idNum}
    RETURNING nombre, nacionalidad, categoria, equipo
  `) as unknown as Array<{
    nombre: string;
    nacionalidad: string;
    categoria: string;
    equipo: string;
  }>;

  if (!deleted.length) {
    return NextResponse.json({ error: "no encontrado" }, { status: 404 });
  }

  // Espejo en Google Sheets (best-effort): borra la fila que coincida exacta.
  void deletePreRegistroSheetRow(deleted[0]).catch((err) =>
    console.error("[admin/latinoamericano] sheet delete failed:", err)
  );

  return NextResponse.json({ ok: true });
}
