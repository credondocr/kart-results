import { google } from "googleapis";
import { promises as fs } from "fs";
import path from "path";

/**
 * Cliente Google Sheets para los pre-registros del Latinoamericano.
 *
 * Prioridad de credenciales (la hoja necesita la cuenta con permiso de escritura):
 * 1. LATINO_SHEET_CLIENT_EMAIL + LATINO_SHEET_PRIVATE_KEY  (cuenta dedicada sheet-391)
 * 2. GOOGLE_SERVICE_ACCOUNT (JSON del service account como string)
 * 3. GOOGLE_CLIENT_EMAIL + GOOGLE_PRIVATE_KEY (variables compartidas del proyecto)
 * 4. ./credentials.json (solo local; no commitear)
 *
 * GOOGLE_SPREADSHEET_ID es opcional; usa la hoja histórica por defecto.
 */

const DEFAULT_SPREADSHEET_ID =
  "1Qu08HxnQLg0TJstAl3XTBXoltMTJ7Xo3yaxHCSpSAYk";
const SHEET = "Sheet1";

function unescapeKey(key: string) {
  return key.replace(/\\n/g, "\n");
}

async function credentials(): Promise<{ client_email: string; private_key: string }> {
  if (process.env.LATINO_SHEET_CLIENT_EMAIL && process.env.LATINO_SHEET_PRIVATE_KEY) {
    return {
      client_email: process.env.LATINO_SHEET_CLIENT_EMAIL,
      private_key: unescapeKey(process.env.LATINO_SHEET_PRIVATE_KEY),
    };
  }
  const raw = process.env.GOOGLE_SERVICE_ACCOUNT;
  if (raw) {
    const cred = JSON.parse(raw);
    return { client_email: cred.client_email, private_key: unescapeKey(cred.private_key) };
  }
  // credentials.json local tiene prioridad sobre las vars compartidas del proyecto
  // (GOOGLE_CLIENT_EMAIL es la cuenta de galería, sin permiso de escritura en la hoja).
  try {
    const filePath = path.join(process.cwd(), "credentials.json");
    const cred = JSON.parse(await fs.readFile(filePath, "utf-8"));
    if (cred.client_email && cred.private_key) {
      return { client_email: cred.client_email, private_key: unescapeKey(cred.private_key) };
    }
  } catch {
    // sin archivo local: seguimos con las env vars compartidas
  }
  if (process.env.GOOGLE_CLIENT_EMAIL && process.env.GOOGLE_PRIVATE_KEY) {
    return {
      client_email: process.env.GOOGLE_CLIENT_EMAIL,
      private_key: unescapeKey(process.env.GOOGLE_PRIVATE_KEY),
    };
  }
  throw new Error(
    "Faltan credenciales de Google Sheets: configurá LATINO_SHEET_* o credentials.json"
  );
}

async function sheetsClient() {
  const { client_email, private_key } = await credentials();
  const auth = new google.auth.JWT({
    email: client_email,
    key: private_key,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
  return google.sheets({ version: "v4", auth });
}

function spreadsheetId() {
  return process.env.GOOGLE_SPREADSHEET_ID || DEFAULT_SPREADSHEET_ID;
}

export type FilaPreRegistro = {
  nombre: string;
  nacionalidad: string;
  categoria: string;
  equipo: string;
  carpa: boolean;
  correo: string;
};

/** Append en Sheet1!A:F — orden histórico: nombre, nacionalidad, categoria, equipo, carpa, correo. */
export async function appendPreRegistro(fila: FilaPreRegistro): Promise<void> {
  const sheets = await sheetsClient();
  await sheets.spreadsheets.values.append({
    spreadsheetId: spreadsheetId(),
    range: `${SHEET}!A:F`,
    valueInputOption: "USER_ENTERED",
    requestBody: {
      values: [
        [
          fila.nombre,
          fila.nacionalidad,
          fila.categoria,
          fila.equipo,
          fila.carpa ? "TRUE" : "FALSE",
          fila.correo,
        ],
      ],
    },
  });
}

/** Lee columnas públicas A:D (nombre, nacionalidad, categoria, equipo). Nunca expone correo/carpa. */
export async function getPreRegistrosPublicos(): Promise<
  { nombre: string; nacionalidad: string; categoria: string; equipo: string }[]
> {
  const sheets = await sheetsClient();
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: spreadsheetId(),
    range: `${SHEET}!A:D`,
  });
  const rows = response.data.values || [];
  return rows.slice(1).map((row) => ({
    nombre: String(row[0] ?? "").trim(),
    nacionalidad: String(row[1] ?? "").trim(),
    categoria: String(row[2] ?? "").trim(),
    equipo: String(row[3] ?? "").trim(),
  }));
}

/**
 * Borra del Sheet la fila que coincida exacta con la fila indicada.
 * Best-effort: devuelve true si borró algo. El sheetId 0 = Sheet1 (gid por defecto).
 */
export async function deletePreRegistroSheetRow(row: {
  nombre: string;
  nacionalidad: string;
  categoria: string;
  equipo: string;
}): Promise<boolean> {
  const sheets = await sheetsClient();
  const id = spreadsheetId();
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: id,
    range: `${SHEET}!A:D`,
  });
  const rows = res.data.values ?? [];
  const idx = rows.findIndex(
    (r) =>
      String(r[0] ?? "").trim() === row.nombre.trim() &&
      String(r[1] ?? "").trim().toUpperCase() === row.nacionalidad.toUpperCase() &&
      String(r[2] ?? "").trim() === row.categoria.trim() &&
      String(r[3] ?? "").trim() === row.equipo.trim()
  );
  if (idx < 0) return false;
  await sheets.spreadsheets.batchUpdate({
    spreadsheetId: id,
    requestBody: {
      requests: [
        {
          deleteDimension: {
            range: { sheetId: 0, dimension: "ROWS", startIndex: idx, endIndex: idx + 1 },
          },
        },
      ],
    },
  });
  return true;
}
