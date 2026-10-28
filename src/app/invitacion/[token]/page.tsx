import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { db, dbUrl } from "@/lib/db";
import { hashToken } from "@/lib/auth";
import AcceptInviteForm from "./AcceptInviteForm";

export const metadata: Metadata = {
  title: "Acepta tu invitación | Costa Rica Kart Championship",
  robots: { index: false, follow: false },
};

interface PageProps {
  params: Promise<{ token: string }>;
}

interface InviteRow {
  email: string;
  role: string;
  name: string | null;
  license_accr: string | null;
  expires_at: string;
  accepted_at: string | null;
}

export default async function InvitePage({ params }: PageProps) {
  const { token } = await params;
  if (!token || token.length < 16) notFound();
  if (!dbUrl()) notFound();

  const sql = db();
  const rows = (await sql`
    SELECT email, role, name, license_accr, expires_at, accepted_at
    FROM invitations WHERE token_hash = ${hashToken(token)}
  `) as unknown as InviteRow[];
  const invite = rows[0];
  if (!invite || invite.accepted_at) notFound();
  const expired = new Date(invite.expires_at).getTime() < Date.now();

  return (
    <AcceptInviteForm
      token={token}
      email={invite.email}
      role={invite.role}
      name={invite.name ?? ""}
      licenseAccr={invite.license_accr ?? ""}
      expired={expired}
    />
  );
}
