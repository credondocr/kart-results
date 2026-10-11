import { NextResponse } from "next/server";
import { clearSessionCookie } from "@/lib/adminAuth";
import { clearSessionCookie as clearUnifiedCookie } from "@/lib/auth";

export async function POST() {
  const res = NextResponse.json({ ok: true });
  res.headers.append("Set-Cookie", clearSessionCookie());
  res.headers.append("Set-Cookie", clearUnifiedCookie());
  return res;
}
