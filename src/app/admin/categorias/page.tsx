import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/adminPageAuth";
import CategoriasAdmin from "./CategoriasAdmin";

export const metadata: Metadata = {
  title: "Admin Categorías | Kart Results",
  robots: { index: false, follow: false },
};

export default async function AdminCategoriasPage() {
  if (!(await isAdminAuthenticated())) {
    redirect("/login");
  }
  return <CategoriasAdmin />;
}
