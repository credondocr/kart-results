import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  loadAllEvents,
  computeTrackRecords,
  slugify,
  formatDate,
} from "@/app/utils/eventData";
import eventsManifest from "@/data/events/manifest.json";
import Breadcrumb from "@/app/components/Breadcrumb";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const event = loadAllEvents().find((e) => e.location && slugify(e.location.name) === slug);
  if (!event?.location) return { title: "Circuito | Costa Rica Kart Championship" };
  return {
    title: `${event.location.name} | Costa Rica Kart Championship`,
    description: `Historial de eventos y récords de vuelta en ${event.location.name}.`,
  };
}

export default async function CircuitPage({ params }: PageProps) {
  const { slug } = await params;

  const all = loadAllEvents();
  const events = all
    .filter((event) => event.location && slugify(event.location.name) === slug)
    .sort((a, b) => b.startDate.localeCompare(a.startDate));
  if (events.length === 0) notFound();

  const location = events[0].location!;
  const manifestById = new Map(eventsManifest.events.map((entry) => [entry.id, entry]));
  const records = [...computeTrackRecords(all).entries()]
    .filter(([key]) => key.split("|")[0] === slug)
    .map(([, record]) => record)
    .sort((a, b) => a.cls.localeCompare(b.cls));

  const years = [...new Set(events.map((event) => event.startDate.slice(0, 4)))].sort(
    (a, b) => b.localeCompare(a)
  );

  return (
    <div className="max-w-6xl mx-auto px-4 pt-24 pb-16">
      <Breadcrumb />
      <p className="season-eyebrow">
        {location.country}
        {location.lengthLabel && <> · <strong>{location.lengthLabel}</strong></>}
        {" · "}
        {events.length} {events.length === 1 ? "evento" : "eventos"} · {years[years.length - 1]}–{years[0]}
      </p>
      <h1 className="class-title my-4 text-3xl md:text-5xl">{location.name}</h1>

      {/* Récords de vuelta del circuito */}
      <section className="stats-section" aria-label="Récords de vuelta">
        <h2 className="stats-heading">
          Récords de vuelta
          <span className="heading-count">{records.length}</span>
        </h2>
        {records.length > 0 && (
          <div className="table-container">
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th className="text-left">Categoría</th>
                    <th className="text-right">Récord</th>
                    <th className="player-cell">Piloto</th>
                    <th>Evento</th>
                    <th>Fecha</th>
                  </tr>
                </thead>
                <tbody>
                  {records.map((record, index) => (
                    <tr key={record.cls} style={{ "--row": index } as React.CSSProperties}>
                      <td className="text-left race-points">{record.cls}</td>
                      <td className="text-right points-cell">{record.time}</td>
                      <td className="player-cell">
                        <span className="player-cell-text">{record.driver}</span>
                      </td>
                      <td className="race-points">
                        <Link href={`/eventos/${record.eventId}`} className="driver-link">
                          {record.eventName}
                        </Link>
                      </td>
                      <td className="race-points">{formatDate(record.date)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>

      {/* Eventos celebrados */}
      <section className="stats-section" aria-label="Eventos celebrados">
        <h2 className="stats-heading">
          Eventos celebrados
          <span className="heading-count">{events.length}</span>
        </h2>
        <div className="events-list">
          {events.map((event) => {
            const manifest = manifestById.get(event.id);
            const raceSessions = event.days.reduce(
              (count, day) =>
                count + day.sessions.filter((session) => session.type !== "practice").length,
              0
            );
            return (
              <Link key={event.id} href={`/eventos/${event.id}`} className="event-row">
                <span className="event-row-date">{formatDate(event.startDate)}</span>
                <span className="event-row-name">{event.name}</span>
                {manifest && manifest.season && manifest.fechas.length > 0 && (
                  <span className="session-badge type-race">
                    {manifest.season} · Fecha {manifest.fechas.join("/")}
                  </span>
                )}
                <span className="event-row-count">{raceSessions} carreras</span>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
