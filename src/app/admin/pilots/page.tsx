import type { Metadata } from "next";
import PilotsAdmin from "./PilotsAdmin";

export const metadata: Metadata = {
  title: "Admin Pilotos | Kart Results",
  robots: { index: false, follow: false },
};

export default function Page() {
  return <PilotsAdmin />;
}
