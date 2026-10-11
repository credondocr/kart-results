import type { Metadata } from "next";
import TeamsAdmin from "./TeamsAdmin";

export const metadata: Metadata = {
  title: "Admin Equipos | Kart Results",
  robots: { index: false, follow: false },
};

export default function Page() {
  return <TeamsAdmin />;
}
