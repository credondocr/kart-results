import type { Metadata } from "next";
import LatinoamericanoAdmin from "./LatinoamericanoAdmin";

export const metadata: Metadata = {
  title: "Admin Latinoamericano | Kart Results",
  robots: { index: false, follow: false },
};

export default function Page() {
  return <LatinoamericanoAdmin />;
}
