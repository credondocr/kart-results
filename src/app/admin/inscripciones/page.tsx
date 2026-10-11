import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/adminPageAuth";
import InscripcionesAdmin from "./InscripcionesAdmin";

export const metadata: Metadata = {
  title: "Admin Inscripciones | Kart Results",
  robots: { index: false, follow: false },
};

export default async function AdminInscripcionesPage() {
  if (!(await isAdminAuthenticated())) {
    redirect("/login");
  }
  return <InscripcionesAdmin />;
}
