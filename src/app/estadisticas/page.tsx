import type { Metadata } from "next";
import Link from "next/link";
import { getChampionshipStats } from "@/app/utils/pilotHistory";
import { findPilotProfile, pilotLinkHref } from "@/app/utils/pilotLinks";
import Breadcrumb from "@/app/components/Breadcrumb";
import TeamLogo from "@/app/components/TeamLogo";

export const metadata: Metadata = {
  title: "Estadísticas | Costa Rica Kart Championship",
  description:
    "Títulos, victorias y récords del Costa Rica Kart Championship.",
};

const pilotLink = (name: string, number: number | string, team: string, fallback: string) => {
  const profile = findPilotProfile(name, number, team);
  return profile ? (
    <Link href={pilotLinkHref(profile)} className="driver-link">{fallback}</Link>
  ) : (
    <span>{fallback}</span>
  );
};

export default function EstadisticasPage() {
  const stats = getChampionshipStats();
  const champions = stats.people.filter((person) => person.titles > 0);
  const raceWinners = [...stats.people]
    .filter((person) => person.raceWins > 0)
    .sort((a, b) => b.raceWins - a.raceWins || b.racePodiums - a.racePodiums)
    .slice(0, 15);
  const record = stats.seasonRecord;

  return (
    <div className="max-w-6xl mx-auto px-4 pt-24 pb-16">
      <Breadcrumb />
      <h1 className="class-title my-4 text-4xl md:text-5xl">Estadísticas</h1>
      <p className="season-eyebrow">
        Costa Rica Kart Championship · <strong>a la fecha</strong>
      </p>

      <div className="stats-hero mt-8">
        <div className="stat">
          <span className="stat-label">Carreras</span>
          <span className="stat-value">{stats.totals.races}</span>
        </div>
        <div className="stat">
          <span className="stat-label">Pilotos</span>
          <span className="stat-value">{stats.totals.pilots}</span>
        </div>
        <div className="stat">
          <span className="stat-label">Títulos</span>
          <span className="stat-value">{stats.totals.titles}</span>
        </div>
        <div className="stat">
          <span className="stat-label">Victorias</span>
          <span className="stat-value">{stats.totals.wins}</span>
        </div>
        {record && (
          <div className="stat stat-record">
            <span className="stat-label">Récord de temporada</span>
            <span className="stat-value">
              {record.points}
              <span className="stat-record-by">
                {record.driver} · {record.year} {record.season} · {record.classTitle}
                {record.categoryName ? ` · ${record.categoryName}` : ""}
              </span>
            </span>
          </div>
        )}
      </div>

      {/* Títulos */}
      <section className="stats-section" aria-label="Títulos">
        <h2 className="category-label">Títulos de temporada</h2>
        <div className="table-container">
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th className="position">#</th>
                  <th className="text-left driver-info">Piloto</th>
                  <th className="points-cell">Títulos</th>
                  <th>Subcampeonatos</th>
                  <th>Equipo actual</th>
                </tr>
              </thead>
              <tbody>
                {champions.map((person, index) => (
                  <tr
                    key={person.name}
                    className={index < 3 ? `podium-${index + 1}` : ""}
                    style={{ "--row": index } as React.CSSProperties}
                  >
                    <td className="position">
                      <span className="rank-chip">{index + 1}</span>
                    </td>
                    <td className="driver-info" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      {pilotLink(person.name, person.number, person.team, person.name)}
                    </td>
                    <td className="points-cell">{person.titles}</td>
                    <td className="race-points">{person.subs}</td>
                    <td>
                      <TeamLogo team={person.team} altText={person.team} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Victorias en carrera */}
      <section className="stats-section" aria-label="Victorias en carrera">
        <h2 className="category-label">Victorias en carrera</h2>
        <div className="table-container">
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th className="position">#</th>
                  <th className="text-left driver-info">Piloto</th>
                  <th className="points-cell">Victorias</th>
                  <th>Podios</th>
                  <th>Carreras</th>
                  <th>% Victoria</th>
                </tr>
              </thead>
              <tbody>
                {raceWinners.map((person, index) => (
                  <tr
                    key={person.name}
                    className={index < 3 ? `podium-${index + 1}` : ""}
                    style={{ "--row": index } as React.CSSProperties}
                  >
                    <td className="position">
                      <span className="rank-chip">{index + 1}</span>
                    </td>
                    <td className="driver-info" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      {pilotLink(person.name, person.number, person.team, person.name)}
                    </td>
                    <td className="points-cell">{person.raceWins}</td>
                    <td className="race-points">{person.racePodiums}</td>
                    <td className="race-points">{person.races}</td>
                    <td className="race-points">
                      {Math.round((person.raceWins / person.races) * 100)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Títulos por equipo */}
      <section className="stats-section" aria-label="Títulos por equipo">
        <h2 className="category-label">Títulos por equipo</h2>
        <div className="table-container">
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th className="position">#</th>
                  <th className="text-left driver-info">Equipo</th>
                  <th className="points-cell">Títulos</th>
                  <th>Victorias</th>
                </tr>
              </thead>
              <tbody>
                {stats.teams
                  .filter((team) => team.titles > 0 || team.wins > 0)
                  .map((team, index) => (
                    <tr
                      key={team.team}
                      className={index < 3 ? `podium-${index + 1}` : ""}
                      style={{ "--row": index } as React.CSSProperties}
                    >
                      <td className="position">
                        <span className="rank-chip">{index + 1}</span>
                      </td>
                      <td className="driver-info" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <TeamLogo team={team.team} altText={team.team} />
                        <Link href={`/equipos/equipo/${team.team}`} className="driver-link">
                          {team.team.replace(/-/g, " ")}
                        </Link>
                      </td>
                      <td className="points-cell">{team.titles}</td>
                      <td className="race-points">{team.wins}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}
