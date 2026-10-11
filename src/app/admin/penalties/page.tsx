import type { Metadata } from "next";
import PenaltiesAdmin from "./PenaltiesAdmin";

export const metadata: Metadata = {
  title: "Admin Penales | Kart Results",
  robots: { index: false, follow: false },
};

export default function Page() {
  return <PenaltiesAdmin />;
}
