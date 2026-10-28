import type { Metadata } from "next";
import InvitationsAdmin from "./InvitationsAdmin";

export const metadata: Metadata = {
  title: "Admin Invitaciones | Kart Results",
  robots: { index: false, follow: false },
};

export default function Page() {
  return <InvitationsAdmin />;
}
