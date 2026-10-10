/**
 * Analiza el sistema de puntos del campeonato: ajusta un modelo lineal
 *   puntos(fecha) = x[quali][posición] + x[prefinal][posición] + x[final][posición]
 * con los datos que tenemos en AMBOS formatos (puntos R{n} de los PDFs +
 * posiciones por sesión de SpeedHive) y reporta la exactitud por año.
 *
 * Uso: npm run analyze:points
 */
import { loadAllEvents, loadEvent, sessionLabel, type EventData, type EventSession } from "../src/app/utils/eventData";
import eventsManifest from "../src/data/events/manifest.json";
import { Championships } from "../src/data/history";
import { normalizeName } from "../src/app/utils/pilotHistory";

const useField = process.argv.includes("--field");
const sessionArg = process.argv.find((a) => a.startsWith("--sessions="));
const SESSIONS = (
  sessionArg ? sessionArg.slice(10).split(",") : ["quali", "prefinal", "final"]
) as ["quali", "prefinal", "final"];
type SessionKind = (typeof SESSIONS)[number];

const POSITION_BUCKETS = 36; // 1..35 + 36 (agrupado)
const featureIndex = (kind: SessionKind, pos: number) =>
  SESSIONS.indexOf(kind) * POSITION_BUCKETS + Math.min(Math.max(pos, 0), POSITION_BUCKETS - 1);
const UNKNOWN = SESSIONS.length * POSITION_BUCKETS;

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

/** Sesiones de una categoría clasificadas por tipo, solo eventos de una fecha. */
function sessionsByKind(event: EventData, className: string): Record<SessionKind, EventSession[]> {
  const out: Record<SessionKind, EventSession[]> = { quali: [], prefinal: [], final: [] };
  for (const day of event.days) {
    for (const session of day.sessions) {
      if (!session.classification?.classes.includes(className)) continue;
      const label = sessionLabel(session).toLowerCase();
      if (session.type === "qualify") out.quali.push(session);
      else if (session.type === "race" && label.includes("prefinal")) out.prefinal.push(session);
      else if (session.type === "race" && label === "final") out.final.push(session);
    }
  }
  return out;
}

interface Sample {
  year: string;
  features: Array<{ kind: SessionKind; pos: number }>;
  target: number;
  label: string;
}

