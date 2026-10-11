import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/adminPageAuth";
import TeamsAdmin from "./TeamsAdmin";

export const metadata: Metadata = {
  title: "Admin Equipos | Kart Results",
  robots: { index: false, follow: false },
};

export default async function AdminTeamsPage() {
  if (!(await isAdminAuthenticated())) {
    redirect("/login");
  }
  return <TeamsAdmin />;
}
