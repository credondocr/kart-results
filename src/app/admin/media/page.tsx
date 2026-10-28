import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { verifySession } from "@/lib/auth";
import MediaAdmin from "./MediaAdmin";

export const metadata: Metadata = {
  title: "Admin Media | Kart Results",
  robots: { index: false, follow: false },
};

export default async function AdminMediaPage() {
  const store = await cookies();
  const session = verifySession(store.get("kr_session")?.value);
  if (!session || (session.role !== "admin" && session.role !== "editor")) {
    redirect("/login");
  }
  return <MediaAdmin />;
}