function collectSamples(): { samples: Sample[]; skipped: number } {
  const samples: Sample[] = [];
  let skipped = 0;

  for (const championship of Championships.years) {
    const year = String(championship.year);
    for (const season of ["invierno", "verano"] as const) {
      const leaderboard = championship[season];
      if (!leaderboard) continue;

      for (const cls of leaderboard.classes) {
        for (const category of cls.categories) {
          const categoryKey = loose(category.name || cls.title);

          category.results.forEach((result, resultIndex) => {
            const points = result.scores[resultIndex] ?? 0;
            // La muestra se arma por columna de fecha; buscamos el evento de esa fecha.
            result.scores.forEach((score, fechaIndex) => {
              if (score <= 0) return;
              const entry = eventsManifest.events.find(
                (event) =>
                  String(event.year) === year &&
                  event.season === season &&
                  event.fechas.includes(fechaIndex + 1)
              );
              if (!entry) return;
              const event = loadEvent(String(entry.id));
              if (!event) return;

              // Eventos combinados (2 fechas) no distinguibles por sesión: se omiten.
              if (entry.fechas.length > 1) return;

              const targetClass = eventClassesFor(event).find((name) =>
                matchesClass(name, categoryKey)
              );
              if (!targetClass) return;

              const sessions = sessionsByKind(event, targetClass);
              const findPos = (kind: SessionKind): number | null => {
                for (const session of sessions[kind]) {
                  const row = session.classification?.rows.find(
                    (r) =>
                      String(r.num) === String(result.number) ||
                      loose(r.name) === normalizeName(result.driver) ||
                      (normalizeName(r.name).startsWith(normalizeName(result.driver) + " ") &&
                        kind !== ("final" as SessionKind))
                  );
                  if (row) return useField ? row.pos : row.posInClass;
                }
                return null;
              };

              const finalPos = findPos("final");
              if (finalPos === null) {
                skipped += 1;
                return;
              }
              samples.push({
                year,
                features: [
                  { kind: "quali", pos: findPos("quali") ?? 0 },
                  { kind: "prefinal", pos: findPos("prefinal") ?? 0 },
                  { kind: "final", pos: finalPos },
                ],
                target: score,
                label: `${year} ${season} ${category.name || cls.title} R${fechaIndex + 1} ${result.driver}`,
              });
            });
          });
        }
      }
    }
  }
  return { samples, skipped };
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

/** Mínimos cuadrados con ridge: (AᵀA + λI) x = Aᵀb, eliminación gaussiana. */
function solve(samples: Sample[]): number[] {
  const n = UNKNOWN;
  const lambda = 1e-6;
  const A: number[][] = Array.from({ length: n }, () => new Array(n).fill(0));
  const rhs = new Array(n).fill(0);

  const active = (kind: SessionKind) => (SESSIONS as readonly string[]).includes(kind);
  for (const sample of samples) {
    const idx = sample.features.filter((f) => active(f.kind)).map((f) => featureIndex(f.kind, f.pos));
    if (idx.length === 0) continue;
    for (const i of idx) {
      for (const j of idx) A[i][j] += 1;
      rhs[i] += sample.target;
    }
  }
  for (let i = 0; i < n; i++) {
    A[i][i] += lambda;
  }

  // Eliminación gaussiana con pivoteo parcial (n ≈ 108, denso y rápido).
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

function main(): void {
  const { samples, skipped } = collectSamples();
  console.log(`Muestras: ${samples.length} (sin resultado en final: ${skipped})`);

  const byYear = new Map<string, Sample[]>();
  for (const sample of samples) {
    byYear.set(sample.year, [...(byYear.get(sample.year) ?? []), sample]);
  }

  for (const year of [...byYear.keys()].sort()) {
    const yearSamples = byYear.get(year)!;
    const x = solve(yearSamples);
    let exact = 0;
    let withinHalf = 0;
    let sumAbs = 0;
    const worst: Array<{ label: string; actual: number; predicted: number }> = [];

    for (const sample of yearSamples) {
      const predicted = sample.features
        .filter((f) => (SESSIONS as readonly string[]).includes(f.kind))
        .reduce((sum, f) => sum + x[featureIndex(f.kind, f.pos)], 0);
      const error = Math.abs(predicted - sample.target);
      sumAbs += error;
      if (error < 0.001) exact += 1;
      if (error <= 0.5) withinHalf += 1;
      if (error > 0.5) worst.push({ label: sample.label, actual: sample.target, predicted: Math.round(predicted * 100) / 100 });
    }

    const pct = (n: number) => ((n / yearSamples.length) * 100).toFixed(1) + "%";
    console.log(
      `\n${year}: ${yearSamples.length} muestras | exacto ${pct(exact)} | ±0.5 ${pct(withinHalf)} | MAE ${(sumAbs / yearSamples.length).toFixed(3)}`
    );

    // Coeficientes aprendidos por posición (para inspección).
    for (const kind of SESSIONS) {
      const row = Array.from({ length: 10 }, (_, i) => x[featureIndex(kind, i + 1)]);
      console.log(`  ${kind.padEnd(9)} pos1..10: ${row.map((v) => v.toFixed(1)).join(' ').padEnd(58)}`);
    }
    if (worst.length > 0) {
      console.log(`  peores errores (${worst.length} >0.5):`);
      worst
        .sort((a, b) => Math.abs(b.actual - b.predicted) - Math.abs(a.actual - a.predicted))
        .slice(0, 8)
        .forEach((w) => console.log(`    ${w.actual} ≠ ${w.predicted}  ${w.label}`));
    }
  }
}

main();
