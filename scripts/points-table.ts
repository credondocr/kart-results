/**
 * Deriva la TABLA OFICIAL de puntos de SpeedHive (PointMerge: pointsPerRun)
 * y valida que reconstruya los totales oficiales.
 *
 *   npm run points-table
 *
 * Clave: (categoría, sesión, posición) → puntos. Las sesiones fuente se
 * asignan por orden cronológico (los eventos combinados repiten nombres).
 */
import { loadEvent, type EventData, type EventSession, type SlimRow } from "../src/app/utils/eventData";
import eventsManifest from "../src/data/events/manifest.json";

type Kind = "quali" | "prefinal" | "final";
const KINDS: Kind[] = ["quali", "prefinal", "final"];

/** classKey|kind → posición → valores observados */
type Table = Map<string, Map<number, Set<number>>>;

function kindOfSession(sessionName: string): Kind | null {
  const label = (sessionName.split(" - ").pop() ?? "").toLowerCase();
  if (label.includes("clasif")) return "quali";
  if (label.includes("prefinal")) return "prefinal";
  if (label === "final") return "final";
  return null;
}

const loose = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, " ")
    .trim()
    .toLowerCase();

function findRow(rows: SlimRow[], point: { num: string; name: string }): SlimRow | undefined {
  const byName = rows.find((r) => r.posInClass > 0 && loose(r.name) === loose(point.name));
  if (byName) return byName;
  if (!point.num) return undefined;
  return rows.find((r) => r.posInClass > 0 && r.num && String(r.num) === String(point.num));
}

interface AssignedMerge {
  points: NonNullable<EventData["pointStandings"]>[number];
  kinds: (Kind | null)[];
  sessions: (EventSession | undefined)[];
}

/** Asigna sesiones fuente a cada PointMerge por orden cronológico (nombres repetidos en eventos combinados). */
function assignSessions(event: EventData): AssignedMerge[] {
  const merges = (event.pointStandings ?? []).map((points) => {
    const session = event.days
      .flatMap((day) => day.sessions)
      .find((s) => s.type === "points" && s.name === points.name);
    return { points, startTime: session?.startTime ?? "" };
  });
  merges.sort((a, b) => a.startTime.localeCompare(b.startTime) || a.points.name.localeCompare(b.points.name));

  const used = new Set<number>();
  return merges.map(({ points }) => {
    const kinds = points.sessions.map(kindOfSession);
    const sessions = points.sessions.map((name) => {
      const candidate = event.days
        .flatMap((day) => day.sessions)
        .filter((s) => s.name === name && !used.has(s.id))
        .sort((a, b) => a.startTime.localeCompare(b.startTime))[0];
      if (candidate) used.add(candidate.id);
      return candidate;
    });
    return { points, kinds, sessions };
  });
}

function record(table: Table, classKey: string, kind: Kind, pos: number, value: number) {
  const key = `${classKey}|${kind}`;
  const byPos = table.get(key) ?? new Map<number, Set<number>>();
  const set = byPos.get(pos) ?? new Set<number>();
  set.add(value);
  byPos.set(pos, set);
  table.set(key, byPos);
}

