/**
 * Seed del usuario admin inicial (si no existe ningún admin).
 * Email: ADMIN_USER_EMAIL (default admin@acekcr.com)
 * Pass:  ADMIN_PASSWORD (ya usada por el auth legacy)
 */
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import bcrypt from "bcryptjs";
import { db, dbUrl } from "@/lib/db";

async function main() {
  if (!dbUrl()) {
    console.log("Sin POSTGRES_URL — seed admin omitido.");
    return;
  }
  const sql = db();
  const existing = (await sql`
    SELECT id FROM users WHERE role = 'admin' LIMIT 1
  `) as unknown as Array<{ id: number }>;
  if (existing.length) {
    console.log("Ya existe un admin — seed omitido.");
    return;
  }
  const email = (process.env.ADMIN_USER_EMAIL ?? "admin@acekcr.com").toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  if (!password) {
    console.error("ADMIN_PASSWORD no configurada — no se puede crear el admin.");
    process.exit(1);
  }
  const hash = await bcrypt.hash(password, 12);
  await sql`
    INSERT INTO users (email, password_hash, role, name)
    VALUES (${email}, ${hash}, 'admin', 'Admin ACEK')
  `;
  console.log(`Seed admin OK: ${email}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
