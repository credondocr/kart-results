import { NextResponse } from "next/server";
import { get } from "@vercel/blob";

export const runtime = "nodejs";

type Params = { params: Promise<{ path: string[] }> };

/**
 * Proxy público de imágenes de noticias (blob private).
 * El contenido de noticias es público; el store es private (no enumerable).
 */
export async function GET(_request: Request, { params }: Params) {
  const { path } = await params;
  const pathname = path.join("/");
  if (!pathname.startsWith("news/")) {
    return NextResponse.json({ error: "path inválido" }, { status: 400 });
  }
  try {
    const result = await get(pathname, { access: "private" });
    if (!result || result.statusCode !== 200) {
      return NextResponse.json({ error: "no encontrada" }, { status: 404 });
    }
    return new Response(result.stream, {
      headers: {
        "Content-Type": result.blob.contentType || "image/jpeg",
        "Content-Length": String(result.blob.size ?? ""),
        "Cache-Control": "public, max-age=604800, stale-while-revalidate=2592000",
      },
    });
  } catch {
    return NextResponse.json({ error: "no encontrada" }, { status: 404 });
  }
}
