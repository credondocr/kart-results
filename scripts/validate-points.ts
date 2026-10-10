/**
 * Valida los puntos del repo contra el ranking oficial (PointMerge) de
 * SpeedHive y ajusta el modelo de puntos SOLO con los grupos consistentes.
 *
 *   npm run validate:points
 *
 * Salida: (1) grupos donde el orden del repo contradice al oficial,
 *         (2) exactitud del modelo lineal por año sobre datos limpios.
 */
import {
  loadAllEvents,
  loadEvent,
  type EventData,
  type SlimRow,
} from "../src/app/utils/eventData";
import eventsManifest from "../src/data/events/manifest.json";
import { Championships } from "../src/data/history";
import { normalizeName } from "../src/app/utils/pilotHistory";

const loose = (value: string) =>
  normalizeName(value).replace(/[^a-z0-9]+/g, " ").trim();

const CLASS_ALIASES: Record<string, string[]> = { "mini t4": ["t4 tilly mini"] };

function matchesClass(eventClass: string, category: string): boolean {
  const eventKey = loose(eventClass);
  const categoryKey = loose(category);
  if (!eventKey || !categoryKey) return false;
  if (eventKey === categoryKey) return true;
  if (eventKey.startsWith(categoryKey + " ") || categoryKey.startsWith(eventKey + " ")) return true;
  return (CLASS_ALIASES[categoryKey] ?? []).some((alias) => loose(alias) === eventKey);
}

/** Ranking oficial de una fecha (sesiones tipo 'points' / PointMerge). */
function officialOrder(event: EventData, className: string): SlimRow[] {
  for (const day of event.days) {
    for (const session of day.sessions) {
      if (session.type !== "points") continue;
      const clsNames = session.classification?.classes ?? [];
      const hit = clsNames.some((name) => matchesClass(className, name) || matchesClass(name, className));
      if (process.env.PDEBUG) console.error(`[official] className=${className} sesión=${session.name} classes=${JSON.stringify(clsNames)} hit=${hit} rows=${session.classification?.rows.length ?? 'sin clasif'}`);
      if (!hit || !session.classification) continue;
      return [...session.classification.rows].sort((a, b) => a.pos - b.pos);
    }
  }
  return [];
}

interface GroupReport {
  year: string;
  season: string;
  category: string;
  fecha: number;
  agreement: number;
  officialTop: string[];
  repoTop: string[];
  sample: Sample[];
  event: string;
}

interface Sample {
  year: string;
  features: Array<{ quali: number; prefinal: number; final: number }>;
  target: number;
  label: string;
}

/** Concordancia de orden (pares) entre repo y oficial sobre pilotos comunes. */
function orderAgreement(repoOrder: string[], officialOrderList: string[]): number {
  const officialRank = new Map<string, number>();
  officialOrderList.forEach((name, index) => officialRank.set(name, index));
  const shared = repoOrder.filter((name) => officialRank.has(name));
  if (shared.length < 2) return 1; // sin datos suficientes: no juzgar
  let pairs = 0;
  let agreements = 0;
  for (let i = 0; i < shared.length; i++) {
    for (let j = i + 1; j < shared.length; j++) {
      pairs += 1;
      if (officialRank.get(shared[i])! < officialRank.get(shared[j])!) agreements += 1;
    }
  }
  return pairs === 0 ? 1 : agreements / pairs;
}

