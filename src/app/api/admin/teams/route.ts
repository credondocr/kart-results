import { NextResponse } from "next/server";
import { db, dbUrl } from "@/lib/db";
import { isAuthenticated } from "@/lib/adminAuth";
import { slugifyTeam, toPngLogo, type TeamAdminRow } from "@/lib/teamAdmin";

export async function GET(request: Request) {
  if (!isAuthenticated(request)) {
    return NextResponse.json({ error: "no autorizado" }, { status: 401 });
  }
  if (!dbUrl()) {
    return NextResponse.json({ error: "sin base de datos" }, { status: 503 });
  }
  const sql = db();
  const rows = (await sql`
    SELECT t.slug, t.name, t.visible, (t.logo_png IS NOT NULL) AS has_logo,
           t.updated_at,
           (SELECT count(*)::int FROM pilots p WHERE p.team = t.slug) AS pilot_count
    FROM teams t
    ORDER BY t.visible DESC, t.name
  `) as unknown as TeamAdminRow[];
  return NextResponse.json({ teams: rows });
}

export async function POST(request: Request) {
  if (!isAuthenticated(request)) {
    return NextResponse.json({ error: "no autorizado" }, { status: 401 });
  }
  if (!dbUrl()) {
    return NextResponse.json({ error: "sin base de datos" }, { status: 503 });
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ error: "form-data inválido" }, { status: 400 });
  }
  const name = String(form.get("name") ?? "").trim();
  if (!name) {
    return NextResponse.json({ error: "name requerido" }, { status: 400 });
  }
  const slug = slugifyTeam(String(form.get("slug") ?? "") || name);
  if (!slug) {
    return NextResponse.json({ error: "slug inválido" }, { status: 400 });
  }
  const visible = String(form.get("visible") ?? "true") !== "false";
  const logo = form.get("logo");
  let logoPng: Buffer | null = null;
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

  const sql = db();
  const rows = (await sql`
    INSERT INTO teams (slug, name, visible, logo_png)
    VALUES (
      ${slug},
      ${name},
      ${visible},
      ${logoPng}
    )
    ON CONFLICT (slug) DO UPDATE SET
      name = EXCLUDED.name,
      visible = EXCLUDED.visible,
      logo_png = COALESCE(EXCLUDED.logo_png, teams.logo_png),
      updated_at = now()
    RETURNING slug, name, visible, (logo_png IS NOT NULL) AS has_logo, updated_at
  `) as unknown as TeamAdminRow[];
  return NextResponse.json({ team: rows[0] }, { status: 201 });
}
