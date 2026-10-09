import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Drivers } from "@/data/drivers/data";
import { getTeam } from "@/data/drivers/teams";
import type { Pilot } from "@/data/types";
import {
  getPilotHistory,
  getPilotRacedCategories,
  getPilotCareerStats,
  findHistoryEntry,
  formatYears,
  type CategoryStat,
} from "@/app/utils/pilotHistory";
import Breadcrumb from "@/app/components/Breadcrumb";
import DriverAvatar from "@/app/components/DriverAvatar";
import CountryFlag from "@/app/components/CountryFlag";
import TeamLogo from "@/app/components/TeamLogo";

interface PageProps {
  params: Promise<{ team: string; id: string }>;
}

const prettifyTeam = (slug: string) =>
  slug
    .replace(/-/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());

function findDriverPilot(teamSlug: string, id: string): Pilot | undefined {
  const number = Number(id);
  if (!Number.isInteger(number)) return undefined;
  return Drivers.find(
    (driver) => driver.teamLogo.toLowerCase() === teamSlug && driver.kartNumber === number
  );
}

/** Ficha sintética para pilotos que solo existen en el historial de posiciones. */
function synthesizePilot(teamSlug: string, id: string, name: string): Pilot {
  const raced = getPilotRacedCategories(name, id);
  return {
    name,
    kartNumber: id,
    categories: raced.length > 0 ? raced.map((category) => category.label) : [],
    biography: "",
    country: "",
    teamName: prettifyTeam(teamSlug),
    profileUrl: "",
    teamLogo: teamSlug,
  };
}

function resolvePilot(teamSlug: string, id: string): Pilot | undefined {
  const driver = findDriverPilot(teamSlug, id);
  if (driver) return driver;

  const entry = findHistoryEntry(teamSlug, id);
  if (entry) return synthesizePilot(teamSlug, id, entry.driver);

  return undefined;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { team, id } = await params;
  const pilot = resolvePilot((team ?? "").toLowerCase(), id);
  if (!pilot) return { title: "Piloto | Costa Rica Kart Championship" };
  return {
    title: `${pilot.name} | Costa Rica Kart Championship`,
    description: `Ficha del piloto ${pilot.name} (#${pilot.kartNumber}) del Costa Rica Kart Championship.`,
  };
}

const seasonLabel = (season: string) =>
  season.charAt(0).toUpperCase() + season.slice(1);

export default async function PilotPage({ params }: PageProps) {
  const { team, id } = await params;
  const teamSlug = (team ?? "").toLowerCase();
  const knownTeam = getTeam(team);
  const pilot = resolvePilot(teamSlug, id);
  if (!pilot) notFound();

  const meta = knownTeam ?? {
    slug: teamSlug,
    name: prettifyTeam(teamSlug),
    logo: "",
  };

  const history = getPilotHistory(pilot.name, pilot.kartNumber);
  const racedCategories = getPilotRacedCategories(pilot.name, pilot.kartNumber);
  const career = getPilotCareerStats(pilot.name, pilot.kartNumber);
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
              <span className="stat-label">Kart</span>
              <span className="stat-value">#{pilot.kartNumber}</span>
            </div>
            <div className="stat">
              <span className="stat-label">País</span>
              <span className="stat-value with-media">
                <CountryFlag countryCode={pilot.country} alt={pilot.country} />
                {pilot.country || "—"}
              </span>
            </div>
            <div className="stat">
              <span className="stat-label">Equipo</span>
              <span className="stat-value with-media">
                <TeamLogo team={pilot.teamLogo} altText={meta.name} />
                {meta.name}
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

          <Link href={`/equipos/equipo/${meta.slug}`} className="back-link">
            ← Volver a {meta.name}
          </Link>
        </div>
      </div>

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
                      </td>
                      <td className="text-left">
                        <span className="history-class">{entry.classTitle}</span>
                        {entry.categoryName && (
                          <span className="history-cat"> · {entry.categoryName}</span>
                        )}
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
    </div>
  );
}
