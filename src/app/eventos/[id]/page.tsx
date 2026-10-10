import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  loadEvent,
  eventClasses,
  sessionsForClass,
  sessionLabel,
  sessionTime,
  formatDate,
  TYPE_LABELS,
  seasonLinkFromEvent,
  loadAllEvents,
  computeTrackRecords,
  isTrackRecord,
  eventComebacks,
  normalizeLoose,
  slugify,
  type EventSession,
} from "@/app/utils/eventData";
import { findPilotProfile, pilotLinkHref } from "@/app/utils/pilotLinks";
import Breadcrumb from "@/app/components/Breadcrumb";

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ c?: string | string[]; s?: string | string[] }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const event = loadEvent(id);
  if (!event) return { title: "Evento | Costa Rica Kart Championship" };
  return {
    title: `${event.name} | Costa Rica Kart Championship`,
    description: `Resultados de ${event.name} — ${event.location?.name ?? ""} ${event.location?.lengthLabel ?? ""}`.trim(),
  };
}

const first = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value[0] : value;

export default async function EventPage({ params, searchParams }: PageProps) {
  const { id } = await params;
  const sp = (await searchParams) ?? {};
  const event = loadEvent(id);
  if (!event) notFound();

  const classes = eventClasses(event);
  const requestedClass = (first(sp.c) ?? "").toLowerCase();
  const matchedClass = classes.find((cls) => cls.toLowerCase() === requestedClass);
  const activeClass = matchedClass ?? classes[0] ?? "";
  const classSessions = sessionsForClass(event, activeClass);
  // El label exacto evita confundir "Prefinal" con "Final".
  const defaultSession =
    classSessions.find((session) => sessionLabel(session) === "Final") ??
    classSessions[classSessions.length - 1];
  const activeSession: EventSession | undefined =
    classSessions.find((session) => String(session.id) === first(sp.s)) ?? defaultSession;

  const rows = (activeSession?.classification?.rows ?? []).filter(
    (row) => !activeClass || row.cls === activeClass
  );
  const isRace = activeSession?.classification?.type === "Race";
  const hasStatusColumn = rows.some((row) => row.status && row.status !== "Normal");
  const seasonLink = seasonLinkFromEvent(event);
  const sessionBest = activeSession?.classification?.bestLap;

  // Récords del circuito (todas las temporadas) y remontadas de este evento.
  const trackRecords = computeTrackRecords(loadAllEvents());
  const comebacks = new Map<string, { from: number; gained: number }>();
  for (const row of eventComebacks(event)) {
    comebacks.set(`${normalizeLoose(row.name)}|${normalizeLoose(row.cls)}`, {
      from: row.fromPos,
      gained: row.gained,
    });
  }

  const href = (cls: string, sessionId?: number) =>
    `?c=${encodeURIComponent(cls)}${sessionId ? `&s=${sessionId}` : ""}`;

  // Línea de tiempo de la categoría: sus sesiones en orden, con separador de día.
  const timeline: Array<{ kind: "day"; label: string; key: string } | { kind: "session"; session: EventSession; key: string }> = [];
  let lastDay = "";
  for (const session of classSessions) {
    if (session.groupName !== lastDay) {
      timeline.push({ kind: "day", label: session.groupName, key: `day-${session.groupName}` });
      lastDay = session.groupName;
    }
    timeline.push({ kind: "session", session, key: `s-${session.id}` });
  }

  // Días y sesiones ordenados por startTime real; la fecha del grupo del API
  // a veces es incorrecta, así que se deriva de la primera sesión del día.
  const fullSchedule = event.days
    .map((day) => {
      const ordered = [...day.sessions].sort((a, b) =>
        a.startTime.localeCompare(b.startTime)
      );
      return {
        ...day,
        date: ordered[0]?.startTime.slice(0, 10) || day.date,
        sessions: ordered,
      };
    })
    .filter((day) => day.sessions.length > 0)
    .sort((a, b) => a.date.localeCompare(b.date));

  return (
    <div className="max-w-6xl mx-auto px-4 pt-24 pb-16">
      <Breadcrumb />

      <p className="season-eyebrow">
        {event.organization.name}
        {event.location && (
          <>
            {" · "}
            <Link href={`/circuito/${slugify(event.location.name)}`} className="crumb">
              <strong>
                {event.location.name}
                {event.location.lengthLabel ? ` · ${event.location.lengthLabel}` : ""}
              </strong>
            </Link>
          </>
        )}
        {" · "}
        {formatDate(event.startDate)}
      </p>
      <h1 className="class-title my-4 text-3xl md:text-5xl">{event.name}</h1>

      <div className="event-actions">
        {seasonLink && (
          <Link href={seasonLink.href} className="share-btn">
            {seasonLink.label} — ver posiciones
          </Link>
        )}
        <a
          href={event.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="share-btn"
        >
          Ver en SpeedHive ↗
        </a>
      </div>

      {/* Selector de categoría */}
      <div className="tabs-container" role="group" aria-label="Categorías">
        {classes.map((cls) => (
          <Link
            key={cls}
            href={href(cls)}
            className={cls === activeClass ? "tab-button active" : "tab-button"}
            aria-pressed={cls === activeClass}
          >
            {cls}
          </Link>
        ))}
      </div>

      {/* Línea de tiempo de la categoría (su fin de semana) */}
      <div className="event-timeline" role="group" aria-label={`Sesiones de ${activeClass}`}>
        {timeline.map((step) =>
          step.kind === "day" ? (
            <div key={step.key} className="timeline-day">
              {step.label}
            </div>
          ) : (
            <a
              key={step.key}
              href={href(activeClass, step.session.id)}
              className={
                activeSession?.id === step.session.id
                  ? "timeline-step active"
                  : "timeline-step"
              }
              aria-current={activeSession?.id === step.session.id ? "true" : undefined}
            >
              <span className="step-when">
                {step.session.groupName.slice(0, 3)} {sessionTime(step.session)}
              </span>
              <span className={`session-badge type-${step.session.type}`}>
                {TYPE_LABELS[step.session.type] ?? step.session.type}
              </span>
              <span className="step-name">{sessionLabel(step.session)}</span>
            </a>
          )
        )}
      </div>

      {/* Resultados */}
      {activeSession ? (
        <>
          <h2 className="stats-heading">
            {activeSession.name}
            <span className="heading-count">{rows.length} pilotos</span>
          </h2>

          {rows.length === 0 ? (
            <p className="empty-state">Sin resultados para esta sesión.</p>
          ) : (
            <div className="table-container">
              <div className="table-wrapper">
                <table className="event-results-table">
                  <thead>
                    <tr>
                      <th className="position sticky-col">Po</th>
                      <th className="race-number sticky-col sticky-num">Nº</th>
                      <th className="text-left driver-info">Piloto</th>
                      {isRace ? (
                        <>
                          <th className="text-right">Total</th>
                          <th className="text-right">Diferencia</th>
                          <th className="text-right" title="Posiciones ganadas en la final vs la prefinal">Δ Pre→Fin</th>
                        </>
                      ) : (
                        <>
                          <th className="text-right">Gap</th>
                        </>
                      )}
                      <th className="text-right">Mejor vuelta</th>
                      <th>Vuelta</th>
                      <th className="text-right">Vel (km/h)</th>
                      <th>Vueltas</th>
                      {hasStatusColumn && <th>Estado</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row, index) => {
                      const profile = findPilotProfile(row.name, row.num, "");
                      const isSessionBest =
                        sessionBest &&
                        row.name === sessionBest.name &&
                        row.bestTime === sessionBest.lapTime;
                      const isRecord = isTrackRecord(
                        trackRecords,
                        event.location?.name,
                        row.cls,
                        row.bestTime
                      );
                      const comeback = comebacks.get(
                        `${normalizeLoose(row.name)}|${normalizeLoose(row.cls)}`
                      );
                      const podium = index < 3 && row.posInClass <= 3 ? ` podium-${row.posInClass}` : "";
                      return (
                        <tr
                          key={`${row.posInClass}-${row.num}-${index}`}
                          className={podium.trim()}
                          style={{ "--row": index } as React.CSSProperties}
                        >
                          <td className="position sticky-col">
                            <span className="rank-chip">{row.posInClass}</span>
                          </td>
                          <td className="race-number sticky-col sticky-num">{row.num}</td>
                          <td className="driver-info" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            {profile ? (
                              <Link href={pilotLinkHref(profile)} className="driver-link">
                                {row.name}
                              </Link>
                            ) : (
                              <span className="driver-name">{row.name}</span>
                            )}
                          </td>
                          {isRace ? (
                            <>
                              <td className="text-right points-cell">{row.total ?? "—"}</td>
                              <td className="text-right race-points">{row.diff ?? "—"}</td>
                              <td className="text-right race-points">
                                {comeback ? (
                                  <span
                                    className={
                                      comeback.gained > 0
                                        ? "delta-up"
                                        : comeback.gained < 0
                                          ? "delta-down"
                                          : "delta-flat"
                                    }
                                    title={`Desde ${comeback.from}º en la prefinal`}
                                  >
                                    {comeback.gained > 0 ? `+${comeback.gained}` : comeback.gained < 0 ? `−${Math.abs(comeback.gained)}` : "—"}
                                  </span>
                                ) : (
                                  "—"
                                )}
                              </td>
                            </>
                          ) : (
                            <td className="text-right race-points">{row.gap ?? "—"}</td>
                          )}
                          <td className={isSessionBest || isRecord ? "text-right points-cell" : "text-right race-points"}>
                            {row.bestTime ?? "—"}
                            {isRecord && <span className="record-badge" title="Récord histórico del circuito">Récord</span>}
                            {isSessionBest && <span className="best-lap-star"> ★</span>}
                          </td>
                          <td className="race-points">{row.bestLap ?? "—"}</td>
                          <td className="text-right race-points">{row.bestSpeed ?? "—"}</td>
                          <td className="race-points">{row.laps ?? "—"}</td>
                          {hasStatusColumn && (
                            <td className={row.status === "Normal" ? "race-points" : "race-points status-bad"}>
                              {row.status === "Normal" ? "OK" : row.status}
                            </td>
                          )}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      ) : (
        <p className="empty-state">Esta categoría no tiene sesiones en el evento.</p>
      )}

      {/* Cronograma completo (colapsado) */}
      {fullSchedule.length > 0 && (
        <details className="event-details">
          <summary>Cronograma completo del fin de semana</summary>
          <div className="event-schedule">
            {fullSchedule.map((day) => (
              <div key={`${day.name}-${day.date}`} className="schedule-day">
                <div className="schedule-day-name">
                  {day.name} <span>{formatDate(day.date)}</span>
                </div>
                <div className="schedule-chips">
                  {day.sessions.map((session) => {
                    const sessionClass = session.classification?.classes[0] ?? activeClass;
                    return (
                      <a
                        key={session.id}
                        className={
                          activeSession?.id === session.id ? "schedule-chip active" : "schedule-chip"
                        }
                        href={href(sessionClass, session.id)}
                      >
                        <span className="chip-time">{sessionTime(session)}</span>
                        <span className="chip-name">{session.name}</span>
                        <span className={`session-badge type-${session.type}`}>
                          {TYPE_LABELS[session.type] ?? session.type}
                        </span>
                      </a>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </details>
      )}
    </div>
  );
}
