/**
 * Importa eventos de SpeedHive (MyLaps) a datos estáticos del repo.
 *
 * API pública descubierta:
 *   GET https://eventresults-api.speedhive.com/v2/events/{id}
 *   GET .../v2/events/{id}/sessions
 *   GET .../v2/sessions/{sid}/classification
 *   GET .../v2/organizations/{orgId}/events?offset=N
 *
 * Uso:
 *   npm run import:event -- <id>            importa un evento
 *   npm run import:event -- --all-crkc      importa todos los CRKC pendientes
 *   npm run import:event -- --manifest      regenera manifest desde los JSON (sin red)
 *
 * Salida: src/data/events/<id>.json + src/data/events/manifest.json
 */
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "fs";
import { join } from "path";
import { REPO_ROOT } from "./lib/paths";

const API = "https://eventresults-api.speedhive.com/v2";
const ACEK_ORG = 46919;
const EVENTS_DIR = () => join(REPO_ROOT, "src", "data", "events");
const CONCURRENCY = 5;

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

export interface PointStandingRow {
  pos: number;
  num: string;
  name: string;
  cls: string;
  total: number;
  /** Puntos por sesión: [quali, prefinal, final]. */
  perRun: number[];
}

export interface PointStandings {
  /** Nombre de la sesión PointMerge (ej. "Kid Kart - Fecha 1"). */
  name: string;
  /** Sesiones fuente en orden (ej. Clasificacion, Prefinal, Final). */
  sessions: string[];
  rows: PointStandingRow[];
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
  /** Clasificaciones oficiales de puntos por fecha (PointMerge), si las tiene. */
  pointStandings?: PointStandings[];
  days: EventDay[];
}

export interface ManifestEventEntry {
  id: number;
  name: string;
  startDate: string;
  year: string;
  season: string | null;
  /** Números de fecha que cubre el evento (un evento puede cubrir 2: "3-4"). */
  fechas: number[];
  /** Pole (posInClass 1 de la quali) por categoría. */
  poles: Array<{ cls: string; driver: string }>;
  /** Mejor vuelta de la final por categoría (★ en las posiciones). */
  fastestLaps: Array<{ cls: string; driver: string }>;
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

interface RawPointRow {
  position?: number;
  name?: string;
  startNumber?: string;
  resultClass?: string;
  totalPoints?: number;
  pointsPerRun?: number[];
}

function slimPointRow(r: RawPointRow): PointStandingRow {
  return {
    pos: r.position ?? 0,
    num: r.startNumber ?? "",
    name: r.name ?? "",
    cls: r.resultClass ?? "",
    total: r.totalPoints ?? 0,
    perRun: r.pointsPerRun ?? [],
  };
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

async function mapLimit<T>(items: T[], limit: number, fn: (item: T) => Promise<void>): Promise<void> {
  let next = 0;
  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (next < items.length) {
      const index = next++;
      await fn(items[index]);
    }
  });
  await Promise.all(workers);
}

/** Importa un evento completo (evento + sesiones + clasificaciones) y escribe el JSON. */
async function importEventById(id: string): Promise<EventData> {
  const event = await getJson<RawEvent>(`${API}/events/${id}`);
  if (!event) throw new Error(`Evento ${id} no encontrado`);
  const sessionsTree = await getJson<RawSessions>(`${API}/events/${id}/sessions`);
  if (!sessionsTree) throw new Error(`Sesiones del evento ${id} no encontradas`);

  const days: EventDay[] = [];
  for (const group of sessionsTree.groups ?? []) collectSessions(group, days);
  const allSessions = days.flatMap((day) => day.sessions);
  const total = allSessions.length;

  let done = 0;
  let withResults = 0;
  const pointStandings: PointStandings[] = [];
  await mapLimit(allSessions, CONCURRENCY, async (session) => {
    try {
      const cls = await getJson<{
        type?: string;
        classes?: string[];
        sessionNames?: string[];
        bestLap?: Classification["bestLap"];
        rows?: Array<RawRow & Partial<RawPointRow>>;
      }>(`${API}/sessions/${session.id}/classification`, true);
      if (cls && (cls.rows?.length ?? 0) > 0) {
        withResults += 1;
        if (cls.type === "PointMerge") {
          // Clasificación oficial de puntos de la fecha: conservar valores.
          pointStandings.push({
            name: session.name,
            sessions: cls.sessionNames ?? [],
            rows: (cls.rows as RawPointRow[]).map(slimPointRow),
          });
          session.classification = {
            type: cls.type,
            classes: cls.classes ?? [],
            rows: (cls.rows as RawPointRow[]).map((row) => ({
              pos: row.position ?? 0,
              posInClass: row.position ?? 0,
              name: row.name ?? "",
              num: row.startNumber ?? "",
              cls: row.resultClass ?? "",
              status: "Normal",
            })),
          };
        } else {
          session.classification = {
            type: cls.type ?? session.type,
            classes: cls.classes ?? [],
            bestLap: cls.bestLap,
            rows: (cls.rows ?? []).map(slimRow),
          };
        }
      }
    } catch {
      // Una sesión sin resultados no tumbar la importación completa.
    }
    done += 1;
    process.stdout.write(`\r  clasificando ${done}/${total}   `);
  });
  process.stdout.write("\n");

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
    pointStandings: pointStandings.length > 0 ? pointStandings : undefined,
    days,
  };

  mkdirSync(EVENTS_DIR(), { recursive: true });
  writeFileSync(join(EVENTS_DIR(), `${id}.json`), JSON.stringify(data) + "\n", "utf8");
  console.log(`✓ ${withResults}/${total} sesiones con resultados → src/data/events/${id}.json`);
  return data;
}

