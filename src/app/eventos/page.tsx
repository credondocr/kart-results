import type { Metadata } from "next";
import Link from "next/link";
import { loadEvent, formatDate } from "@/app/utils/eventData";
import eventsManifest from "@/data/events/manifest.json";
import Breadcrumb from "@/app/components/Breadcrumb";

export const metadata: Metadata = {
  title: "Eventos | Costa Rica Kart Championship",
  description:
    "Fines de semana de carrera del Costa Rica Kart Championship: prácticas, clasificaciones, prefinales y finales.",
};

interface EventCard {
  id: number;
  name: string;
  startDate: string;
  season: string | null;
  fechas: number[];
  location?: string;
  lengthLabel?: string;
  raceSessions: number;
}

export default function EventosPage() {
  const entries = [...eventsManifest.events].sort((a, b) =>
    b.startDate.localeCompare(a.startDate)
  );

  const cards: EventCard[] = [];
  for (const entry of entries) {
    const event = loadEvent(String(entry.id));
    if (!event) continue;
    const raceSessions = event.days.reduce(
      (count, day) => count + day.sessions.filter((session) => session.type !== "practice").length,
      0
    );
    cards.push({
      id: entry.id,
      name: event.name,
      startDate: entry.startDate,
      season: entry.season,
      fechas: entry.fechas,
      location: event.location?.name,
      lengthLabel: event.location?.lengthLabel,
      raceSessions,
    });
  }

  // Agrupación: año → temporada (más reciente primero; dentro del año,
  // invierno corre después del verano según el calendario CRKC).
  const byYear = new Map<string, Map<string, EventCard[]>>();
  for (const card of cards) {
    const seasons = byYear.get(card.startDate.slice(0, 4)) ?? new Map<string, EventCard[]>();
    const seasonKey = card.season ?? "otros";
    const list = seasons.get(seasonKey) ?? [];
    list.push(card);
    seasons.set(seasonKey, list);
    byYear.set(card.startDate.slice(0, 4), seasons);
  }

  return (
    <div className="max-w-6xl mx-auto px-4 pt-24 pb-16">
      <Breadcrumb />
      <h1 className="class-title my-4 text-4xl md:text-5xl">Eventos</h1>
      <p className="season-eyebrow">
        Fines de semana de carrera · <strong>{cards.length} importados</strong>
      </p>

      <div className="events-index">
        {[...byYear.entries()].map(([year, seasons]) => {
          const yearCount = [...seasons.values()].reduce((total, list) => total + list.length, 0);
          return (
            <section key={year} className="event-year" aria-label={`Temporada ${year}`}>
              <h2 className="stats-heading">
                {year}
                <span className="heading-count">
                  {yearCount} {yearCount === 1 ? "evento" : "eventos"}
                </span>
              </h2>

              {[...seasons.entries()].map(([season, list]) => (
                <div key={season} className="event-season">
                  <h3 className="category-label">
                    {season === "otros" ? "Otros" : season.charAt(0).toUpperCase() + season.slice(1)}
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {list.map((card) => (
                      <Link key={card.id} href={`/eventos/${card.id}`} className="team-card">
                        <div className="event-card-top">
                          <span className="session-badge type-race">
                            {card.fechas.length > 0 ? `Fecha ${card.fechas.join("/")}` : "Evento"}
                          </span>
                          <span className="chip-time">{formatDate(card.startDate)}</span>
                        </div>
                        <h4 className="team-card-name event-card-name">{card.name}</h4>
                        <p className="event-card-meta">
                          {card.location ?? "—"}
                          {card.lengthLabel ? ` · ${card.lengthLabel}` : ""}
                        </p>
                        <p className="team-card-count">
                          <strong>{card.raceSessions}</strong> sesiones de carrera
                        </p>
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </section>
          );
        })}
      </div>
    </div>
  );
}
