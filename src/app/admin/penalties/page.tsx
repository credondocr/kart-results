import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/adminPageAuth";
import PenaltiesAdmin from "./PenaltiesAdmin";

export const metadata: Metadata = {
  title: "Admin Penales | Kart Results",
  robots: { index: false, follow: false },
};

export default async function AdminPenaltiesPage() {
  if (!(await isAdminAuthenticated())) {
    redirect("/login");
  }
  return <PenaltiesAdmin />;
}