function main(): void {
  const manifest = eventsManifest;

  const byYear = new Map<string, Table>();
  let processed = 0;

  for (const entry of manifest.events) {
    const event = loadEvent(String(entry.id));
    if (!event?.pointStandings?.length) continue;
    const year = event.startDate.slice(0, 4);
    const table = byYear.get(year) ?? new Map();
    byYear.set(year, table);

    for (const { points, kinds, sessions } of assignSessions(event)) {
      if (kinds.some((kind) => kind === null)) continue;
      points.rows.forEach((row) => {
        for (let i = 0; i < points.sessions.length; i++) {
          const kind = kinds[i]!;
          const session = sessions[i];
          if (!session?.classification) continue;
          const posRow = findRow(session.classification.rows, row);
          const value = row.perRun[i];
          if (!posRow || value === undefined || !Number.isFinite(value)) continue;
          record(table, loose(row.cls), kind, posRow.posInClass, value);
        }
      });
    }
    processed += 1;
  }

  console.log(`Eventos con PointMerge: ${processed}\n`);

  let conflicts = 0;
  for (const [year, table] of [...byYear.entries()].sort()) {
    const keys = [...table.keys()].sort();
    console.log(`===== ${year} — ${new Set(keys.map((k) => k.split("|")[0])).size} categorías =====`);
    // Resumen: conflictos por (categoría, sesión)
    let yearConflicts = 0;
    for (const key of keys) {
      for (const [pos, values] of table.get(key)!) {
        if (values.size > 1) {
          yearConflicts += 1;
          conflicts += 1;
          if (yearConflicts <= 4) {
            console.log(`  ⚠ ${key} pos${pos}: ${[...values].sort((a, b) => a - b).join("/")}`);
          }
        }
      }
    }
    if (yearConflicts === 0) console.log("  ✓ sin conflictos");
    else console.log(`  (total pares en conflicto: ${yearConflicts})`);

    // Mostrar la tabla de una categoría representativa (la con más datos)
    const sampleClass = keys.map((k) => k.split("|")[0]).sort((a, b) => keys.filter((k) => k.startsWith(a + "|")).length - keys.filter((k) => k.startsWith(b + "|")).length).pop();
    if (sampleClass) {
      for (const kind of KINDS) {
        const byPos = table.get(`${sampleClass}|${kind}`);
        if (!byPos) continue;
        const line = [...byPos.keys()]
          .sort((a, b) => a - b)
          .slice(0, 10)
          .map((pos) => {
            const values = [...byPos.get(pos)!].sort((a, b) => a - b);
            return values.length === 1 ? `${pos}:${values[0]}` : `${pos}:${values.join("/")}`;
          })
          .join("  ");
        console.log(`  ${sampleClass} ${kind.padEnd(9)} ${line}`);
      }
    }
  }

  // Validación exacta: reconstruir totalPoints
  console.log("\n===== Validación (totalPoints vs tabla) =====");
  for (const [year, table] of [...byYear.entries()].sort()) {
    let exact = 0;
    let total = 0;
    let sumAbs = 0;
    for (const entry of manifest.events) {
      const event = loadEvent(String(entry.id));
      if (!event?.pointStandings?.length) continue;
      if (event.startDate.slice(0, 4) !== year) continue;
      for (const { points, kinds, sessions } of assignSessions(event)) {
        if (kinds.some((kind) => kind === null)) continue;
        for (const row of points.rows) {
          let predicted = 0;
          let ok = true;
          for (let i = 0; i < points.sessions.length; i++) {
            const kind = kinds[i]!;
            const session = sessions[i];
            const posRow = session?.classification
              ? findRow(session.classification.rows, row)
              : undefined;
            const value = row.perRun[i];
            if (!posRow || value === undefined) {
              ok = false;
              break;
            }
            const options = table.get(`${loose(row.cls)}|${kind}`)?.get(posRow.posInClass);
            if (!options || options.size !== 1) {
              ok = false;
              break;
            }
            predicted += [...options][0];
          }
          if (!ok) continue;
          total += 1;
          const error = Math.abs(predicted - row.total);
          sumAbs += error;
          if (error < 0.001) exact += 1;
        }
      }
    }
    console.log(
      `${year}: ${total} filas | exacto ${total ? ((exact / total) * 100).toFixed(1) : "0"}% | MAE ${total ? (sumAbs / total).toFixed(4) : "—"}`
    );
  }

  console.log(
    conflicts === 0
      ? "\n✓ tabla consistente: cada (categoría, sesión, posición) tiene un único valor."
      : `\n⚠ ${conflicts} pares con valores distintos (revisar).`
  );
}

main();
