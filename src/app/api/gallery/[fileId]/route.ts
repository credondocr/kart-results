import { google } from "googleapis";
import sharp from "sharp";
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

/** Anchos permitidos por el query param sz (evita DoS con tamaños gigantes). */
const WIDTHS: Record<string, number> = {
  w300: 300,
  w600: 600,
  w1000: 1000,
  w1600: 1600,
};

/** Proxy de imágenes de Drive: descarga, redimensiona y sirve en WebP. */
export async function GET(request: Request, { params }: Params) {
  const { fileId } = await params;
  if (!/^[a-zA-Z0-9_-]{10,}$/.test(fileId)) {
    return NextResponse.json({ error: "id inválido" }, { status: 400 });
  }
  const jwt = auth();
  if (!jwt) {
    return NextResponse.json({ error: "sin credenciales" }, { status: 503 });
  }

  const url = new URL(request.url);
  const szKey = url.searchParams.get("sz") ?? "w1000";
  const width = WIDTHS[szKey] ?? 1000;

  try {
    const drive = google.drive({ version: "v3", auth: jwt });
    const res = await drive.files.get(
      { fileId, alt: "media", supportsAllDrives: true },
      { responseType: "arraybuffer" }
    );
    const original = Buffer.from(res.data as ArrayBuffer);

    const webp = await sharp(original)
      .resize(width, width, { fit: "inside", withoutEnlargement: true })
      .webp({ quality: 80 })
      .toBuffer();

    return new NextResponse(new Uint8Array(webp), {
      headers: {
        "Content-Type": "image/webp",
        "Content-Length": String(webp.length),
        "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
      },
    });
  } catch (err) {
    console.error("[gallery proxy]", err);
    return NextResponse.json({ error: "no se pudo cargar" }, { status: 404 });
  }
}
