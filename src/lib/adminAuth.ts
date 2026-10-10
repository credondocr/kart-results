import { createHmac, timingSafeEqual } from "crypto";

const COOKIE = "kr_admin";
const MAX_AGE_S = 60 * 60 * 8; // 8 horas

function secret(): string {
  const s = process.env.ADMIN_SESSION_SECRET;
  if (!s) throw new Error("ADMIN_SESSION_SECRET no configurada");
  return s;
}

function sign(payload: string): string {
  return createHmac("sha256", secret()).update(payload).digest("base64url");
}

export function checkPassword(password: string): boolean {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) throw new Error("ADMIN_PASSWORD no configurada");
  const a = Buffer.from(password);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

export function createSessionToken(): string {
  const payload = String(Date.now() + MAX_AGE_S * 1000);
  return `${payload}.${sign(payload)}`;
}

export function verifySessionToken(token: string | null | undefined): boolean {
  if (!token) return false;
  const [payload, sig] = token.split(".");
  if (!payload || !sig) return false;
  const expires = Number(payload);
  if (!Number.isFinite(expires) || Date.now() > expires) return false;
  const expected = sign(payload);
  try {
    return timingSafeEqual(Buffer.from(sig), Buffer.from(expected));
  } catch {
    return false;
  }
}

export function sessionCookie(token: string): string {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  return `${COOKIE}=${token}; HttpOnly; Path=/; Max-Age=${MAX_AGE_S}; SameSite=Lax${secure}`;
}

export function clearSessionCookie(): string {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  return `${COOKIE}=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax${secure}`;
}

export function readSessionCookie(request: Request): string | null {
  const header = request.headers.get("cookie");
  if (!header) return null;
  for (const part of header.split(";")) {
    const [name, ...rest] = part.trim().split("=");
    if (name === COOKIE) return rest.join("=");
  }
  return null;
}

export function isAuthenticated(request: Request): boolean {
  return verifySessionToken(readSessionCookie(request));
}

export const ADMIN_COOKIE = COOKIE;
