import { NextResponse } from "next/server";
import {
  checkPassword,
  createSessionToken,
  sessionCookie,
} from "@/lib/adminAuth";

export async function POST(request: Request) {
  let password = "";
  try {
    const body = await request.json();
    password = String(body?.password ?? "");
  } catch {
    return NextResponse.json({ error: "body inválido" }, { status: 400 });
  }
  if (!password || !checkPassword(password)) {
    return NextResponse.json({ error: "contraseña incorrecta" }, { status: 401 });
  }
  const token = createSessionToken();
  return NextResponse.json(
    { ok: true },
    { headers: { "Set-Cookie": sessionCookie(token) } }
  );
}
