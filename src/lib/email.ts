import { Resend } from "resend";
import { promises as fs } from "fs";
import { join } from "path";

function client(): Resend | null {
  if (!process.env.RESEND_API_KEY) return null;
  return new Resend(process.env.RESEND_API_KEY);
}

const FROM =
  process.env.RESEND_FROM ?? "Kart Results <onboarding@resend.dev>";

const layout = (title: string, bodyHtml: string) => `
<!doctype html>
<html lang="es">
  <body style="margin:0;background:#070A14;font-family:Arial,Helvetica,sans-serif;color:#E8EAF2">
    <div style="max-width:520px;margin:0 auto;padding:32px 20px">
      <p style="font-size:11px;letter-spacing:0.2em;text-transform:uppercase;color:#9BA3BD;margin:0 0 8px">
        Costa Rica Kart Championship
      </p>
      <h1 style="font-size:22px;margin:0 0 16px;color:#E8EAF2">${title}</h1>
      ${bodyHtml}
      <p style="margin-top:32px;font-size:12px;color:#9BA3BD">
        — Equipo ACEK / CRKC
      </p>
    </div>
  </body>
</html>
`;

export interface InviteEmailInput {
  to: string;
  name: string | null;
  role: string;
  inviteUrl: string;
}

/** Email de invitación. Best-effort: si falla, no revienta el caller. */
export async function sendInviteEmail(input: InviteEmailInput): Promise<boolean> {
  const resend = client();
  if (!resend) return false;
  const displayName = input.name ?? input.to;
  try {
    const { error } = await resend.emails.send({
      from: FROM,
      to: input.to,
      subject: "Invitación — Costa Rica Kart Championship",
      html: layout(
        `Hola ${displayName}`,
        `
        <p style="font-size:14px;line-height:1.6;color:#C6CBDB">
          Fuiste invitado como <strong style="color:#4C8DFF">${input.role}</strong>
          al sistema del Costa Rica Kart Championship.
        </p>
        <p style="font-size:14px;line-height:1.6;color:#C6CBDB">
          Crea tu contraseña con este link (válido por 7 días, un solo uso):
        </p>
        <p style="margin:24px 0">
          <a href="${input.inviteUrl}"
             style="display:inline-block;background:#4C8DFF;color:#fff;font-weight:700;font-size:13px;letter-spacing:0.08em;text-transform:uppercase;text-decoration:none;padding:12px 22px;border-radius:8px">
            Crear mi cuenta
          </a>
        </p>
        <p style="font-size:12px;color:#9BA3BD;word-break:break-all">
          Si el botón no funciona, copia y pega este link:<br>${input.inviteUrl}
        </p>
        `
      ),
    });
    if (error) {
      console.error("[email] invite error:", error);
      return false;
    }
    return true;
  } catch (err) {
    console.error("[email] invite exception:", err);
    return false;
  }
}

async function sendSafe(
  to: string,
  subject: string,
  title: string,
  body: string
): Promise<boolean> {
  const resend = client();
  if (!resend) return false;
  try {
    const { error } = await resend.emails.send({
      from: FROM,
      to,
      subject,
      html: layout(title, body),
    });
    if (error) {
      console.error("[email] error:", error);
      return false;
    }
    return true;
  } catch (err) {
    console.error("[email] exception:", err);
    return false;
  }
}

/** Confirmación de inscripción recibida. */
export async function sendRegistrationReceived(input: {
  to: string;
  name: string;
  eventName: string;
  categories: string[];
  paymentMethod: string;
  amountTotal: number | null;
}): Promise<boolean> {
  const cats = input.categories.map((c) => `• ${c}`).join("<br>");
  const pago =
    input.paymentMethod === "track"
      ? "Pagarás en pista."
      : input.amountTotal
        ? `Monto a transferir: <strong>$${Number(input.amountTotal).toLocaleString("en-US")}</strong>. Sube tu comprobante y el admin lo verifica.`
        : "Revisa el estado con el admin.";
  return sendSafe(
    input.to,
    `Inscripción recibida — ${input.eventName}`,
    `Inscripción recibida, ${input.name}`,
    `
    <p style="font-size:14px;color:#C6CBDB">Recibimos tu inscripción a <strong style="color:#E8EAF2">${input.eventName}</strong>:</p>
    <p style="font-size:14px;color:#C6CBDB">${cats}</p>
    <p style="font-size:14px;color:#C6CBDB">${pago}</p>
    <p style="font-size:13px;color:#9BA3BD">Te avisaremos cuando el admin verifique y apruebe tu inscripción.</p>
    `
  );
}

