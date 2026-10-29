import { NextResponse, after } from "next/server";
import { db, dbUrl } from "@/lib/db";
import { sendFeedbackNotification } from "@/lib/email";

const SENTIMENTS = ["sad", "neutral", "happy"] as const;
type Sentiment = (typeof SENTIMENTS)[number];

const MAX_MESSAGE = 500;

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json({ message: "JSON inválido." }, { status: 400 });
    }

    const sentiment = String(body.sentiment ?? "").trim() as Sentiment;
    const message = String(body.message ?? "").trim();
    const pagePath = String(body.pagePath ?? "").trim() || null;
    const userAgent = String(body.userAgent ?? "").trim() || null;

    const missing: string[] = [];
    if (!sentiment) missing.push("sentiment");
    if (!message) missing.push("message");
    if (missing.length) {
      return NextResponse.json(
        { message: `Faltan campos: ${missing.join(", ")}.` },
        { status: 400 }
      );
    }
    if (!SENTIMENTS.includes(sentiment)) {
      return NextResponse.json(
        { message: "El sentimiento no es válido." },
        { status: 400 }
      );
    }
    if (message.length < 3 || message.length > MAX_MESSAGE) {
      return NextResponse.json(
        { message: `El mensaje debe tener entre 3 y ${MAX_MESSAGE} caracteres.` },
        { status: 400 }
      );
    }

    // 1) Neon (fuente primaria)
    if (!dbUrl()) {
      return NextResponse.json(
        { message: "Base de datos no disponible. Intenta más tarde." },
        { status: 503 }
      );
    }
    const sql = db();
    await sql`
      INSERT INTO feedback_entries (sentiment, message, page_path, user_agent)
      VALUES (${sentiment}, ${message}, ${pagePath}, ${userAgent})
    `;

    // 2) Notificación por correo — fire-and-forget (best-effort).
    after(async () => {
      try {
        await sendFeedbackNotification({ sentiment, message, pagePath });
      } catch (err) {
        console.error("[api/feedback] email failed:", err);
      }
    });

    return NextResponse.json({ message: "Feedback recibido. ¡Gracias!" });
  } catch (error) {
    console.error("[api/feedback]", error);
    return NextResponse.json(
      { message: "Error interno. Intenta de nuevo en unos minutos." },
      { status: 500 }
    );
  }
}
