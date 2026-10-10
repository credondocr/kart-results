import { NextResponse } from "next/server";
import { db, dbUrl } from "@/lib/db";
import { isAuthenticated } from "@/lib/adminAuth";
import { toPngLogo, type TeamAdminRow } from "@/lib/teamAdmin";

type Params = { params: Promise<{ slug: string }> };

export async function PUT(request: Request, { params }: Params) {
  if (!isAuthenticated(request)) {
    return NextResponse.json({ error: "no autorizado" }, { status: 401 });
  }
  if (!dbUrl()) {
    return NextResponse.json({ error: "sin base de datos" }, { status: 503 });
  }
  const { slug } = await params;

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ error: "form-data inválido" }, { status: 400 });
  }

  const sql = db();
  const current = (await sql`
    SELECT slug, name, visible, (logo_png IS NOT NULL) AS has_logo
    FROM teams WHERE slug = ${slug}
  `) as unknown as TeamAdminRow[];
  const row = current[0];
  if (!row) {
    return NextResponse.json({ error: "no encontrado" }, { status: 404 });
  }

  const name = String(form.get("name") ?? "").trim() || row.name;
  const visibleRaw = form.get("visible");
  const visible =
    visibleRaw === null ? row.visible : String(visibleRaw) !== "false";

  let logoPng: Buffer | null = null;
  const logo = form.get("logo");
  if (logo instanceof File && logo.size > 0) {
    if (logo.size > 1_500_000) {
      return NextResponse.json({ error: "logo máximo 1.5MB" }, { status: 400 });
    }
    try {
      logoPng = await toPngLogo(logo);
    } catch {
      return NextResponse.json({ error: "no se pudo procesar la imagen" }, { status: 400 });
    }
  }

  const updated = (await sql`
    UPDATE teams SET
      name = ${name},
      visible = ${visible},
      logo_png = COALESCE(${logoPng}, logo_png),
      updated_at = now()
    WHERE slug = ${slug}
    RETURNING slug, name, visible, (logo_png IS NOT NULL) AS has_logo, updated_at
  `) as unknown as TeamAdminRow[];

  return NextResponse.json({ team: updated[0] });
}

export async function DELETE(request: Request, { params }: Params) {
  if (!isAuthenticated(request)) {
    return NextResponse.json({ error: "no autorizado" }, { status: 401 });
  }
  if (!dbUrl()) {
    return NextResponse.json({ error: "sin base de datos" }, { status: 503 });
  }
  const { slug } = await params;
  const sql = db();
  // Desasignar pilotos antes de borrar el equipo.
  await sql`UPDATE pilots SET team = NULL, updated_at = now() WHERE team = ${slug}`;
  const deleted = (await sql`
    DELETE FROM teams WHERE slug = ${slug} RETURNING slug
  `) as unknown as Array<{ slug: string }>;
  if (!deleted.length) {
    return NextResponse.json({ error: "no encontrado" }, { status: 404 });
  }
  return NextResponse.json({ ok: true, slug });
}
