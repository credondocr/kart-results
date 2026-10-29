import { NextResponse } from "next/server";
import { db, dbUrl } from "@/lib/db";
import { getPreRegistrosPublicos } from "../lib/sheets";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Lista pública de pre-registros.
 * Fuente primaria: Neon (rápida). Fallback: Google Sheets si la DB no está disponible.
 */
export async function GET() {
  if (dbUrl()) {
    try {
      const sql = db();
      const rows = (await sql`
        SELECT nombre, nacionalidad, categoria, equipo
        FROM latinoamericano_registrations
        ORDER BY created_at ASC, id ASC
      `) as unknown as Array<{
        nombre: string;
        nacionalidad: string;
        categoria: string;
        equipo: string;
      }>;
      return NextResponse.json(
        { submissions: rows },
        { headers: { "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60" } }
      );
    } catch (error) {
      console.error("[latinoamericano/registrations] neon error:", error);
      // cae al sheets abajo
    }
  }

  try {
    const submissions = await getPreRegistrosPublicos();
    return NextResponse.json(
      { submissions },
      {
        headers: {
          "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60",
        },
      }
    );
  } catch (error) {
    console.error("[latinoamericano/registrations] sheets fallback:", error);
    return NextResponse.json(
      { message: "No se pudo cargar la lista de pre-registros." },
      { status: 500 }
    );
  }
}
