/**
 * Importa un evento de SpeedHive (MyLaps) a datos estáticos del repo.
 *
 * API descubierta (pública):
 *   GET https://eventresults-api.speedhive.com/v2/events/{id}
 *   GET .../v2/events/{id}/sessions            (árbol días → sesiones)
 *   GET .../v2/sessions/{sid}/classification   (resultados de la sesión)
 *
 * Uso:  npm run import:event -- 3636519
 * Salida: src/data/events/<id>.json
 */
import { mkdirSync, writeFileSync } from "fs";
import { join } from "path";
import { REPO_ROOT } from "./lib/paths";

const API = "https://eventresults-api.speedhive.com/v2";

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

async function getJson<T>(url: string, allow404 = false): Promise<T | null> {
  const res = await fetch(url, { headers: { accept: "application/json" } });
  if (res.status === 404 && allow404) return null;
  if (!res.ok) throw new Error(`GET ${url} → ${res.status}`);
  return (await res.json()) as T;
}

function diffLabel(d?: { lapsBehind?: number; timeDifference?: string }): string | undefined {
  if (!d) return undefined;
  if (d.lapsBehind && d.lapsBehind > 0) return `${d.lapsBehind}v`;
  if (d.timeDifference && d.timeDifference !== "00.000") return d.timeDifference;
  return d.timeDifference;
}

interface RawRow {
  position?: number;
  positionInClass?: number;
  name?: string;
  startNumber?: string;
  resultClass?: string;
  status?: string;
  numberOfLaps?: number;
  totalTime?: string;
  bestTime?: string;
  bestLap?: number;
  bestSpeed?: number;
  difference?: { lapsBehind?: number; timeDifference?: string };
  gap?: { lapsBehind?: number; timeDifference?: string };
}

function slimRow(r: RawRow): SlimRow {
  return {
    pos: r.position ?? 0,
    posInClass: r.positionInClass ?? r.position ?? 0,
    name: r.name ?? "",
    num: r.startNumber ?? "",
    cls: r.resultClass ?? "",
    status: r.status ?? "",
    laps: r.numberOfLaps,
    total: r.totalTime,
    diff: diffLabel(r.difference),
    gap: diffLabel(r.gap),
    bestTime: r.bestTime,
    bestLap: r.bestLap,
    bestSpeed: r.bestSpeed,
  };
}

interface RawSession {
  id: number;
  name: string;
  type: string;
  startTime?: string;
  groupName?: string;
  resultStatus?: string;
}

interface RawSessions {
  groups?: Array<{
    name: string;
    date?: string;
    subGroups?: unknown[];
    sessions?: RawSession[];
  }>;
}

function collectSessions(group: NonNullable<RawSessions["groups"]>[number], out: EventDay[]): void {
  const day: EventDay = { name: group.name, date: group.date ?? "", sessions: [] };
  for (const session of group.sessions ?? []) {
    day.sessions.push({
      id: session.id,
      name: session.name,
      type: session.type,
      startTime: session.startTime ?? "",
      groupName: group.name,
      resultStatus: session.resultStatus ?? undefined,
      classification: null,
    });
  }
  out.push(day);
  for (const sub of group.subGroups ?? []) {
    collectSessions(sub as Parameters<typeof collectSessions>[0], out);
  }
}

interface RawEvent {
  id: number;
  name: string;
  startDate: string;
  updatedAt?: string;
  organization?: { name?: string; url?: string; country?: { alpha2?: string } };
  location?: { name?: string; lengthLabel?: string; country?: { alpha2?: string } };
  uploadSoftware?: { name?: string; version?: string };
}

async function main(): Promise<void> {
  const arg = process.argv.slice(2).find((a) => !a.startsWith("--"));
  if (!arg || !/^\d+$/.test(arg)) {
    console.error("Uso: npm run import:event -- <speedhive-event-id>");
    console.error("  (el id está en la URL: speedhive.mylaps.com/events/<id>)");
    process.exit(1);
  }
  const id = arg;

  const event = await getJson<RawEvent>(`${API}/events/${id}`);
  if (!event) throw new Error(`Evento ${id} no encontrado`);
  const sessionsTree = await getJson<RawSessions>(`${API}/events/${id}/sessions`);
  if (!sessionsTree) throw new Error(`Sesiones del evento ${id} no encontradas`);

  const days: EventDay[] = [];
  for (const group of sessionsTree.groups ?? []) collectSessions(group, days);
  const total = days.reduce((n, day) => n + day.sessions.length, 0);
  console.log(`Evento: ${event.name} — ${total} sesiones en ${days.length} día(s)`);

  let done = 0;
  let withResults = 0;
  for (const day of days) {
    for (const session of day.sessions) {
      done += 1;
      process.stdout.write(`\r  clasificando ${done}/${total}: ${session.name.slice(0, 50).padEnd(50)}`);
      try {
        const cls = await getJson<{
          type?: string;
          classes?: string[];
          bestLap?: Classification["bestLap"];
          rows?: RawRow[];
        }>(`${API}/sessions/${session.id}/classification`, true);
        if (cls && (cls.rows?.length ?? 0) > 0) {
          withResults += 1;
          session.classification = {
            type: cls.type ?? session.type,
            classes: cls.classes ?? [],
            bestLap: cls.bestLap,
            rows: (cls.rows ?? []).map(slimRow),
          };
        }
      } catch {
        // Una sesión sin resultados no debe tumbar la importación completa.
      }
    }
  }
  process.stdout.write("\r");

  const data: EventData = {
    id: event.id,
    name: event.name,
    startDate: event.startDate,
    updatedAt: event.updatedAt ?? "",
    sourceUrl: `https://speedhive.mylaps.com/events/${id}`,
    importedAt: new Date().toISOString(),
    organization: {
      name: event.organization?.name ?? "",
      url: event.organization?.url ?? undefined,
      country: event.organization?.country?.alpha2 ?? undefined,
    },
    location: event.location?.name
      ? {
          name: event.location.name,
          lengthLabel: event.location.lengthLabel,
          country: event.location.country?.alpha2,
        }
      : undefined,
    uploadSoftware: event.uploadSoftware?.name
      ? { name: event.uploadSoftware.name, version: event.uploadSoftware.version }
      : undefined,
    days,
  };

  const outDir = join(REPO_ROOT, "src", "data", "events");
  mkdirSync(outDir, { recursive: true });
  const outFile = join(outDir, `${id}.json`);
  writeFileSync(outFile, JSON.stringify(data) + "\n", "utf8");

  const kb = (Buffer.byteLength(JSON.stringify(data)) / 1024).toFixed(0);
  console.log(`✓ ${withResults}/${total} sesiones con resultados → src/data/events/${id}.json (${kb} KB)`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
