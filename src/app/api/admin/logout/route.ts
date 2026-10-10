import { NextResponse } from "next/server";
import { clearSessionCookie } from "@/lib/adminAuth";

export async function POST() {
  return NextResponse.json(
    { ok: true },
    { headers: { "Set-Cookie": clearSessionCookie() } }
  );
}
