import { NextResponse } from "next/server";
import { db, dbUrl } from "@/lib/db";
import { isAuthenticated } from "@/lib/adminAuth";
import { deletePreRegistroSheetRow } from "@/app/api/latinoamericano/lib/sheets";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Row = {
  id: number;
  nombre: string;
  nacionalidad: string;
  categoria: string;
  equipo: string;
  carpa: boolean;
  correo: string;
  sheet_synced: boolean;
  created_at: string;
};

export async function GET(request: Request) {
  if (!isAuthenticated(request)) {
    return NextResponse.json({ error: "no autorizado" }, { status: 401 });
  }
  if (!dbUrl()) {
    return NextResponse.json({ error: "sin base de datos" }, { status: 503 });
  }
  const sql = db();
  const rows = (await sql`
    SELECT id, nombre, nacionalidad, categoria, equipo, carpa, correo,
           sheet_synced, created_at
    FROM latinoamericano_registrations
    ORDER BY created_at ASC, id ASC
  `) as unknown as Row[];

  const total = rows.length;
  const paises = new Set(rows.map((r) => r.nacionalidad).filter(Boolean)).size;
  const porCategoria = new Map<string, number>();
  for (const r of rows) {
    const k = r.categoria.trim() || "—";
    porCategoria.set(k, (porCategoria.get(k) ?? 0) + 1);
  }

  return NextResponse.json({
    rows,
    stats: {
      total,
      paises,
      porCategoria: [...porCategoria.entries()]
        .sort((a, b) => b[1] - a[1])
        .map(([categoria, count]) => ({ categoria, count })),
      sheetSynced: rows.filter((r) => r.sheet_synced).length,
    },
  });
}

/** Borrado masivo: body { ids: number[] }. Borra de Neon y best-effort del Sheet. */
export async function DELETE(request: Request) {
  if (!isAuthenticated(request)) {
    return NextResponse.json({ error: "no autorizado" }, { status: 401 });
  }
  if (!dbUrl()) {
    return NextResponse.json({ error: "sin base de datos" }, { status: 503 });
  }
  const body = (await request.json().catch(() => null)) as { ids?: unknown } | null;
  const ids = Array.isArray(body?.ids)
    ? body!.ids.map(Number).filter((n) => Number.isInteger(n) && n > 0)
    : [];
  if (!ids.length) {
    return NextResponse.json({ error: "ids vacíos" }, { status: 400 });
  }

  const sql = db();
  const deleted: Array<{
    nombre: string;
    nacionalidad: string;
    categoria: string;
    equipo: string;
  }> = [];
  for (const id of ids) {
    const rows = (await sql`
      DELETE FROM latinoamericano_registrations
      WHERE id = ${id}
      RETURNING nombre, nacionalidad, categoria, equipo
    `) as unknown as typeof deleted;
    deleted.push(...rows);
  }

  // Espejo en Google Sheets (best-effort, secuencial para no pisar índices)
  void (async () => {
    for (const row of deleted) {
      try {
        await deletePreRegistroSheetRow(row);
      } catch (err) {
        console.error("[admin/latinoamericano] sheet bulk delete failed:", err);
      }
    }
  })();

  return NextResponse.json({ ok: true, deleted: deleted.length });
}
