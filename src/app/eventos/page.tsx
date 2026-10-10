import type { Metadata } from "next";
import Link from "next/link";
import { loadEvent, formatDate, type EventData } from "@/app/utils/eventData";
import eventsManifest from "@/data/events/manifest.json";
import Breadcrumb from "@/app/components/Breadcrumb";

export const metadata: Metadata = {
  title: "Eventos | Costa Rica Kart Championship",
  description:
    "Fines de semana de carrera del Costa Rica Kart Championship: prácticas, clasificaciones, prefinales y finales.",
};

export default function EventosPage() {
  const entries = [...eventsManifest.events].sort((a, b) =>
    b.startDate.localeCompare(a.startDate)
  );

  const cards = entries
    .map((entry) => {
      const event = loadEvent(String(entry.id));
      if (!event) return null;
      const raceSessions = event.days.reduce(
        (count, day) => count + day.sessions.filter((session) => session.type !== "practice").length,
        0
      );
      return { entry, event, raceSessions };
    })
    .filter(Boolean) as Array<{
    entry: (typeof eventsManifest.events)[number];
    event: EventData;
    raceSessions: number;
  }>;

  return (
    <div className="max-w-6xl mx-auto px-4 pt-24 pb-16">
      <Breadcrumb />
      <h1 className="class-title my-4 text-4xl md:text-5xl">Eventos</h1>
      <p className="season-eyebrow">
        Fines de semana de carrera · <strong>{cards.length} importados</strong>
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-10">
        {cards.map(({ entry, event, raceSessions }) => (
          <Link key={entry.id} href={`/eventos/${entry.id}`} className="team-card">
            <div className="event-card-top">
              <span className="session-badge type-race">
                {entry.season
                  ? `${entry.season} ${entry.year}`
                  : entry.year}
                {entry.fechas.length > 0 && ` · Fecha ${entry.fechas.join("/")}`}
              </span>
              <span className="chip-time">{formatDate(entry.startDate)}</span>
            </div>
            <h2 className="team-card-name event-card-name">{event.name}</h2>
            <p className="event-card-meta">
              {event.location?.name ?? "—"}
              {event.location?.lengthLabel ? ` · ${event.location.lengthLabel}` : ""}
            </p>
            <p className="team-card-count">
              <strong>{raceSessions}</strong> sesiones de carrera
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
