import type { Metadata } from "next";
import UsersAdmin from "./UsersAdmin";

export const metadata: Metadata = {
  title: "Admin Usuarios | Kart Results",
  robots: { index: false, follow: false },
};

export default function Page() {
  return <UsersAdmin />;
}