function main(): void {
  const groups: GroupReport[] = [];
  const cleanSamplesByYear = new Map<string, Sample[]>();

  for (const championship of Championships.years) {
    const year = String(championship.year);
    for (const season of ["invierno", "verano"] as const) {
      const leaderboard = championship[season];
      if (!leaderboard) continue;

      for (const cls of leaderboard.classes) {
        for (const category of cls.categories) {
          const categoryKey = loose(category.name || cls.title);

          category.results.forEach((result) => {
            result.scores.forEach((score, fechaIndex) => {
              if (score <= 0) return;
              const entry = eventsManifest.events.find(
                (ev) =>
                  String(ev.year) === year &&
                  ev.season === season &&
                  ev.fechas.includes(fechaIndex + 1)
              );
              if (!entry) return;
              if (entry.fechas.length > 1) return;
              const event = loadEvent(String(entry.id));
              if (!event) return;

              const targetClass = eventClassesFor(event).find((name) =>
                matchesClass(name, categoryKey)
              );
              if (!targetClass) return;

              const official = officialOrder(event, targetClass);
              if (official.length === 0) return;

              const repoOrder = [...category.results]
                .sort((a, b) => (b.scores[fechaIndex] ?? 0) - (a.scores[fechaIndex] ?? 0))
                .map((r) => loose(r.driver));

              const agreement = orderAgreement(
                repoOrder,
                official.map((row) => loose(row.name))
              );

              const report: GroupReport = {
                year,
                season,
                category: category.name || cls.title,
                fecha: fechaIndex + 1,
                agreement,
                officialTop: official.slice(0, 3).map((row) => row.name),
                repoTop: repoOrder.slice(0, 3),
                sample: [],
                event: event.name,
              };
              groups.push(report);

              // Muestras de posiciones para el modelo (solo grupos consistentes).
              if (agreement < 0.95) return;
              const sessions = sessionsByKind(event, targetClass);
              const findPos = (kind: "quali" | "prefinal" | "final"): number | null => {
                for (const session of sessions[kind]) {
                  const row = session.classification?.rows.find(
                    (r) => String(r.num) === String(result.number) || loose(r.name) === normalizeName(result.driver)
                  );
                  if (row) return row.posInClass;
                }
                return null;
              };
              const finalPos = findPos("final");
              if (finalPos === null) return;
              const samples = cleanSamplesByYear.get(year) ?? [];
              samples.push({
                year,
                features: [
                  { quali: findPos("quali") ?? 0, prefinal: findPos("prefinal") ?? 0, final: finalPos },
                ],
                target: score,
                label: `${year} ${season} ${category.name || cls.title} R${fechaIndex + 1} ${result.driver}`,
              });
              cleanSamplesByYear.set(year, samples);
            });
          });
        }
      }
    }
  }

  // ---- Reporte de inconsistencias ----
  const bad = groups.filter((g) => g.agreement < 0.95);
  const total = groups.length;
  console.log(`Grupos (año·temporada·categoría·fecha): ${total}`);
  console.log(`Coinciden con SpeedHive: ${total - bad.length} (${(((total - bad.length) / total) * 100).toFixed(1)}%)`);
  console.log(`Difieren: ${bad.length}`);
  console.log(`Nota: SpeedHive publica las posiciones SIN penalizaciones; el campeonato`);
  console.log(`aplica las penalizaciones en los puntos — una diferencia puede ser una\npenalización real y no un error de datos.\n`);

  const byKey = new Map<string, GroupReport[]>();
  for (const group of bad) {
    const key = `${group.year} ${group.season} ${group.category}`;
    byKey.set(key, [...(byKey.get(key) ?? []), group]);
  }
  for (const [key, list] of [...byKey.entries()].sort()) {
    console.log(`⚠ ${key} (¿penalización aplicada en el campeonato?)`);
    for (const group of list) {
      console.log(`    R${group.fecha} (agree ${(group.agreement * 100).toFixed(0)}%) — oficial: ${group.officialTop.join(" / ")} | repo: ${group.repoTop.join(" / ")}`);
    }
  }

  // ---- Modelo sobre datos limpios ----
  console.log("\n=== Modelo ajustado solo con grupos consistentes ===");
  for (const [year, samples] of [...cleanSamplesByYear.entries()].sort()) {
    const x = solve(samples.map((s) => ({
      year: s.year,
      features: [
        { kind: "quali" as const, pos: s.features[0].quali },
        { kind: "prefinal" as const, pos: s.features[0].prefinal },
        { kind: "final" as const, pos: s.features[0].final },
      ],
      target: s.target,
      label: s.label,
    })));
    let exact = 0;
    let withinHalf = 0;
    let sumAbs = 0;
    for (const sample of samples) {
      const predicted =
        x[featureIndex("quali", sample.features[0].quali)] +
        x[featureIndex("prefinal", sample.features[0].prefinal)] +
        x[featureIndex("final", sample.features[0].final)];
      const error = Math.abs(predicted - sample.target);
      sumAbs += error;
      if (error < 0.001) exact += 1;
      if (error <= 0.5) withinHalf += 1;
    }
    const pct = (n: number) => ((n / samples.length) * 100).toFixed(1) + "%";
    console.log(
      `${year}: ${samples.length} limpias | exacto ${pct(exact)} | ±0.5 ${pct(withinHalf)} | MAE ${(sumAbs / samples.length).toFixed(3)}`
    );
    if (samples.length < 60) console.log("  (muestra pequeña: resultado orientativo)");
  }
}

