import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/adminPageAuth";
import UsersAdmin from "./UsersAdmin";

export const metadata: Metadata = {
  title: "Admin Usuarios | Kart Results",
  robots: { index: false, follow: false },
};

export default async function AdminUsersPage() {
  if (!(await isAdminAuthenticated())) {
    redirect("/login");
  }
  return <UsersAdmin />;
}
