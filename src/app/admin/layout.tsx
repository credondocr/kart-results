import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/adminPageAuth";
import AdminShell from "./AdminShell";

export const metadata: Metadata = {
  title: "Admin | Kart Results",
  robots: { index: false, follow: false },
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (!(await isAdminAuthenticated())) {
    redirect("/login");
  }
  return <AdminShell>{children}</AdminShell>;
}
