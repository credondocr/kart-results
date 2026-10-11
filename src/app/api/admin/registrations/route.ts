import { NextResponse } from "next/server";
import { db, dbUrl } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { sendRegistrationStatus } from "@/lib/email";

export async function GET(request: Request) {
  if (!requireRole(request, ["admin"])) {
    return NextResponse.json({ error: "no autorizado" }, { status: 401 });
  }
  if (!dbUrl()) {
    return NextResponse.json({ error: "sin base de datos" }, { status: 503 });
  }
  const url = new URL(request.url);
  const csv = url.searchParams.get("csv") === "1";
  const sql = db();
  const rows = (await sql`
    SELECT r.id, r.status, r.categories, r.payment_method, r.amount_total,
           r.ticket_url, r.transponder, r.rejection_note, r.license_accr,
           r.created_at, r.team_slug,
           rd.name AS race_name, rd.race_date, rd.id AS race_date_id,
           u.name AS user_name, u.email AS user_email
    FROM registrations r
    JOIN race_dates rd ON rd.id = r.race_date_id
    JOIN users u ON u.id = r.user_id
    ORDER BY rd.race_date DESC, r.created_at DESC
    LIMIT 500
  `) as unknown as Array<Record<string, unknown>>;

  if (csv) {
    const header = [
      "id","fecha","piloto","email","licencia","equipo","transponder",
      "categorias","metodo_pago","monto","estado","ticket","nota","creada",
    ];
    const lines = rows.map((r) =>
      [
        r.id,
        r.race_name,
        r.user_name,
        r.user_email,
        r.license_accr ?? "",
        r.team_slug ?? "",
        r.transponder ?? "",
        Array.isArray(r.categories) ? r.categories.join(" / ") : "",
        r.payment_method,
        r.amount_total ?? "",
        r.status,
        r.ticket_url ?? "",
        r.rejection_note ?? "",
        r.created_at,
      ]
        .map((v) => `"${String(v ?? "").replace(/"/g, '""')}"`)
        .join(",")
    );
    const body = [header.join(","), ...lines].join("\n");
    return new NextResponse(body, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": 'attachment; filename="inscripciones.csv"',
      },
    });
  }

  return NextResponse.json({ registrations: rows });
}

interface Body {
  id?: number;
  action?: string;
  note?: string;
}

/** POST: acciones del admin (verify | approve | reject). */
export async function POST(request: Request) {
  const auth = requireRole(request, ["admin"]);
  if (!auth) {
    return NextResponse.json({ error: "no autorizado" }, { status: 401 });
  }
  if (!dbUrl()) {
    return NextResponse.json({ error: "sin base de datos" }, { status: 503 });
  }
  let body: Body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "body inválido" }, { status: 400 });
  }
  const id = Number(body.id);
  const action = String(body.action ?? "");
  if (!Number.isInteger(id) || !["verify", "approve", "reject"].includes(action)) {
    return NextResponse.json({ error: "id o action inválido" }, { status: 400 });
  }

  const sql = db();
  const current = (await sql`
    SELECT r.id, r.status, u.email, u.name, rd.name AS race_name
    FROM registrations r
    JOIN users u ON u.id = r.user_id
    JOIN race_dates rd ON rd.id = r.race_date_id
    WHERE r.id = ${id}
  `) as unknown as Array<{
    id: number;
    status: string;
    email: string;
    name: string;
    race_name: string;
  }>;
  const reg = current[0];
  if (!reg) {
    return NextResponse.json({ error: "no encontrada" }, { status: 404 });
  }

  let nextStatus: string;
  if (action === "verify") {
    if (reg.status !== "pending") {
      return NextResponse.json({ error: "solo se verifica una inscripción pendiente" }, { status: 409 });
    }
    nextStatus = "verified";
    await sql`
      UPDATE registrations SET status = 'verified', verified_by = ${auth.uid},
        verified_at = now(), updated_at = now()
      WHERE id = ${id}
    `;
  } else if (action === "approve") {
    if (reg.status === "approved" || reg.status === "rejected") {
      return NextResponse.json({ error: `ya está ${reg.status}` }, { status: 409 });
    }
    nextStatus = "approved";
    await sql`
      UPDATE registrations SET status = 'approved', approved_by = ${auth.uid},
        approved_at = now(), updated_at = now()
      WHERE id = ${id}
    `;
  } else {
    const note = body.note?.trim() || null;
    if (!note) {
      return NextResponse.json({ error: "rechazo requiere nota" }, { status: 400 });
    }
    nextStatus = "rejected";
    await sql`
      UPDATE registrations SET status = 'rejected', rejection_note = ${note},
        updated_at = now()
      WHERE id = ${id}
    `;
  }

  void sendRegistrationStatus({
    to: reg.email,
    name: reg.name,
    eventName: reg.race_name,
    status: nextStatus as "verified" | "approved" | "rejected",
    note: body.note ?? null,
  });

  const updated = (await sql`
    SELECT id, status, rejection_note, verified_at, approved_at
    FROM registrations WHERE id = ${id}
  `) as unknown as Array<Record<string, unknown>>;
  return NextResponse.json({ registration: updated[0] });
}
