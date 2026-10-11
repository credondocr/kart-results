import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { verifySession } from "@/lib/auth";
import { db, dbUrl } from "@/lib/db";
import InscribirForm from "./InscribirForm";

export const metadata: Metadata = {
  title: "Inscribirme | Costa Rica Kart Championship",
  robots: { index: false, follow: false },
};

interface OpenDate {
  id: number;
  name: string;
  race_date: string;
  location: string | null;
  categories: string[];
  price_base: number | null;
}

async function getOpenDate(): Promise<OpenDate | null> {
  if (!dbUrl()) return null;
  const sql = db();
  const rows = (await sql`
    SELECT id, name, race_date, location, categories, price_base
    FROM race_dates
    WHERE status = 'open' AND race_date > now() - interval '1 day'
    ORDER BY race_date
    LIMIT 1
  `) as unknown as OpenDate[];
  return rows[0] ?? null;
}

export default async function InscribirPage() {
  const store = await cookies();
  const session = verifySession(store.get("kr_session")?.value);
  if (!session || session.role !== "piloto") {
    redirect("/login");
  }
  const openDate = await getOpenDate();
  const dateLabel = openDate
    ? new Date(openDate.race_date).toLocaleDateString("es-CR", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : null;

  return (
    <InscribirForm
      openDate={
        openDate
          ? {
              id: openDate.id,
              name: openDate.name,
              dateLabel: dateLabel ?? "",
              location: openDate.location,
              categories: openDate.categories,
              priceBase: openDate.price_base != null ? Number(openDate.price_base) : null,
            }
          : null
      }
    />
  );
}
