import type { Metadata } from "next";
import InscripcionesAdmin from "./InscripcionesAdmin";

export const metadata: Metadata = {
  title: "Admin Inscripciones | Kart Results",
  robots: { index: false, follow: false },
};

export default function Page() {
  return <InscripcionesAdmin />;
}
