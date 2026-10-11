import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/adminPageAuth";
import PilotsAdmin from "./PilotsAdmin";

export const metadata: Metadata = {
  title: "Admin Pilotos | Kart Results",
  robots: { index: false, follow: false },
};

export default async function AdminPilotsPage() {
  if (!(await isAdminAuthenticated())) {
    redirect("/login");
  }
  return <PilotsAdmin />;
}