/** Estado de la inscripción cambió. */
export async function sendRegistrationStatus(input: {
  to: string;
  name: string;
  eventName: string;
  status: "verified" | "approved" | "rejected";
  note?: string | null;
}): Promise<boolean> {
  if (input.status === "verified") {
    return sendSafe(
      input.to,
      `Pago verificado — ${input.eventName}`,
      `Pago verificado, ${input.name}`,
      `<p style="font-size:14px;color:#C6CBDB">Verificamos tu pago para <strong>${input.eventName}</strong>. Falta la aprobación final.</p>`
    );
  }
  if (input.status === "approved") {
    return sendSafe(
      input.to,
      `¡Inscripción aprobada! — ${input.eventName}`,
      `¡Listo para correr, ${input.name}!`,
      `<p style="font-size:14px;color:#C6CBDB">Tu inscripción a <strong>${input.eventName}</strong> fue <strong style="color:#4C8DFF">aprobada</strong>. Nos vemos en el paddock.</p>`
    );
  }
  return sendSafe(
    input.to,
    `Inscripción no aprobada — ${input.eventName}`,
    `Inscripción no aprobada, ${input.name}`,
    `<p style="font-size:14px;color:#C6CBDB">Tu inscripción a <strong>${input.eventName}</strong> no fue aprobada.${input.note ? `<br><br>Motivo: ${input.note}` : ""}</p>`
  );
}

/** Email para restablecer contraseña. */
export async function sendSafeResetEmail(
  to: string,
  name: string,
  resetUrl: string
): Promise<boolean> {
  return sendSafe(
    to,
    "Restablecer contraseña — Costa Rica Kart Championship",
    `Hola ${name}`,
    `
    <p style="font-size:14px;color:#C6CBDB">
      Recibimos un pedido para cambiar tu contraseña.
    </p>
    <p style="margin:24px 0">
      <a href="${resetUrl}"
         style="display:inline-block;background:#4C8DFF;color:#fff;font-weight:700;font-size:13px;letter-spacing:0.08em;text-transform:uppercase;text-decoration:none;padding:12px 22px;border-radius:8px">
        Elegir nueva contraseña
      </a>
    </p>
    <p style="font-size:12px;color:#9BA3BD">
      El link expira en1 hora. Si no fuiste tú, ignora este correo.
    </p>
    <p style="font-size:12px;color:#9BA3BD;word-break:break-all">
      ${resetUrl}
    </p>
    `
  );
}

/** Confirmación de pre-registro del Latinoamericano de Karting (IV edición).
 *
 * Si existe RESEND_TEMPLATE_LATINOAMERICANO (id del template en el dashboard
 * de Resend), se envía con variables dinámicas. Si no, usa el HTML inline
 * con la imagen embebida por CID.
 */
