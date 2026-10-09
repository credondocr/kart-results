import type { Metadata } from "next";
import Link from "next/link";
import { getChampionshipStats, type PilotsStatsEntry } from "@/app/utils/pilotHistory";
import { findPilotProfile, pilotLinkHref } from "@/app/utils/pilotLinks";
import Breadcrumb from "@/app/components/Breadcrumb";
import DriverAvatar from "@/app/components/DriverAvatar";
import TeamLogo from "@/app/components/TeamLogo";
import type { Pilot } from "@/data/types";

export const metadata: Metadata = {
  title: "Estadísticas | Costa Rica Kart Championship",
  description:
    "Títulos, victorias y récords del Costa Rica Kart Championship.",
};

const personToPilot = (person: PilotsStatsEntry): Pilot => ({
  name: person.name,
  kartNumber: person.number,
  categories: [],
  biography: "",
  country: "",
  teamName: person.team,
  profileUrl: "",
  teamLogo: person.team,
});

const PlayerCell = ({ person, subline }: { person: PilotsStatsEntry; subline?: string }) => {
  const profile = findPilotProfile(person.name, person.number, person.team);
  return (
    <td className="player-cell">
      <DriverAvatar pilot={personToPilot(person)} small />
      <span className="player-cell-text">
        {profile ? (
          <Link href={pilotLinkHref(profile)} className="driver-link">
            {person.name}
          </Link>
        ) : (
          <span>{person.name}</span>
        )}
        {subline && <span className="player-subline">{subline}</span>}
      </span>
    </td>
  );
};

export default function EstadisticasPage() {
  const stats = getChampionshipStats();
  const champions = stats.people.filter((person) => person.titles > 0);
  const raceWinners = [...stats.people]
    .filter((person) => person.raceWins > 0)
    .sort((a, b) => b.raceWins - a.raceWins || b.racePodiums - a.racePodiums)
    .slice(0, 15);
  const teamRows = stats.teams.filter((team) => team.titles > 0 || team.wins > 0);
  const maxTeamTitles = Math.max(1, ...teamRows.map((team) => team.titles));
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

      {/* Títulos de temporada */}
      <section className="stats-section" aria-label="Títulos de temporada">
        <h2 className="stats-heading">
          Títulos de temporada
          <span className="heading-count">{champions.length}</span>
        </h2>
        <div className="table-container">
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th className="position">#</th>
                  <th className="player-cell">Piloto</th>
                  <th className="text-right">Títulos</th>
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
                    <PlayerCell person={person} subline={person.titleYears.join(" · ")} />
                    <td className="text-right">
                      <span className="big-metric gold">{person.titles}</span>
                    </td>
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
        <h2 className="stats-heading">
          Victorias en carrera
          <span className="heading-count">{raceWinners.length}</span>
        </h2>
        <div className="table-container">
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th className="position">#</th>
                  <th className="player-cell">Piloto</th>
                  <th className="text-right">Victorias</th>
                  <th>Podios</th>
                  <th>Carreras</th>
                  <th>% Victoria</th>
                </tr>
              </thead>
              <tbody>
                {raceWinners.map((person, index) => {
                  const pct = Math.round((person.raceWins / person.races) * 100);
                  return (
                    <tr
                      key={person.name}
                      className={index < 3 ? `podium-${index + 1}` : ""}
                      style={{ "--row": index } as React.CSSProperties}
                    >
                      <td className="position">
                        <span className="rank-chip">{index + 1}</span>
                      </td>
                      <PlayerCell person={person} subline={person.team.replace(/-/g, " ")} />
                      <td className="text-right">
                        <span className="big-metric signal">{person.raceWins}</span>
                      </td>
                      <td className="race-points">{person.racePodiums}</td>
                      <td className="race-points">{person.races}</td>
                      <td className="pct-cell">
                        <span className="pct-value">{pct}%</span>
                        <span className="metric-bar" style={{ "--w": `${pct}%` } as React.CSSProperties} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Títulos por equipo */}
      <section className="stats-section" aria-label="Títulos por equipo">
        <h2 className="stats-heading">
          Títulos por equipo
          <span className="heading-count">{teamRows.length}</span>
        </h2>
        <div className="table-container">
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th className="position">#</th>
                  <th className="player-cell">Equipo</th>
                  <th className="text-right">Títulos</th>
                  <th>Victorias</th>
                </tr>
              </thead>
              <tbody>
                {teamRows.map((team, index) => (
                  <tr
                    key={team.team}
                    className={index < 3 ? `podium-${index + 1}` : ""}
                    style={{ "--row": index } as React.CSSProperties}
                  >
                    <td className="position">
                      <span className="rank-chip">{index + 1}</span>
                    </td>
                    <td className="player-cell">
                      <TeamLogo team={team.team} altText={team.team} />
                      <span className="player-cell-text">
                        <Link href={`/equipos/equipo/${team.team}`} className="driver-link">
                          {team.team.replace(/-/g, " ")}
                        </Link>
                      </span>
                    </td>
                    <td className="text-right">
                      <span className="big-metric gold">{team.titles}</span>
                      <span
                        className="metric-bar"
                        style={{ "--w": `${Math.round((team.titles / maxTeamTitles) * 100)}%` } as React.CSSProperties}
                      />
                    </td>
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
