import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/adminPageAuth";
import FechasAdmin from "./FechasAdmin";

export const metadata: Metadata = {
  title: "Admin Fechas | Kart Results",
  robots: { index: false, follow: false },
};

export default async function AdminFechasPage() {
  if (!(await isAdminAuthenticated())) {
    redirect("/login");
  }
  return <FechasAdmin />;
}