const ROMAN_VALUES: Record<string, number> = {
  I: 1, II: 2, III: 3, IV: 4, V: 5, VI: 6, VII: 7, VIII: 8, IX: 9, X: 10,
};

function parseEventMapping(event: { name: string; startDate: string }): {
  year: string;
  season: string | null;
  fechas: number[];
} {
  const year = event.startDate.slice(0, 4);
  // Fallback por mes (calendario CRKC verificado contra los eventos con nombre
  // explícito: verano = ene-jun, invierno = jul-dic).
  const month = parseInt(event.startDate.slice(5, 7), 10);
  const season =
    event.name.match(/(invierno|verano)/i)?.[1].toLowerCase() ??
    (month <= 6 ? "verano" : "invierno");

  const withoutYear = event.name.replace(year, " ");
  let fechas = [
    ...new Set(
      [...withoutYear.matchAll(/\d+/g)]
        .map((match) => parseInt(match[0], 10))
        .filter((n) => n >= 1 && n <= 12)
    ),
  ];

  // Sin dígitos: números romanos ("I Fecha", "III y IV Fecha").
  if (fechas.length === 0) {
    fechas = [
      ...new Set(
        [...withoutYear.matchAll(/\b(I{1,3}|IV|V|VI{0,3}|VIII|IX|X)\b/g)]
          .map((match) => ROMAN_VALUES[match[0]])
          .filter((n): n is number => Boolean(n))
      ),
    ];
  }

  fechas = [...fechas].sort((a, b) => a - b);
  return { year, season, fechas };
}

function sessionLabelOf(name: string): string {
  const index = name.lastIndexOf(" - ");
  return index >= 0 ? name.slice(index + 3) : name;
}

/** Construye src/data/events/manifest.json desde los JSON importados (sin red). */
function rebuildManifest(): void {
  const eventsDir = EVENTS_DIR();
  const manifestPath = join(eventsDir, "manifest.json");
  const entries: ManifestEventEntry[] = [];

  for (const file of readdirSync(eventsDir)) {
    if (!/^\d+\.json$/.test(file)) continue;
    const data = JSON.parse(readFileSync(join(eventsDir, file), "utf8")) as EventData;
    const mapping = parseEventMapping(data);

    // Poles: posInClass 1 de cada quali (dedupe por categoría).
    // Mejor vuelta: menor bestTime de cada final, por categoría.
    const poles: ManifestEventEntry["poles"] = [];
    const fastestLaps: ManifestEventEntry["fastestLaps"] = [];
    const poleClasses = new Set<string>();
    const bestByClass = new Map<string, { driver: string; time: number }>();

    const toSeconds = (time?: string): number => {
      if (!time) return Infinity;
      const parts = time.split(":");
      return parts.length === 2
        ? Number(parts[0]) * 60 + Number(parts[1])
        : Number(parts[0]);
    };

    for (const day of data.days) {
      for (const session of day.sessions) {
        const cls = session.classification;
        if (!cls) continue;
        if (session.type === "qualify") {
          for (const row of cls.rows) {
            if (row.posInClass !== 1 || poleClasses.has(row.cls)) continue;
            poleClasses.add(row.cls);
            poles.push({ cls: row.cls, driver: row.name });
          }
        }
        if (session.type === "race" && sessionLabelOf(session.name) === "Final") {
          for (const row of cls.rows) {
            const time = toSeconds(row.bestTime);
            if (time <= 0) continue; // '00.000' = sin tiempo real
            const current = bestByClass.get(row.cls);
            if (!current || time < current.time) {
              bestByClass.set(row.cls, { driver: row.name, time });
            }
          }
        }
      }
    }
    for (const [cls, best] of bestByClass) {
      fastestLaps.push({ cls, driver: best.driver });
    }

    entries.push({
      id: data.id,
      name: data.name,
      startDate: data.startDate,
      ...mapping,
      poles,
      fastestLaps,
    });
  }

  entries.sort((a, b) => a.startDate.localeCompare(b.startDate) || a.id - b.id);

  // Conflictos: dos eventos reclaman la misma fecha (nombres erróneos en la
  // fuente). Gana el primero cronológico; el resto pierde ese enlace.
  const claimed = new Map<string, ManifestEventEntry>();
  const conflicts: string[] = [];
  for (const entry of entries) {
    entry.fechas = entry.fechas.filter((fecha) => {
      const key = `${entry.year}-${entry.season ?? "?"}-F${fecha}`;
      const owner = claimed.get(key);
      if (owner) {
        conflicts.push(`  ${key}: ${owner.id} ("${owner.name}") conserva, ${entry.id} ("${entry.name}") queda sin enlazar`);
        return false;
      }
      claimed.set(key, entry);
      return true;
    });
  }

  mkdirSync(eventsDir, { recursive: true });
  writeFileSync(manifestPath, JSON.stringify({ events: entries }) + "\n", "utf8");
  console.log(`✓ manifest: ${entries.length} eventos → src/data/events/manifest.json`);
  if (conflicts.length > 0) {
    console.log(`⚠ conflictos de fecha (revisar nombres en SpeedHive):`);
    conflicts.forEach((line) => console.log(line));
  }
}

