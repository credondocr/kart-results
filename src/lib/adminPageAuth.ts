import { cookies } from "next/headers";
import { verifySessionToken, ADMIN_COOKIE } from "@/lib/adminAuth";
import { verifySession } from "@/lib/auth";

/** ¿Hay sesión de admin? Acepta cookie legacy (kr_admin) o unificada (kr_session). */
export async function isAdminAuthenticated(): Promise<boolean> {
  const store = await cookies();
  if (verifySessionToken(store.get(ADMIN_COOKIE)?.value)) return true;
  const session = verifySession(store.get("kr_session")?.value);
  return session?.role === "admin";
}
