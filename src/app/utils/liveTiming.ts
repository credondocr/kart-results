/**
 * Live timing (lt-api.speedhive.com) — API no oficial de MyLaps/SpeedHive.
 * Requiere Origin/Referer de speedhive.mylaps.com (soft-auth).
 * Los IDs del live (ej. ITJTNDLQ-2147483744) NO son paritarios con los
 * numéricos de eventresults-api; este namespace es independiente.
 */

const LT_API = "https://lt-api.speedhive.com";

const LT_HEADERS = {
  Origin: "https://speedhive.mylaps.com",
  Referer: "https://speedhive.mylaps.com/",
};

export const LIVE_EVENT_ID_RE = /^[a-z0-9]+-\d+$/i;

export interface LiveEventLocation {
  c?: string;
  cc?: string;
  ct?: string;
  lat?: string;
  lon?: string;
}

export interface LiveTrack {
  id?: string;
  n?: string;
  l?: number;
  um?: string;
}

export interface LiveWeather {
  t?: number;
  ts?: string;
  pi?: number;
  pp?: number;
  ty?: number;
}

export interface LiveEventSummary {
  id: string;
  n?: string;
  pyt?: number;
  s?: number;
  f?: number;
  dt?: string;
  vs?: string;
  l?: LiveEventLocation;
  u?: string;
  ov?: string;
  t?: LiveTrack;
  w?: LiveWeather;
}

export interface LiveSession {
  id: string;
  eId?: string;
  eNam?: string;
  f?: number;
  rnTp?: number;
  gNam?: string;
  ls?: number;
  lsTg?: number;
  rnNam?: string;
  stod?: string;
}

export interface LiveEventDetail {
  ss: LiveSession[];
  id: string;
  n?: string;
  pyt?: number;
  s?: number;
  f?: number;
  dt?: string;
  l?: LiveEventLocation;
  u?: string;
  ov?: string;
  t?: LiveTrack;
  w?: LiveWeather;
}

export interface LiveRow {
  sesId?: string;
  eId?: string;
  id?: string;
  btTm?: string;
  ibt?: boolean;
  btCl?: boolean;
  tTm?: string;
  lsTm?: string;
  ls?: number;
  nam?: string;
  no?: string;
  dNo?: string;
  lbpos?: number;
  pCl?: string;
  pos?: string;
  gp?: string;
  df?: string;
  gpCl?: string;
  dfCl?: string;
  mkr?: number;
  anim?: number;
}

export interface LiveActivePayload {
  l: LiveRow[];
  resultconfig?: Record<string, boolean>;
  id?: string;
  eId?: string;
  btLpTim?: string;
  eNam?: string;
  f?: number;
  rnTp?: number;
  gNam?: string;
  ls?: number;
  lsTg?: number;
  rcTm?: string;
  rnNam?: string;
  stod?: string;
}

async function ltFetch<T>(path: string, revalidate: number): Promise<T | null> {
  try {
    const res = await fetch(`${LT_API}${path}`, {
      headers: LT_HEADERS,
      next: { revalidate },
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

/** Feed global de eventos en vivo (~150KB con limit=500). */
export async function fetchLiveFeed(
  limit = 300
): Promise<LiveEventSummary[]> {
  const data = await ltFetch<{ LiveEvents?: LiveEventSummary[] }>(
    `/api/events?limit=${limit}`,
    60
  );
  return data?.LiveEvents ?? [];
}

/** Detalle de un evento live: cronograma de sesiones + meta (circuito, clima). */
export async function fetchLiveEventDetail(
  eventId: string
): Promise<LiveEventDetail | null> {
  if (!LIVE_EVENT_ID_RE.test(eventId)) return null;
  return ltFetch<LiveEventDetail>(`/api/events/${eventId}`, 30);
}

/** Sesión activa con posiciones en vivo (null si no hay carrera ahora). */
export async function fetchActiveSession(
  eventId: string
): Promise<LiveActivePayload | null> {
  if (!LIVE_EVENT_ID_RE.test(eventId)) return null;
  return ltFetch<LiveActivePayload>(`/api/events/${eventId}/active`, 5);
}

const CR_RE = /\b(crkc|acek|costa\s*rica)\b/i;

/** ¿Es un evento relevante para CR (país CR o nombre/organizador CR)? */
export function isCrRelevant(event: LiveEventSummary): boolean {
  if (event.l?.cc?.toLowerCase() === "cr") return true;
  return CR_RE.test(event.n ?? "") || CR_RE.test(event.u ?? "");
}

/** Entrada del feed con enriquecimiento (video, clima) para un evento live. */
export async function findLiveEvent(
  eventId: string
): Promise<LiveEventSummary | null> {
  const feed = await fetchLiveFeed();
  return feed.find((e) => e.id === eventId) ?? null;
}
