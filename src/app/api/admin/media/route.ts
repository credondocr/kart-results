import { NextResponse } from "next/server";
import { list, put } from "@vercel/blob";
import { requireRole } from "@/lib/auth";

export const runtime = "nodejs";

/** Lista imágenes de noticias en Blob. */
export async function GET(request: Request) {
  if (!requireRole(request, ["admin", "editor"])) {
    return NextResponse.json({ error: "no autorizado" }, { status: 401 });
  }
  try {
    const { blobs } = await list({ prefix: "news/", limit: 200 });
    const images = blobs
      .filter((b) => /\.(jpe?g|png|webp|gif|avif)$/i.test(b.pathname))
      .map((b) => ({
        pathname: b.pathname,
        url: `/api/news-images/${b.pathname}`,
        size: b.size,
        uploadedAt: b.uploadedAt,
        name: b.pathname.split("/").pop() ?? "",
      }))
      .sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());
    return NextResponse.json({ images });
  } catch (err) {
    console.error("[media list]", err);
    return NextResponse.json({ images: [] });
  }
}

/** Sube una imagen a la biblioteca. */
export async function POST(request: Request) {
  if (!requireRole(request, ["admin", "editor"])) {
    return NextResponse.json({ error: "no autorizado" }, { status: 401 });
  }
  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ error: "form inválido" }, { status: 400 });
  }
  const file = form.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json({ error: "archivo requerido" }, { status: 400 });
  }
  if (file.size > 5_000_000) {
    return NextResponse.json({ error: "máximo5MB" }, { status: 400 });
  }
  if (!file.type.startsWith("image/")) {
    return NextResponse.json({ error: "solo imágenes" }, { status: 400 });
  }
  try {
    const bytes = Buffer.from(await file.arrayBuffer());
    const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const path = `news/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const blob = await put(path, bytes, {
      access: "private",
      contentType: file.type,
    });
    return NextResponse.json({
      pathname: blob.pathname,
      url: `/api/news-images/${blob.pathname}`,
    });
  } catch (err) {
    console.error("[media upload]", err);
    return NextResponse.json({ error: "no se pudo subir" }, { status: 500 });
  }
}
