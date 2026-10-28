import { NextResponse } from "next/server";
import { get } from "@vercel/blob";
import { requireRole } from "@/lib/auth";

export const runtime = "nodejs";

type Params = { params: Promise<{ path: string[] }> };

/** Sirve un ticket (blob privado) solo a admins. path = pathname del blob. */
export async function GET(request: Request, { params }: Params) {
  if (!requireRole(request, ["admin"])) {
    return NextResponse.json({ error: "no autorizado" }, { status: 401 });
  }
  const { path } = await params;
  const pathname = path.join("/");
  if (!pathname.startsWith("tickets/")) {
    return NextResponse.json({ error: "path inválido" }, { status: 400 });
  }
  try {
    const result = await get(pathname, { access: "private" });
    if (!result || result.statusCode !== 200) {
      return NextResponse.json({ error: "ticket no encontrado" }, { status: 404 });
    }
    return new Response(result.stream, {
      headers: {
        "Content-Type": result.blob.contentType || "application/octet-stream",
        "Content-Length": String(result.blob.size ?? ""),
        "Cache-Control": "private, max-age=300",
      },
    });
  } catch {
    return NextResponse.json({ error: "ticket no encontrado" }, { status: 404 });
  }
}
