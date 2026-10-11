import { createHmac, randomBytes, timingSafeEqual, createHash } from "crypto";
import bcrypt from "bcryptjs";

export type Role = "admin" | "piloto";

const COOKIE = "kr_session";
/** Sesión normal:1 día. "Recuérdame":30 días. */
const MAX_AGE_S = 60 * 60 * 24;
const MAX_AGE_REMEMBER_S = 60 * 60 * 24 * 30;

function secret(): string {
  const s = process.env.ADMIN_SESSION_SECRET;
  if (!s) throw new Error("ADMIN_SESSION_SECRET no configurada");
  return s;
}

/* ---------- passwords ---------- */

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/* ---------- session token (HMAC, payload {uid, role, exp}) ---------- */

interface SessionPayload {
  uid: number;
  role: Role;
  exp: number;
}

function sign(payload: string): string {
  return createHmac("sha256", secret()).update(payload).digest("base64url");
}

export function sessionMaxAge(remember = false): number {
  return remember ? MAX_AGE_REMEMBER_S : MAX_AGE_S;
}

export function createSessionToken(
  uid: number,
  role: Role,
  remember = false
): string {
  const payload: SessionPayload = {
    uid,
    role,
    exp: Date.now() + sessionMaxAge(remember) * 1000,
  };
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${body}.${sign(body)}`;
}

export function verifySession(token: string | null | undefined): SessionPayload | null {
  if (!token) return null;
  const [body, sig] = token.split(".");
  if (!body || !sig) return null;
  const expected = sign(body);
  let sigOk = false;
  try {
    sigOk = timingSafeEqual(Buffer.from(sig), Buffer.from(expected));
  } catch {
    sigOk = false;
  }
  if (!sigOk) return null;
  try {
    const payload = JSON.parse(
      Buffer.from(body, "base64url").toString("utf-8")
    ) as SessionPayload;
    if (!payload.uid || !payload.role || Date.now() > payload.exp) return null;
    return payload;
  } catch {
    return null;
  }
}

/* ---------- cookie ---------- */

export function sessionCookie(token: string, remember = false): string {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  return `${COOKIE}=${token}; HttpOnly; Path=/; Max-Age=${sessionMaxAge(remember)}; SameSite=Lax${secure}`;
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

export interface AuthUser {
  uid: number;
  role: Role;
}

export function getAuth(request: Request): AuthUser | null {
  const payload = verifySession(readSessionCookie(request));
  if (!payload) return null;
  return { uid: payload.uid, role: payload.role };
}

export function requireRole(
  request: Request,
  roles: Role[]
): AuthUser | null {
  const auth = getAuth(request);
  if (!auth || !roles.includes(auth.role)) return null;
  return auth;
}

/* ---------- invitaciones ---------- */

export function generateInviteToken(): string {
  return randomBytes(32).toString("base64url");
}

export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export const INVITE_TTL_DAYS = 7;
