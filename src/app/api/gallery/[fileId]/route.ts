import { google } from "googleapis";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

type Params = { params: Promise<{ fileId: string }> };

function auth() {
  const email = process.env.GOOGLE_CLIENT_EMAIL;
  const key = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n");
  if (!email || !key) return null;
  return new google.auth.JWT({
    email,
    key,
    scopes: ["https://www.googleapis.com/auth/drive.readonly"],
  });
}

/** Proxy de imágenes de Drive: descarga vía API y la sirve con cache. */
export async function GET(
  request: Request,
  { params }: Params
) {
  const { fileId } = await params;
  if (!/^[a-zA-Z0-9_-]{10,}$/.test(fileId)) {
    return NextResponse.json({ error: "id inválido" }, { status: 400 });
  }
  const jwt = auth();
  if (!jwt) {
    return NextResponse.json({ error: "sin credenciales" }, { status: 503 });
  }

  const url = new URL(request.url);
  const sz = url.searchParams.get("sz") ?? "w1000";

  try {
    const drive = google.drive({ version: "v3", auth: jwt });
    // Thumb via API autenticada (el endpoint público no funciona sin share público)
    const res = await drive.files.get(
      {
        fileId,
        alt: "media",
        supportsAllDrives: true,
      },
      { responseType: "arraybuffer" }
    );
    const buf = Buffer.from(res.data as ArrayBuffer);

    // Si piden thumbnail, redimensionamos con sharp si es posible;
    // por simplicidad devolvemos el original con cache.
    void sz;
    return new NextResponse(new Uint8Array(buf), {
      headers: {
        "Content-Type": res.headers["content-type"] || "image/jpeg",
        "Content-Length": String(buf.length),
        "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
      },
    });
  } catch (err) {
    console.error("[gallery proxy]", err);
    return NextResponse.json({ error: "no se pudo cargar" }, { status: 404 });
  }
}
