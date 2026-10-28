import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { verifySession } from "@/lib/auth";
import ProfileClient from "./ProfileClient";

export const metadata: Metadata = {
  title: "Mi perfil | Costa Rica Kart Championship",
  robots: { index: false, follow: false },
};

export default async function PerfilPage() {
  const store = await cookies();
  const session = verifySession(store.get("kr_session")?.value);
  if (!session) {
    redirect("/login");
  }
  return <ProfileClient />;
}
