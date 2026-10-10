import { NextResponse } from "next/server";
import { db, dbUrl } from "@/lib/db";
import { isAuthenticated } from "@/lib/adminAuth";

const HISTORY_YEARS = ["2019", "2020", "2021", "2022", "2023"];

interface PenaltyRow {
  id: number;
  year: string;
  season: string;
  fecha: number;
  cls: string;
  driver: string;
  delta: number;
  note: string | null;
  created_at?: string;
}

export async function GET(request: Request) {
  if (!isAuthenticated(request)) {
    return NextResponse.json({ error: "no autorizado" }, { status: 401 });
  }
  if (!dbUrl()) {
    return NextResponse.json({ error: "sin base de datos" }, { status: 503 });
  }
  const url = new URL(request.url);
  const year = url.searchParams.get("year");
  const sql = db();
  const rows = year
    ? ((await sql`
        SELECT * FROM penalties WHERE year = ${year} ORDER BY season, fecha, cls, driver
      `) as unknown as PenaltyRow[])
    : ((await sql`
        SELECT * FROM penalties ORDER BY year DESC, season, fecha, cls, driver
      `) as unknown as PenaltyRow[]);
  return NextResponse.json({ penalties: rows });
}

export async function POST(request: Request) {
  if (!isAuthenticated(request)) {
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

  const year = String(body?.year ?? "");
  const season = String(body?.season ?? "");
  const fecha = Number(body?.fecha);
  const cls = String(body?.cls ?? "").trim();
  const driver = String(body?.driver ?? "").trim();
  const delta = Number(body?.delta);
  const note = body?.note ? String(body.note) : null;

  if (!HISTORY_YEARS.includes(year)) {
    return NextResponse.json(
      { error: `year debe ser uno de ${HISTORY_YEARS.join(", ")}` },
      { status: 400 }
    );
  }
  if (season !== "invierno" && season !== "verano") {
    return NextResponse.json({ error: "season inválida" }, { status: 400 });
  }
  if (!Number.isInteger(fecha) || fecha < 1 || fecha > 20) {
    return NextResponse.json({ error: "fecha inválida" }, { status: 400 });
  }
  if (!cls || !driver || !Number.isFinite(delta) || delta === 0) {
    return NextResponse.json({ error: "cls, driver y delta≠0 requeridos" }, { status: 400 });
  }

  const sql = db();
  const rows = (await sql`
    INSERT INTO penalties (year, season, fecha, cls, driver, delta, note)
    VALUES (${year}, ${season}, ${fecha}, ${cls}, ${driver}, ${delta}, ${note})
    RETURNING *
  `) as unknown as PenaltyRow[];
  return NextResponse.json({ penalty: rows[0] }, { status: 201 });
}
