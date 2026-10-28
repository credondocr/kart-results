import type { Metadata } from "next";
import FechasAdmin from "./FechasAdmin";

export const metadata: Metadata = {
  title: "Admin Fechas | Kart Results",
  robots: { index: false, follow: false },
};

export default function Page() {
  return <FechasAdmin />;
}
