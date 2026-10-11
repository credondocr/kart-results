import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { db, dbUrl } from "@/lib/db";
import { hashToken } from "@/lib/auth";
import ResetForm from "./ResetForm";

export const metadata: Metadata = {
  title: "Restablecer contraseña | Costa Rica Kart Championship",
  robots: { index: false, follow: false },
};

interface PageProps {
  params: Promise<{ token: string }>;
}

export default async function RestablecerPage({ params }: PageProps) {
  const { token } = await params;
  if (!token || token.length < 16) notFound();
  if (!dbUrl()) notFound();

  const sql = db();
  const rows = (await sql`
    SELECT id, expires_at, used_at
    FROM password_resets WHERE token_hash = ${hashToken(token)}
  `) as unknown as Array<{ id: number; expires_at: string; used_at: string | null }>;
  const reset = rows[0];
  if (!reset || reset.used_at) notFound();
  const expired = new Date(reset.expires_at).getTime() < Date.now();

  return <ResetForm token={token} expired={expired} />;
}
