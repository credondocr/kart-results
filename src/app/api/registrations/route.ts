import { NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { db, dbUrl } from "@/lib/db";
import { getAuth } from "@/lib/auth";
import { lookupRegistry } from "@/app/utils/pilotRegistry";
import { sendRegistrationReceived } from "@/lib/email";

export const runtime = "nodejs";

interface UserRow {
  id: number;
  email: string;
  name: string;
  role: string;
  license_accr: string | null;
  team_slug: string | null;
  pilot_key: string | null;
}

/** POST multipart: inscripción a la fecha abierta. */
export async function POST(request: Request) {
  const auth = getAuth(request);
  if (!auth || auth.role !== "piloto") {
    return NextResponse.json(
      { error: "inicia sesión como piloto para inscribirte" },
      { status: 401 }
    );
  }
  if (!dbUrl()) {
    return NextResponse.json({ error: "sin base de datos" }, { status: 503 });
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ error: "form inválido" }, { status: 400 });
  }

  const categories = form
    .getAll("categories")
    .map((c) => String(c).trim())
    .filter(Boolean);
  const paymentMethod = String(form.get("payment_method") ?? "");
  const transponder = String(form.get("transponder") ?? "").trim() || null;
  const ack = String(form.get("ack") ?? "") === "true";
  const ticket = form.get("ticket");

  if (!categories.length) {
    return NextResponse.json({ error: "elige al menos una categoría" }, { status: 400 });
  }
  if (paymentMethod !== "transfer" && paymentMethod !== "track") {
    return NextResponse.json({ error: "método de pago inválido" }, { status: 400 });
  }
  if (!ack) {
    return NextResponse.json(
      { error: "debes aceptar la exención de responsabilidad" },
      { status: 400 }
    );
  }

  const sql = db();
  const userRows = (await sql`
    SELECT id, email, name, role, license_accr, team_slug, pilot_key
    FROM users WHERE id = ${auth.uid}
  `) as unknown as UserRow[];
  const user = userRows[0];
  if (!user) {
    return NextResponse.json({ error: "usuario no encontrado" }, { status: 404 });
  }

  const dateRows = (await sql`
    SELECT id, name, race_date, status, price_base, categories
    FROM race_dates
    WHERE status = 'open' AND race_date > now() - interval '1 day'
    ORDER BY race_date
    LIMIT 1
  `) as unknown as Array<{
    id: number;
    name: string;
    price_base: number | null;
  }>;
  const raceDate = dateRows[0];
  if (!raceDate) {
    return NextResponse.json(
      { error: "no hay una fecha abierta para inscribirte" },
      { status: 409 }
    );
  }

  const existing = (await sql`
    SELECT id, status FROM registrations
    WHERE race_date_id = ${raceDate.id} AND user_id = ${user.id}
  `) as unknown as Array<{ id: number; status: string }>;
  if (existing.length) {
    return NextResponse.json(
      { error: `ya tienes una inscripción (${existing[0].status}) para esta fecha` },
      { status: 409 }
    );
  }

  // Subir ticket a Blob si viene archivo.
  let ticketUrl: string | null = null;
  if (ticket instanceof File && ticket.size > 0) {
    if (ticket.size > 2_500_000) {
      return NextResponse.json({ error: "el ticket máximo es2.5MB" }, { status: 400 });
    }
    try {
      const bytes = Buffer.from(await ticket.arrayBuffer());
      const ext = ticket.name.split(".").pop()?.toLowerCase() || "bin";
      const path = `tickets/${raceDate.id}/${user.id}-${Date.now()}.${ext}`;
      const blob = await put(path, bytes, {
        access: "private",
        contentType: ticket.type || "application/octet-stream",
      });
      // Guardamos el pathname; el admin lo sirve vía /api/admin/tickets/[...]
      ticketUrl = blob.pathname;
    } catch (err) {
      console.error("[blob] upload failed", err);
      return NextResponse.json(
        { error: "no se pudo subir el ticket; intenta de nuevo" },
        { status: 500 }
      );
    }
  }

  if (paymentMethod === "transfer" && !ticketUrl) {
    return NextResponse.json(
      { error: "sube el comprobante de transferencia" },
      { status: 400 }
    );
  }

  const priceBase = raceDate.price_base != null ? Number(raceDate.price_base) : null;
  const amountTotal = priceBase != null ? priceBase * categories.length : null;

  const registryEntry = user.pilot_key
    ? lookupRegistry(user.pilot_key.replace(/-/g, " "))
    : null;
  const teamSlug = user.team_slug ?? registryEntry?.team ?? null;
  const license = user.license_accr;

  const rows = (await sql`
    INSERT INTO registrations (
      race_date_id, user_id, license_accr, transponder,
      payment_method, ticket_url, amount_total, categories,
      team_slug, status, ack_responsibility
    )
    VALUES (
      ${raceDate.id}, ${user.id}, ${license}, ${transponder},
      ${paymentMethod}, ${ticketUrl}, ${amountTotal},
      ${JSON.stringify(categories)}::jsonb,
      ${teamSlug}, 'pending', true
    )
    RETURNING id, status, categories, payment_method, amount_total, ticket_url
  `) as unknown as Array<Record<string, unknown>>;
  const reg = rows[0];

  void sendRegistrationReceived({
    to: user.email,
    name: user.name,
    eventName: raceDate.name,
    categories,
    paymentMethod,
    amountTotal,
  });

  return NextResponse.json({ registration: reg }, { status: 201 });
}

/** GET: mi inscripción para la fecha abierta. */
export async function GET(request: Request) {
  const auth = getAuth(request);
  if (!auth) {
    return NextResponse.json({ registration: null });
  }
  if (!dbUrl()) {
    return NextResponse.json({ registration: null });
  }
  const sql = db();
  const rows = (await sql`
    SELECT r.id, r.status, r.categories, r.payment_method, r.amount_total,
           r.ticket_url, r.transponder, r.rejection_note, r.created_at,
           rd.id AS race_date_id, rd.name AS race_name, rd.race_date
    FROM registrations r
    JOIN race_dates rd ON rd.id = r.race_date_id
    WHERE r.user_id = ${auth.uid}
      AND rd.status = 'open'
      AND rd.race_date > now() - interval '1 day'
    ORDER BY rd.race_date DESC
    LIMIT 1
  `) as unknown as Array<Record<string, unknown>>;
  return NextResponse.json({ registration: rows[0] ?? null });
}
