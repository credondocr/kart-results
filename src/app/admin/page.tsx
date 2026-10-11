import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/adminPageAuth";
import AdminDashboard from "./AdminDashboard";

export const metadata: Metadata = {
  title: "Admin | Kart Results",
  robots: { index: false, follow: false },
};

export default async function AdminIndexPage() {
  if (!(await isAdminAuthenticated())) {
    redirect("/login");
  }
  return <AdminDashboard />;
}
