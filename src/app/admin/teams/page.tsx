import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { verifySessionToken, ADMIN_COOKIE } from "@/lib/adminAuth";
import TeamsAdmin from "./TeamsAdmin";

export const metadata: Metadata = {
  title: "Admin Equipos | Kart Results",
  robots: { index: false, follow: false },
};

export default async function AdminTeamsPage() {
  const store = await cookies();
  const token = store.get(ADMIN_COOKIE)?.value;
  if (!verifySessionToken(token)) {
    redirect("/admin/login");
  }
  return <TeamsAdmin />;
}