function eventClassesFor(event: EventData): string[] {
  const set = new Set<string>();
  for (const day of event.days) {
    for (const session of day.sessions) {
      for (const cls of session.classification?.classes ?? []) set.add(cls);
    }
  }
  return [...set];
}

type SessionKind = "quali" | "prefinal" | "final";
const POSITION_BUCKETS = 36;
const featureIndex = (kind: SessionKind, pos: number) =>
  (["quali", "prefinal", "final"] as const).indexOf(kind) * POSITION_BUCKETS +
  Math.min(Math.max(pos, 0), POSITION_BUCKETS - 1);
const UNKNOWN = 3 * POSITION_BUCKETS;

function sessionsByKind(event: EventData, className: string): Record<SessionKind, EventData["days"][number]["sessions"]> {
  const out = { quali: [], prefinal: [], final: [] } as Record<SessionKind, EventData["days"][number]["sessions"]>;
  for (const day of event.days) {
    for (const session of day.sessions) {
      if (!session.classification?.classes.includes(className)) continue;
      const label = (session.name.split(" - ").pop() ?? "").toLowerCase();
      if (session.type === "qualify") out.quali.push(session);
      else if (session.type === "race" && label.includes("prefinal")) out.prefinal.push(session);
      else if (session.type === "race" && label === "final") out.final.push(session);
    }
  }
  return out;
}

interface SolveSample {
  features: Array<{ kind: SessionKind; pos: number }>;
  target: number;
}

function solve(samples: SolveSample[]): number[] {
  const n = UNKNOWN;
  const lambda = 1e-6;
  const A: number[][] = Array.from({ length: n }, () => new Array(n).fill(0));
  const rhs = new Array(n).fill(0);

  for (const sample of samples) {
    const idx = sample.features.map((f) => featureIndex(f.kind, f.pos));
    for (const i of idx) {
      for (const j of idx) A[i][j] += 1;
      rhs[i] += sample.target;
    }
  }
  for (let i = 0; i < n; i++) A[i][i] += lambda;

  for (let col = 0; col < n; col++) {
    let pivot = col;
    for (let row = col + 1; row < n; row++) {
      if (Math.abs(A[row][col]) > Math.abs(A[pivot][col])) pivot = row;
    }
    [A[col], A[pivot]] = [A[pivot], A[col]];
    [rhs[col], rhs[pivot]] = [rhs[pivot], rhs[col]];
    const pivotValue = A[col][col] || 1e-12;
    for (let row = col + 1; row < n; row++) {
      const factor = A[row][col] / pivotValue;
      if (factor === 0) continue;
      for (let k = col; k < n; k++) A[row][k] -= factor * A[col][k];
      rhs[row] -= factor * rhs[col];
    }
  }

  const x = new Array(n).fill(0);
  for (let row = n - 1; row >= 0; row--) {
    let sum = rhs[row];
    for (let col = row + 1; col < n; col++) sum -= A[row][col] * x[col];
    x[row] = sum / (A[row][row] || 1e-12);
  }
  return x;
}

main();
