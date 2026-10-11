import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/adminPageAuth";
import InvitationsAdmin from "./InvitationsAdmin";

export const metadata: Metadata = {
  title: "Admin Invitaciones | Kart Results",
  robots: { index: false, follow: false },
};

export default async function AdminInvitationsPage() {
  if (!(await isAdminAuthenticated())) {
    redirect("/login");
  }
  return <InvitationsAdmin />;
}