export async function sendLatinoamericanoPreRegistro(input: {
  to: string;
  name: string;
  categoria: string;
  equipo: string;
}): Promise<boolean> {
  const resend = client();
  if (!resend) return false;

  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://resultados.acekcr.com";
  const parrillaUrl = `${siteUrl.replace(/\/$/, "")}/latinoamericano#pre-inscritos`;

  const equipoLine =
    input.equipo && !/^no tengo equipo$/i.test(input.equipo.trim())
      ? input.equipo.trim()
      : "Sin equipo";

  const templateId = process.env.RESEND_TEMPLATE_LATINOAMERICANO;

  try {
    if (templateId) {
      const { error } = await resend.emails.send({
        from: FROM,
        to: input.to,
        subject: "Pre-registro confirmado — Latinoamericano de Karting 2027",
        template: {
          id: templateId,
          variables: {
            first_name: input.name,
            categoria: input.categoria,
            equipo: equipoLine,
            parrilla_url: parrillaUrl,
          },
        },
      });
      if (error) {
        console.error("[email] latinoamericano template error:", error);
        return false;
      }
      return true;
    }

    // Fallback: HTML inline con póster embebido (CID)
    let poster: Buffer | null = null;
    try {
      poster = await fs.readFile(
        join(process.cwd(), "public/media/eventos/latinoamericano-email.jpeg")
      );
    } catch (err) {
      console.error("[email] latinoamericano poster read error:", err);
    }

    const html = `
<!doctype html>
<html lang="es">
  <body style="margin:0;background:#070A14;font-family:Arial,Helvetica,sans-serif;color:#E8EAF2">
    <div style="max-width:520px;margin:0 auto;padding:0">
      ${poster
        ? `<img src="cid:latinoamericano-poster"
                   alt="Campeonato Latinoamericano de Karting 2027"
                   width="520"
                   style="display:block;width:100%;height:auto;border-radius:12px 12px 0 0" />`
        : `<div style="background:linear-gradient(135deg,#0B1B3A,#070A14);padding:36px 24px;border-radius:12px 12px 0 0;text-align:center">
               <p style="margin:0;font-size:11px;letter-spacing:0.22em;text-transform:uppercase;color:#E8B84B">IV Edición · Costa Rica 2027</p>
               <p style="margin:8px 0 0;font-size:28px;font-weight:700;color:#4C8DFF">Latinoamericano</p>
               <p style="margin:4px 0 0;font-size:16px;color:#E8EAF2">de Karting 2027</p>
             </div>`
      }
      <div style="background:#0F1322;padding:32px 28px 36px;border-radius:0 0 12px 12px">
        <p style="margin:0 0 4px;font-size:11px;letter-spacing:0.2em;text-transform:uppercase;color:#E8B84B;font-weight:700">
          Pre-registro confirmado
        </p>
        <h1 style="margin:0 0 12px;font-size:24px;line-height:1.25;color:#E8EAF2">
          ¡Listo, ${input.name}!
        </h1>
        <p style="margin:0 0 18px;font-size:14px;line-height:1.65;color:#C6CBDB">
          Tu pre-registro al <strong style="color:#E8EAF2">Campeonato Latinoamericano de Karting 2027</strong>
          (IV Edición) se guardó correctamente. Ya estás en la parrilla de pre-inscritos.
        </p>

        <div style="border:1px solid rgba(255,255,255,0.08);border-radius:10px;padding:16px 18px;margin:0 0 22px;background:rgba(255,255,255,0.03)">
          <table role="presentation" style="width:100%;border-collapse:collapse;font-size:13px">
            <tr>
              <td style="padding:4px 0;color:#9BA3BD;letter-spacing:0.06em;text-transform:uppercase;font-size:10px;font-weight:700">Categoría</td>
              <td style="padding:4px 0;color:#E8EAF2;font-weight:600;text-align:right">${input.categoria}</td>
            </tr>
            <tr>
              <td style="padding:4px 0;color:#9BA3BD;letter-spacing:0.06em;text-transform:uppercase;font-size:10px;font-weight:700">Equipo</td>
              <td style="padding:4px 0;color:#E8EAF2;font-weight:600;text-align:right">${equipoLine}</td>
            </tr>
            <tr>
              <td style="padding:4px 0;color:#9BA3BD;letter-spacing:0.06em;text-transform:uppercase;font-size:10px;font-weight:700">Fechas</td>
              <td style="padding:4px 0;color:#E8EAF2;font-weight:600;text-align:right">7 – 9 de mayo de 2027</td>
            </tr>
            <tr>
              <td style="padding:4px 0;color:#9BA3BD;letter-spacing:0.06em;text-transform:uppercase;font-size:10px;font-weight:700">Sede</td>
              <td style="padding:4px 0;color:#E8EAF2;font-weight:600;text-align:right">P1 Speedway · Costa Rica</td>
            </tr>
          </table>
        </div>

        <p style="margin:0 0 20px;font-size:14px;line-height:1.65;color:#C6CBDB">
          <strong style="color:#E8EAF2">Próximamente</strong> te enviaremos más información
          sobre el evento: cronograma, horarios, logistica del paddock e inscripciones formales.
        </p>

        <p style="margin:0 0 24px;text-align:center">
          <a href="${parrillaUrl}"
             style="display:inline-block;background:#4C8DFF;color:#fff;font-weight:700;font-size:13px;letter-spacing:0.08em;text-transform:uppercase;text-decoration:none;padding:13px 26px;border-radius:8px">
            Ver la parrilla de pre-inscritos
          </a>
        </p>

        <p style="margin:0;font-size:12px;line-height:1.6;color:#9BA3BD">
          Este correo confirma tu pre-registro gratuito. La inscripción formal y el pago
          se gestionarán por separado cuando se abran las inscripciones.
        </p>
      </div>
      <p style="margin:20px 28px 32px;font-size:12px;color:#9BA3BD;text-align:center">
        — Equipo ACEK · Campeonato Latinoamericano de Karting
      </p>
    </div>
  </body>
</html>
`;

    const { error } = await resend.emails.send({
      from: FROM,
      to: input.to,
      subject: "Pre-registro confirmado — Latinoamericano de Karting 2027",
      html,
      ...(poster
        ? {
          attachments: [
            {
              content: poster,
              filename: "latinoamericano-2027.jpeg",
              contentType: "image/jpeg",
              contentId: "latinoamericano-poster",
            },
          ],
        }
        : {}),
    });
    if (error) {
      console.error("[email] latinoamericano pre-registro error:", error);
      return false;
    }
    return true;
  } catch (err) {
    console.error("[email] latinoamericano pre-registro exception:", err);
    return false;
  }
}
