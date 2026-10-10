import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { verifySessionToken, ADMIN_COOKIE } from "@/lib/adminAuth";
import PilotsAdmin from "./PilotsAdmin";

export const metadata: Metadata = {
  title: "Admin Pilotos | Kart Results",
  robots: { index: false, follow: false },
};

export default async function AdminPilotsPage() {
  const store = await cookies();
  const token = store.get(ADMIN_COOKIE)?.value;
  if (!verifySessionToken(token)) {
    redirect("/admin/login");
  }
  return <PilotsAdmin />;
}
