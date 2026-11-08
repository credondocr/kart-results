import { db } from "./src/lib/db";
const sql = db();
const rows = await sql`SELECT id, nombre, correo, sheet_synced, created_at FROM latinoamericano_registrations ORDER BY id DESC LIMIT 5` as unknown as Array<any>;
console.log(JSON.stringify(rows, null, 1));
