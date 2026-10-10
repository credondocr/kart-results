import type { Metadata } from "next";
import Link from "next/link";
import Breadcrumb from "@/app/components/Breadcrumb";
import {
  fetchLiveFeed,
  isCrRelevant,
  type LiveEventSummary,
} from "@/app/utils/liveTiming";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "En Vivo | Costa Rica Kart Championship",
  description:
    "Tiempos en vivo de las carreras del Costa Rica Kart Championship.",
};

function formatFeedDate(dt?: string): string {
  if (!dt) return "";
  const [datePart] = dt.split(" ");
  const [d, m, y] = datePart.split("-");
  if (!d || !m || !y) return dt;
  return `${d}/${m}/${y}`;
}

function LiveEventCard({ event }: { event: LiveEventSummary }) {
  const track = event.t?.n;
  const country = event.l?.c;
  const temp = event.w?.t;
  return (
    <Link
      href={`/en-vivo/${event.id}`}
      className="group block rounded-xl border border-[var(--line)] bg-[var(--surface-2)]/50 p-5 transition-colors hover:border-[#4C8DFF]/60 hover:bg-[var(--surface-2)]"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-red-400">
            En vivo · {formatFeedDate(event.dt)}
          </p>
          <h3 className="mt-1 truncate font-display text-lg font-extrabold uppercase tracking-tight text-white group-hover:text-[#4C8DFF]">
            {event.n?.trim() || "Evento"}
          </h3>
          <p className="mt-1 text-sm text-[var(--text-dim)]">
            {[track, country].filter(Boolean).join(" · ") || "Circuito"}
          </p>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1 text-right">
          {typeof temp === "number" ? (
            <span className="rounded-md border border-[var(--line)] px-2 py-1 font-mono text-xs tabular-nums text-white">
              {temp.toFixed(1)}°C
            </span>
          ) : null}
          {event.vs ? (
            <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#4C8DFF]">
              Transmisión
            </span>
          ) : null}
        </div>
      </div>
    </Link>
  );
}

export default async function EnVivoPage() {
  const feed = await fetchLiveFeed();
  const crEvents = feed.filter(isCrRelevant);

  return (
    <div className="min-h-screen bg-[var(--ink-950)] pt-20">
      <div className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <Breadcrumb />

        <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-red-400">
              Live timing
            </p>
            <h1 className="mt-1 font-display text-3xl font-black uppercase tracking-tight text-white sm:text-4xl">
              En vivo
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-[var(--text-dim)]">
              Tiempos en vivo desde la plataforma de SpeedHive. Los datos se
              actualizan automáticamente mientras las sesiones están en curso.
            </p>
          </div>
          <p className="font-mono text-sm tabular-nums text-[var(--text-dim)]">
            {crEvents.length} en vivo ahora
          </p>
        </div>

        <section className="mt-8">
          <h2 className="text-xs font-bold uppercase tracking-[0.18em] text-white">
            Costa Rica
          </h2>
          {crEvents.length === 0 ? (
            <p className="mt-3 rounded-xl border border-[var(--line)] bg-[var(--surface-2)]/40 px-4 py-6 text-sm text-[var(--text-dim)]">
              No hay carreras de Costa Rica en vivo ahora mismo. Cuando el
              CRKC esté en pista, aparecerán aquí con tiempos por vuelta.
            </p>
          ) : (
            <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {crEvents.map((event) => (
                <LiveEventCard key={event.id} event={event} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
