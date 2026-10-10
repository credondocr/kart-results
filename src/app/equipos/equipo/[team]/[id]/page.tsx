import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getTeam } from "@/data/drivers/teams";
import {
  getPilotHistory,
  getPilotRacedCategories,
  getPilotCareerStats,
  getPilotRaceResults,
  formatYears,
  type CategoryStat,
} from "@/app/utils/pilotHistory";
import Breadcrumb from "@/app/components/Breadcrumb";
import DriverAvatar from "@/app/components/DriverAvatar";
import CountryFlag from "@/app/components/CountryFlag";
import TeamLogo from "@/app/components/TeamLogo";
import WhatsAppShare from "@/app/components/WhatsAppShare";
import { lookupRegistry, getTeamSegments } from "@/app/utils/pilotRegistry";
import { prettifyTeam, resolvePilot } from "@/app/utils/pilotProfile";
import { samePerson } from "@/app/utils/pilotHistory";
import eventsManifest from "@/data/events/manifest.json";

interface PageProps {
  params: Promise<{ team: string; id: string }>;
  searchParams?: Promise<{ p?: string | string[] }>;
}

export async function generateMetadata({ params, searchParams }: PageProps): Promise<Metadata> {
  const { team, id } = await params;
  const { p } = (await searchParams) ?? {};
  const hint = Array.isArray(p) ? p[0] : p;
  const pilot = resolvePilot((team ?? "").toLowerCase(), id, hint);
  if (!pilot) return { title: "Piloto | Costa Rica Kart Championship" };
  return {
    title: `${pilot.name} | Costa Rica Kart Championship`,
    description: `Ficha del piloto ${pilot.name} (#${pilot.kartNumber}) del Costa Rica Kart Championship.`,
  };
}

const seasonLabel = (season: string) =>
  season.charAt(0).toUpperCase() + season.slice(1);

