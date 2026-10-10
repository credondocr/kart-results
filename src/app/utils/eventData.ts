import { existsSync, readFileSync } from "fs";
import { join } from "path";

/** Tipos y loader de los eventos importados (src/data/events/<id>.json). */

export interface SlimRow {
  pos: number;
  posInClass: number;
  name: string;
  num: string;
  cls: string;
  status: string;
  laps?: number;
  total?: string;
  diff?: string;
  gap?: string;
  bestTime?: string;
  bestLap?: number;
  bestSpeed?: number;
}

export interface Classification {
  type: string;
  classes: string[];
  bestLap?: { name: string; lapNumber: number; lapTime: string; speed?: number };
  rows: SlimRow[];
}

export interface EventSession {
  id: number;
  name: string;
  type: "practice" | "qualify" | "race" | string;
  startTime: string;
  groupName: string;
  resultStatus?: string;
  classification: Classification | null;
}

export interface EventDay {
  name: string;
  date: string;
  sessions: EventSession[];
}

export interface EventData {
  id: number;
  name: string;
  startDate: string;
  updatedAt: string;
  sourceUrl: string;
  importedAt: string;
  organization: { name: string; url?: string; country?: string };
  location?: { name: string; lengthLabel?: string; country?: string };
  uploadSoftware?: { name: string; version?: string };
  days: EventDay[];
}

const cache = new Map<string, EventData>();

export function loadEvent(id: string): EventData | null {
  if (!/^\d+$/.test(id)) return null;
  const cached = cache.get(id);
  if (cached) return cached;
  const path = join(process.cwd(), "src", "data", "events", `${id}.json`);
  if (!existsSync(path)) return null;
  const data = JSON.parse(readFileSync(path, "utf8")) as EventData;
  cache.set(id, data);
  return data;
}

/** Categorías (resultClass) presentes en el evento, ordenadas alfabéticamente. */
export function eventClasses(event: EventData): string[] {
  const set = new Set<string>();
  for (const day of event.days) {
    for (const session of day.sessions) {
      for (const cls of session.classification?.classes ?? []) set.add(cls);
    }
  }
  return [...set].sort((a, b) => a.localeCompare(b));
}

/** Sesiones que incluyen a una categoría (las sesiones combinadas se repiten). */
export function sessionsForClass(event: EventData, className: string): EventSession[] {
  const sessions: EventSession[] = [];
  for (const day of event.days) {
    for (const session of day.sessions) {
      if (session.classification?.classes.includes(className)) sessions.push(session);
    }
  }
  return sessions;
}

/** "Kid Kart - Final" → "Final"; "VLR Junior - P1" → "P1". */
export function sessionLabel(session: EventSession): string {
  const index = session.name.lastIndexOf(" - ");
  return index >= 0 ? session.name.slice(index + 3) : session.name;
}

export function sessionTime(session: EventSession): string {
  return session.startTime.slice(11, 16);
}

export function formatDate(iso: string): string {
  if (!iso) return "";
  const date = new Date(`${iso}T12:00:00`);
  return date.toLocaleDateString("es-CR", { day: "numeric", month: "short", year: "numeric" });
}

export const TYPE_LABELS: Record<string, string> = {
  practice: "Práctica",
  qualify: "Clasificación",
  race: "Carrera",
};

/** Link al campeonato correspondiente: "CRKC 2026 - Fecha 1 - Invierno" → /Campeonato/2026/invierno */
export function seasonLinkFromEvent(event: EventData): { href: string; label: string } | null {
  const season = event.name.match(/(invierno|verano)/i);
  const fecha = event.name.match(/fecha\s*(\d+)/i);
  const year = event.startDate.slice(0, 4);
  if (!season) return null;
  const label = `${season[1][0].toUpperCase()}${season[1].slice(1).toLowerCase()} ${year}${fecha ? ` · Fecha ${fecha[1]}` : ""}`;
  return { href: `/Campeonato/${year}/${season[1].toLowerCase()}`, label };
}
