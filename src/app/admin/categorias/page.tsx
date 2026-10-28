import type { Metadata } from "next";
import CategoriasAdmin from "./CategoriasAdmin";

export const metadata: Metadata = {
  title: "Admin Categorías | Kart Results",
  robots: { index: false, follow: false },
};

export default function Page() {
  return <CategoriasAdmin />;
}