export default async function PilotPage({ params, searchParams }: PageProps) {
  const { team, id } = await params;
  const { p } = (await searchParams) ?? {};
  const hint = Array.isArray(p) ? p[0] : p;
  const teamSlug = (team ?? "").toLowerCase();
  const knownTeam = getTeam(team);
  const pilot = resolvePilot(teamSlug, id, hint);
  if (!pilot) notFound();

  const meta = knownTeam ?? {
    slug: teamSlug,
    name: prettifyTeam(teamSlug),
    logo: "",
  };

  const history = getPilotHistory(pilot.name, pilot.kartNumber);
  const raceResults = getPilotRaceResults(pilot.name, pilot.kartNumber);

  // Un piloto puede correr con distintos números según la categoría/temporada.
  const kartNumbers: string[] = [];
  for (const entry of history) {
    const number = String(entry.number);
    if (!kartNumbers.includes(number)) kartNumbers.push(number);
  }
  const profileNumber = String(pilot.kartNumber);
  if (!kartNumbers.includes(profileNumber)) kartNumbers.push(profileNumber);
  const racedCategories = getPilotRacedCategories(pilot.name, pilot.kartNumber);
  const career = getPilotCareerStats(pilot.name, pilot.kartNumber);

  // Fuente de verdad: src/data/pilots.json (registro actualizado a mano).
  const registryEntry = lookupRegistry(pilot.name);
  const country = registryEntry?.country || pilot.country;
  const currentTeam = registryEntry?.team || pilot.teamLogo || teamSlug;
  const currentTeamName = getTeam(currentTeam)?.name ?? prettifyTeam(currentTeam);
  const teamSegments = getTeamSegments(registryEntry);

  const polesCount = eventsManifest.events.reduce(
    (total, event) =>
      total + event.poles.filter((pole) => samePerson(pole.driver, pilot.name)).length,
    0
  );

  // Progresión: una columna por participación (año · temporada · categoría).
  const progression = history
    .map((entry) => ({
      key: `${entry.year}-${entry.season}-${entry.classTitle}-${entry.categoryName}`,
      year: entry.year,
      season: entry.season,
      label: `${entry.season === "verano" ? "VER" : "INV"}${entry.year.slice(2)}`,
      category: entry.categoryName || entry.classTitle,
      points: entry.points,
      rank: entry.rank,
    }))
    .sort(
      (a, b) =>
        Number(a.year) - Number(b.year) ||
        (a.season === "verano" ? 0 : 1) - (b.season === "verano" ? 0 : 1)
    );
  const maxPoints = Math.max(1, ...progression.map((item) => item.points));
  const categories: CategoryStat[] =
    racedCategories.length > 0
      ? racedCategories
      : pilot.categories.map((label) => ({ label, years: [] as string[] }));

  return (
    <div className="max-w-6xl mx-auto px-4 pt-24 pb-16">
      <Breadcrumb />

      <div className="pilot-profile">
        <div className="pilot-profile-media">
          <DriverAvatar pilot={pilot} large />
        </div>

        <div className="pilot-profile-info">
          <p className="season-eyebrow" style={{ marginBottom: "0.5rem" }}>
            <Link href={`/equipos/equipo/${meta.slug}`} className="crumb">{meta.name}</Link>
          </p>
          <h1 className="class-title align-left text-4xl md:text-5xl">
            {pilot.name}
          </h1>

          <div className="pilot-profile-stats">
            <div className="stat">
              <span className="stat-label">{kartNumbers.length > 1 ? "Karts" : "Kart"}</span>
              <span className="stat-value">{kartNumbers.map((number) => `#${number}`).join(" · ")}</span>
            </div>
            <div className="stat">
              <span className="stat-label">País</span>
              <span className="stat-value with-media">
                <CountryFlag countryCode={country} alt={country} />
                {country || "—"}
              </span>
            </div>
            <div className="stat">
              <span className="stat-label">Equipo actual</span>
              <span className="stat-value with-media">
                <TeamLogo team={currentTeam} altText={currentTeamName} />
                {currentTeamName}
              </span>
            </div>
            {career.seasons > 0 && (
              <>
                <div className="stat">
                  <span className="stat-label">Victorias</span>
                  <span className="stat-value gold">{career.wins}</span>
                </div>
                <div className="stat">
                  <span className="stat-label">Podios</span>
                  <span className="stat-value">{career.podiums}</span>
                </div>
                <div className="stat">
                  <span className="stat-label">Títulos</span>
                  <span className="stat-value">{career.titles}</span>
                </div>
                {polesCount > 0 && (
                  <div className="stat">
                    <span className="stat-label">Poles</span>
                    <span className="stat-value">{polesCount}</span>
                  </div>
                )}
                <div className="stat">
                  <span className="stat-label">Temporadas</span>
                  <span className="stat-value">{career.seasons}</span>
                </div>
                <div className="stat">
                  <span className="stat-label">Puntos carrera</span>
                  <span className="stat-value">{career.points}</span>
                </div>
              </>
            )}
          </div>

          {teamSegments.length > 1 && (
            <div className="pilot-profile-teams">
              <span className="stat-label">Trayectoria de equipos</span>
              <div className="team-timeline">
                {teamSegments.map((segment, index) => (
                  <span key={`${segment.team}-${segment.years}`} className="team-timeline-group">
                    {index > 0 && (
                      <span className="timeline-sep" aria-hidden="true">→</span>
                    )}
                    <span className="team-timeline-item">
                      <TeamLogo team={segment.team} altText={segment.team} />
                      <span className="team-timeline-name">
                        {getTeam(segment.team)?.name ?? prettifyTeam(segment.team)}
                      </span>
                      <span className="tag-years">{segment.years}</span>
                    </span>
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="pilot-profile-categories">
            <span className="stat-label">Categorías corridas</span>
            <div className="flex flex-wrap gap-2 mt-2">
              {categories.length > 0 ? (
                categories.map((category) => (
                  <span key={category.label} className="tag-chip">
                    {category.label}
                    {category.years.length > 0 && (
                      <span className="tag-years"> · {formatYears(category.years)}</span>
                    )}
                  </span>
                ))
              ) : (
                <span className="tag-chip">Sin categorías registradas</span>
              )}
            </div>
          </div>

          {pilot.biography && <p className="pilot-profile-bio">{pilot.biography}</p>}

          <div className="pilot-profile-actions">
            <Link href={`/equipos/equipo/${meta.slug}`} className="back-link">
              ← Volver a {meta.name}
            </Link>
            <WhatsAppShare text={`${pilot.name} #${pilot.kartNumber} — ${meta.name} | CRKC`} />
          </div>
        </div>
      </div>

      {progression.length > 0 && (
        <section className="pilot-history" aria-label="Progresión por temporada">
          <h2 className="category-label">Progresión por temporada</h2>
          <div className="table-container">
            <div className="progression-chart">
              {progression.map((item) => (
                <div
                  key={item.key}
                  className="prog-column"
                  title={`${item.year} ${item.season} · ${item.category} · ${item.points} pts · ${item.rank}º lugar`}
                >
                  <span className="prog-points">{item.points}</span>
                  <div
                    className={item.rank <= 3 ? `prog-bar rank-${item.rank}` : "prog-bar"}
                    style={{ "--h": `${Math.max(8, Math.round((item.points / maxPoints) * 120))}px` } as React.CSSProperties}
                  />
                  <span className="prog-label">
                    {item.label}
                    <span className={item.rank === 1 ? "prog-rank gold" : "prog-rank"}>
                      {item.rank}º
                    </span>
                  </span>
                  <span className="prog-cat">{item.category}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="pilot-history" aria-label="Historial de temporadas">
        <h2 className="category-label">Historial de temporadas</h2>

        {history.length > 0 ? (
          <div className="table-container">
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th className="text-left">Temporada</th>
                    <th className="text-left">Clase / Categoría</th>
                    <th>Nº</th>
                    <th>Equipo</th>
                    <th className="position">Pos</th>
                    <th className="points-cell">Puntos</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((entry, index) => (
                    <tr
                      key={`${entry.year}-${entry.season}-${entry.classTitle}-${entry.categoryName}-${index}`}
                      className={entry.rank <= 3 ? `podium-${entry.rank}` : ""}
                      style={{ "--row": index } as React.CSSProperties}
                    >
                      <td className="text-left">
                        <span className="history-year">{entry.year}</span>
                        {" · "}
                        {seasonLabel(entry.season)}
                        {entry.rank === 1 && (
                          <span className="tag-chip champion">Campeón</span>
                        )}
                      </td>
                      <td className="text-left">
                        <span className="history-class">{entry.classTitle}</span>
                        {entry.categoryName && (
                          <span className="history-cat"> · {entry.categoryName}</span>
                        )}
                      </td>
                      <td>
                        <span className="history-number">#{entry.number}</span>
                      </td>
                      <td>
                        <TeamLogo team={entry.team} altText={entry.team} />
                      </td>
                      <td className="position">
                        <span className="rank-chip">{entry.rank}</span>
                      </td>
                      <td className="points-cell">{entry.points}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <p className="empty-state">Sin carreras en el historial todavía.</p>
        )}
      </section>

      <section className="pilot-history" aria-label="Resultados por carrera">
        <h2 className="category-label">Resultados por carrera</h2>

        {raceResults.length > 0 ? (
          <div className="table-container">
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th className="text-left">Temporada</th>
                    <th className="text-left">Clase / Categoría</th>
                    <th>Fecha</th>
                    <th>Nº</th>
                    <th className="position">Pos</th>
                    <th className="points-cell">Puntos</th>
                  </tr>
                </thead>
                <tbody>
                  {raceResults.map((race, index) => (
                    <tr
                      key={`${race.year}-${race.season}-${race.classTitle}-${race.fecha}-${index}`}
                      className={race.position <= 3 ? `podium-${race.position}` : ""}
                      style={{ "--row": index } as React.CSSProperties}
                    >
                      <td className="text-left">
                        <span className="history-year">{race.year}</span>
                        {" · "}
                        {seasonLabel(race.season)}
                      </td>
                      <td className="text-left">
                        <span className="history-class">{race.classTitle}</span>
                        {race.categoryName && (
                          <span className="history-cat"> · {race.categoryName}</span>
                        )}
                      </td>
                      <td>
                        <span className="tag-chip">R{race.fecha}</span>
                      </td>
                      <td>
                        <span className="history-number">#{race.number}</span>
                      </td>
                      <td className="position">
                        <span className="rank-chip">{race.position}</span>
                      </td>
                      <td className="points-cell">{race.points}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <p className="empty-state">Sin carreras con puntaje todavía.</p>
        )}
      </section>
    </div>
  );
}
