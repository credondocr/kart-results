import { NextResponse } from "next/server";
import { db, dbUrl } from "@/lib/db";
import { sendLatinoamericanoPreRegistro } from "@/lib/email";
import { appendPreRegistro } from "../lib/sheets";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
/** Códigos ISO 3166-1 alpha-2 (lo que guarda el form como nacionalidad). */
const COUNTRY_RE = /^[A-Z]{2}$/;

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json({ message: "JSON inválido." }, { status: 400 });
    }

    const nombre = String(body.nombre ?? "").trim();
    const nacionalidad = String(body.nacionalidad ?? "").trim().toUpperCase();
    const categoria = String(body.categoria ?? "").trim();
    const equipo = String(body.equipo ?? "").trim();
    const carpa = Boolean(body.carpa);
    const correo = String(body.correo ?? "").trim();
    const captchaToken = String(body.captchaToken ?? "").trim();

    const missing: string[] = [];
    if (!nombre) missing.push("nombre");
    if (!nacionalidad) missing.push("nacionalidad");
    if (!categoria) missing.push("categoria");
    if (!equipo) missing.push("equipo");
    if (!correo) missing.push("correo");
    if (missing.length) {
      return NextResponse.json(
        { message: `Faltan campos: ${missing.join(", ")}.` },
        { status: 400 }
      );
    }
    if (!EMAIL_RE.test(correo)) {
      return NextResponse.json(
        { message: "El correo no es válido." },
        { status: 400 }
      );
    }
    if (!COUNTRY_RE.test(nacionalidad)) {
      return NextResponse.json(
        { message: "La nacionalidad no es válida." },
        { status: 400 }
      );
    }

    const secretKey = process.env.RECAPTCHA_SECRET_KEY;
    if (secretKey) {
      if (!captchaToken) {
        return NextResponse.json(
          { message: "Completa la verificación de seguridad." },
          { status: 400 }
        );
      }
      const verifyRes = await fetch(
        `https://www.google.com/recaptcha/api/siteverify?secret=${encodeURIComponent(
          secretKey
        )}&response=${encodeURIComponent(captchaToken)}`,
        { method: "POST" }
      );
      const verifyData = (await verifyRes.json()) as { success?: boolean };
      if (!verifyData.success) {
        return NextResponse.json(
          { message: "La verificación de seguridad falló. Intenta de nuevo." },
          { status: 400 }
        );
      }
    }

    // 1) Neon (fuente primaria — rápido, es lo que lee la página)
    if (!dbUrl()) {
      return NextResponse.json(
        { message: "Base de datos no disponible. Intenta más tarde." },
        { status: 503 }
      );
    }
    const sql = db();
    await sql`
      INSERT INTO latinoamericano_registrations
        (nombre, nacionalidad, categoria, equipo, carpa, correo)
      VALUES (${nombre}, ${nacionalidad}, ${categoria}, ${equipo}, ${carpa}, ${correo})
    `;

    // 2) Google Sheets (espejo para organizadores) — fire-and-forget.
    void appendPreRegistro({
      nombre,
      nacionalidad,
      categoria,
      equipo,
      carpa,
      correo,
    })
      .then(() => sql`
        UPDATE latinoamericano_registrations
        SET sheet_synced = true
        WHERE id = (SELECT max(id) FROM latinoamericano_registrations
                    WHERE nombre = ${nombre} AND correo = ${correo})
      `)
      .catch((err) =>
        console.error("[latinoamericano/submit] sheets mirror failed:", err)
      );

    // 3) Correo de confirmación — fire-and-forget.
    void sendLatinoamericanoPreRegistro({
      to: correo,
      name: nombre.split(/\s+/)[0] ?? nombre,
      categoria,
      equipo,
    });

    return NextResponse.json({ message: "Pre-registro guardado." });
  } catch (error) {
    console.error("[latinoamericano/submit]", error);
    return NextResponse.json(
      { message: "Error interno. Intenta de nuevo en unos minutos." },
      { status: 500 }
    );
  }
}
