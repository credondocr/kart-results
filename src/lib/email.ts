import { Resend } from "resend";

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
