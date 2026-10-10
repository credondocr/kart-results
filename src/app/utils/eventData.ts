import { existsSync, readFileSync } from "fs";
import { join } from "path";
import eventsManifest from "@/data/events/manifest.json";

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
  // El orden de los grupos del API no siempre es cronológico
  // (Sábado → Viernes → Domingo); el startTime sí lo es.
  return sessions.sort((a, b) => a.startTime.localeCompare(b.startTime));
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

/* ============ Datos derivados de eventos ============ */

/** Carga todos los eventos del manifiesto (cacheada por loadEvent). */
export function loadAllEvents(): EventData[] {
  const events: EventData[] = [];
  for (const entry of eventsManifest.events) {
    const event = loadEvent(String(entry.id));
    if (event) events.push(event);
  }
  return events;
}

export const slugify = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();

/** Sesión final de una clase (o prefinal como respaldo). */
function sessionByLabel(event: EventData, className: string, label: string): EventSession | undefined {
  return event.days
    .flatMap((day) => day.sessions)
    .filter((session) => session.classification?.classes.includes(className))
    .sort((a, b) => a.startTime.localeCompare(b.startTime))
    .find((session) => sessionLabel(session) === label);
}

export interface ComebackRow {
  name: string;
  num: string;
  cls: string;
  /** Posición desde la que partió (prefinal, o quali si no hay prefinal). */
  fromPos: number;
  fromSession: string;
  toPos: number;
  toSession: string;
  /** Posiciones ganadas (positivo = remontó). */
  gained: number;
}

/**
 * Posiciones ganadas/perdidas en la final respecto a la sesión anterior
 * (prefinal, o quali si no hay prefinal).
 */
export function eventComebacks(event: EventData): ComebackRow[] {
  const rows: ComebackRow[] = [];
  const classes = eventClasses(event);

  for (const className of classes) {
    const final = sessionByLabel(event, className, "Final");
    const previous =
      sessionByLabel(event, className, "Prefinal") ?? sessionByLabel(event, className, "Clasificación") ??
      event.days
        .flatMap((day) => day.sessions)
        .filter(
          (session) =>
            session.type === "qualify" && session.classification?.classes.includes(className)
        )
        .sort((a, b) => a.startTime.localeCompare(b.startTime))[0];
    if (!final?.classification || !previous?.classification) continue;

    const previousPositions = new Map<string, { pos: number; label: string }>();
    for (const row of previous.classification.rows) {
      previousPositions.set(`${normalizeLoose(row.name)}|${normalizeLoose(row.cls)}`, {
        pos: row.posInClass,
        label: sessionLabel(previous),
      });
    }

    for (const row of final.classification.rows) {
      const before = previousPositions.get(`${normalizeLoose(row.name)}|${normalizeLoose(row.cls)}`);
      if (!before) continue;
      rows.push({
        name: row.name,
        num: row.num,
        cls: row.cls,
        fromPos: before.pos,
        fromSession: before.label,
        toPos: row.posInClass,
        toSession: sessionLabel(final),
        gained: before.pos - row.posInClass,
      });
    }
  }

  return rows.sort((a, b) => b.gained - a.gained);
}

export const normalizeLoose = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, " ")
    .trim()
    .toLowerCase();

export interface TrackRecord {
  cls: string;
  driver: string;
  time: string;
  sessionName: string;
  eventId: number;
  eventName: string;
  date: string;
}

/**
 * Récords de vuelta por categoría y circuito (sesiones oficiales: quali y
 * carreras; las prácticas no cuentan). Clave: `${slugCircuito}|${categoría}`.
 */
export function computeTrackRecords(events: EventData[]): Map<string, TrackRecord> {
  const records = new Map<string, TrackRecord>();

  for (const event of events) {
    if (!event.location) continue;
    const trackKey = slugify(event.location.name);
    for (const day of event.days) {
      for (const session of day.sessions) {
        if (session.type === "practice" || !session.classification) continue;
        for (const row of session.classification.rows) {
          // Filas sin tiempo real ('00.000' en eventos viejos) no cuentan.
          if (!row.bestTime || toSeconds(row.bestTime) <= 0) continue;
          if (!row.cls.trim()) continue;
          const clsKey = normalizeLoose(row.cls);
          const key = `${trackKey}|${clsKey}`;
          const current = records.get(key);
          if (!current || toSeconds(row.bestTime) < toSeconds(current.time)) {
            records.set(key, {
              cls: row.cls,
              driver: row.name,
              time: row.bestTime,
              sessionName: session.name,
              eventId: event.id,
              eventName: event.name,
              date: event.startDate,
            });
          }
        }
      }
    }
  }

  return records;
}

/** ¿Esta vuelta es el récord del circuito para su categoría? */
export function isTrackRecord(
  records: Map<string, TrackRecord>,
  locationName: string | undefined,
  cls: string,
  bestTime: string | undefined
): boolean {
  if (!locationName || !bestTime) return false;
  const record = records.get(`${slugify(locationName)}|${normalizeLoose(cls)}`);
  return Boolean(record && record.time === bestTime);
}

export function toSeconds(time: string): number {
  const parts = time.split(":");
  return parts.length === 2 ? Number(parts[0]) * 60 + Number(parts[1]) : Number(parts);
}
