import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Breadcrumb from "@/app/components/Breadcrumb";
import LiveLeaderboard from "@/app/components/LiveLeaderboard";
import {
  fetchActiveSession,
  fetchLiveEventDetail,
  findLiveEvent,
  LIVE_EVENT_ID_RE,
  type LiveSession,
} from "@/app/utils/liveTiming";

export const revalidate = 5;

interface PageProps {
  params: Promise<{ eventId: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { eventId } = await params;
  if (!LIVE_EVENT_ID_RE.test(eventId)) {
    return { title: "En Vivo | Costa Rica Kart Championship" };
  }
  const detail = await fetchLiveEventDetail(eventId);
  return {
    title: `${detail?.n ?? "Evento"} (en vivo) | Costa Rica Kart Championship`,
    description: `Tiempos en vivo: ${detail?.n ?? "evento"}.`,
  };
}

function formatShortDate(dt?: string): string {
  if (!dt) return "";
  const [datePart] = dt.split(" ");
  const [d, m, y] = datePart.split("-");
  if (!d || !m || !y) return dt;
  return `${d}/${m}/${y}`;
}

function sessionStatus(session: LiveSession, activeId?: string): string {
  if (activeId && session.id === activeId) return "En curso";
  if (session.ls && session.ls > 0) return "Completada";
  return formatShortDate(session.stod);
}

export default async function LiveEventPage({ params }: PageProps) {
  const { eventId } = await params;
  if (!LIVE_EVENT_ID_RE.test(eventId)) notFound();

  const [detail, active, summary] = await Promise.all([
    fetchLiveEventDetail(eventId),
    fetchActiveSession(eventId),
    findLiveEvent(eventId),
  ]);

  if (!detail && !active) notFound();

  const sessions = [...(detail?.ss ?? [])].sort((a, b) =>
    (a.stod ?? "").localeCompare(b.stod ?? "")
  );
  const name = detail?.n ?? active?.eNam ?? "Evento en vivo";
  const track = detail?.t?.n;
  const country = detail?.l?.c;
  const temp = summary?.w?.t ?? detail?.w?.t;
  const video = summary?.vs;

  return (
    <div className="min-h-screen bg-[var(--ink-950)] pt-20">
      <div className="mx-auto max-w-5xl px-4 pb-16 sm:px-6 lg:px-8">
        <Breadcrumb />

        <div className="mt-2 flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.22em] text-red-400">
              <span className="relative inline-flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
              </span>
              En vivo
            </p>
            <h1 className="mt-1 font-display text-2xl font-black uppercase tracking-tight text-white sm:text-3xl">
              {name}
            </h1>
            <p className="mt-1 text-sm text-[var(--text-dim)]">
              {[track, country].filter(Boolean).join(" · ")}
              {typeof temp === "number" ? ` · ${temp.toFixed(1)}°C` : ""}
            </p>
          </div>
          {video ? (
            <a
              href={video.replace("/embed/", "/watch?v=").split("?")[0]}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg border border-[#4C8DFF]/50 px-4 py-2 text-xs font-bold uppercase tracking-[0.14em] text-[#4C8DFF] transition-colors hover:bg-[#4C8DFF]/10"
            >
              Ver transmisión
            </a>
          ) : null}
        </div>

        {sessions.length > 0 && (
          <section className="mt-6">
            <h2 className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--text-dim)]">
              Cronograma
            </h2>
            <ul className="mt-2 grid gap-2 sm:grid-cols-2">
              {sessions.map((session) => {
                const isLive = active?.id === session.id;
                return (
                  <li
                    key={session.id}
                    className={`flex items-center justify-between rounded-lg border px-3 py-2 text-sm ${
                      isLive
                        ? "border-red-500/60 bg-red-500/10"
                        : "border-[var(--line)] bg-[var(--surface-2)]/40"
                    }`}
                  >
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-white">
                        {session.rnNam ?? "Sesión"}
                        {session.gNam ? (
                          <span className="ml-2 text-xs font-bold text-[#4C8DFF]">
                            {session.gNam}
                          </span>
                        ) : null}
                      </p>
                    </div>
                    <span
                      className={`ml-3 shrink-0 font-mono text-xs tabular-nums ${
                        isLive
                          ? "font-bold text-red-400"
                          : "text-[var(--text-dim)]"
                      }`}
                    >
                      {sessionStatus(session, active?.id)}
                    </span>
                  </li>
                );
              })}
            </ul>
          </section>
        )}

        <div className="mt-8">
          <LiveLeaderboard
            key={active?.id ?? "no-session"}
            eventId={eventId}
            initialActive={active}
          />
        </div>

        <p className="mt-4 text-xs text-[var(--text-dim)]">
          Datos de live timing proporcionados por SpeedHive (MyLaps). Pueden
          haber retrasos de pocos segundos respecto al cronómetro oficial.
        </p>
      </div>
    </div>
  );
}
