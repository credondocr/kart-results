import { NextResponse } from "next/server";
import { db, dbUrl } from "@/lib/db";
import { requireRole } from "@/lib/auth";

export async function GET(request: Request) {
  if (!requireRole(request, ["admin"])) {
    return NextResponse.json({ error: "no autorizado" }, { status: 401 });
  }
  if (!dbUrl()) {
    return NextResponse.json({ error: "sin base de datos" }, { status: 503 });
  }
  const sql = db();

  const stats = (await sql`
    SELECT
      count(*) FILTER (WHERE status = 'pending')::int AS pending,
      count(*) FILTER (WHERE status = 'verified')::int AS verified,
      count(*) FILTER (WHERE status = 'approved')::int AS approved,
      count(*) FILTER (WHERE status = 'rejected')::int AS rejected,
      count(*) FILTER (WHERE payment_method = 'track' AND status IN ('pending','verified'))::int AS track_pending,
      count(*)::int AS total
    FROM registrations
  `) as unknown as Array<{
    pending: number;
    verified: number;
    approved: number;
    rejected: number;
    track_pending: number;
    total: number;
  }>;

  const dates = (await sql`
    SELECT id, name, race_date, status, location
    FROM race_dates
    WHERE race_date > now() - interval '1 day' AND status != 'done'
    ORDER BY race_date
    LIMIT 3
  `) as unknown as Array<Record<string, unknown>>;

  const cats = (await sql`
    SELECT count(*)::int AS n FROM categories WHERE active = true
  `) as unknown as Array<{ n: number }>;
  const users = (await sql`SELECT count(*)::int AS n FROM users`) as unknown as Array<{ n: number }>;
  const invites = (await sql`
    SELECT count(*)::int AS n FROM invitations
    WHERE accepted_at IS NULL AND expires_at > now()
  `) as unknown as Array<{ n: number }>;
  const recent = (await sql`
    SELECT r.id, r.status, r.payment_method, r.created_at, r.categories,
           u.name AS user_name, rd.name AS race_name
    FROM registrations r
    JOIN users u ON u.id = r.user_id
    JOIN race_dates rd ON rd.id = r.race_date_id
    ORDER BY r.created_at DESC
    LIMIT 6
  `) as unknown as Array<Record<string, unknown>>;

  return NextResponse.json({
    stats: stats[0] ?? {
      pending: 0, verified: 0, approved: 0, rejected: 0, track_pending: 0, total: 0,
    },
    nextDates: dates,
    activeCategories: cats[0]?.n ?? 0,
    userCount: users[0]?.n ?? 0,
    pendingInvites: invites[0]?.n ?? 0,
    recentRegistrations: recent,
  });
}