interface OrgEvent {
  id: number;
  name: string;
  startDate: string;
}

async function fetchCrkcEvents(): Promise<OrgEvent[]> {
  const all: OrgEvent[] = [];
  for (const offset of [0, 100]) {
    const page = await getJson<OrgEvent[]>(`${API}/organizations/${ACEK_ORG}/events?offset=${offset}`, true);
    if (page) all.push(...page);
  }
  return all
    .filter((event) => /CRKC/i.test(event.name))
    .sort((a, b) => a.startDate.localeCompare(b.startDate) || a.id - b.id);
}

async function importAllCrkc(): Promise<void> {
  const events = await fetchCrkcEvents();
  const pending = events.filter(
    (event) => !existsSync(join(EVENTS_DIR(), `${event.id}.json`))
  );
  console.log(`Eventos CRKC: ${events.length} — pendientes: ${pending.length}`);

  let index = 0;
  for (const event of pending) {
    index += 1;
    console.log(`\n▶ [${index}/${pending.length}] ${event.id} · ${event.name} (${event.startDate})`);
    try {
      await importEventById(String(event.id));
    } catch (error) {
      console.error(`  ✗ falló: ${error instanceof Error ? error.message : error}`);
    }
  }

  rebuildManifest();
}

/**
 * Rescata las clasificaciones oficiales de puntos (PointMerge: totalPoints +
 * pointsPerRun) de los eventos ya importados — el slim original las tiraba.
 */
async function refreshPoints(): Promise<void> {
  const files = readdirSync(EVENTS_DIR()).filter((file) => /^\d+\.json$/.test(file));
  let updated = 0;
  let fetched = 0;

  for (const file of files) {
    const path = join(EVENTS_DIR(), file);
    const data = JSON.parse(readFileSync(path, "utf8")) as EventData;
    if (data.pointStandings && data.pointStandings.length > 0) continue;
    const pointSessions = data.days.flatMap((day) => day.sessions).filter((session) => session.type === "points");
    if (pointSessions.length === 0) continue;

    const standings: PointStandings[] = [];
    await mapLimit(pointSessions, CONCURRENCY, async (session) => {
      try {
        const cls = await getJson<{
          type?: string;
          classes?: string[];
          sessionNames?: string[];
          rows?: RawPointRow[];
        }>(`${API}/sessions/${session.id}/classification`, true);
        if (cls?.type === "PointMerge" && (cls.rows?.length ?? 0) > 0) {
          standings.push({
            name: session.name,
            sessions: cls.sessionNames ?? [],
            rows: (cls.rows ?? []).map(slimPointRow),
          });
        }
      } catch {
        // una sesión puntual no debe tumbar el refresh
      }
      fetched += 1;
    });

    if (standings.length > 0) {
      standings.sort((a, b) => a.name.localeCompare(b.name));
      data.pointStandings = standings;
      writeFileSync(path, JSON.stringify(data) + "\n", "utf8");
      updated += 1;
      console.log(`✓ ${file} → ${standings.length} clasificaciones de puntos`);
    }
  }
  console.log(`✓ pointStandings en ${updated} eventos (${fetched} sesiones consultadas)`);
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  if (args.includes("--refresh-points")) {
    await refreshPoints();
    rebuildManifest();
    return;
  }
  if (args.includes("--manifest")) {
    rebuildManifest();
    return;
  }
  if (args.includes("--all-crkc")) {
    await importAllCrkc();
    return;
  }

  const arg = args.find((a) => !a.startsWith("--"));
  if (!arg || !/^\d+$/.test(arg)) {
    console.error("Uso: npm run import:event -- <speedhive-event-id>");
    console.error("         npm run import:event -- --all-crkc   (todos los CRKC pendientes)");
    console.error("         npm run import:event -- --manifest    (regenera manifest sin red)");
    process.exit(1);
  }

  const data = await importEventById(arg);
  const kb = (Buffer.byteLength(JSON.stringify(data)) / 1024).toFixed(0);
  console.log(`(${kb} KB)`);
  rebuildManifest();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
