import type { Metadata } from "next";
import Link from "next/link";
import { getChampionshipStats, samePerson, type PilotsStatsEntry } from "@/app/utils/pilotHistory";
import eventsManifest from "@/data/events/manifest.json";
import {
  loadAllEvents,
  aggregateFinalsByName,
  aggregateComebacks,
  computeTrackRecords,
  slugify,
} from "@/app/utils/eventData";
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
  const teamRows = stats.teams.filter((team) => team.titles > 0 || team.wins > 0);
  const maxTeamTitles = Math.max(1, ...teamRows.map((team) => team.titles));
  const record = stats.seasonRecord;

  // Poles por piloto (events importados de SpeedHive), sin mutar el cache.
  const poleCounts = new Map<string, number>();
  for (const event of eventsManifest.events) {
    for (const pole of event.poles) {
      const person = stats.people.find((entry) => samePerson(entry.name, pole.driver));
      if (!person) continue;
      poleCounts.set(person.name, (poleCounts.get(person.name) ?? 0) + 1);
    }
  }
  const showPoles = [...poleCounts.values()].some((count) => count > 0);

  // Finales reales y remontadas desde los eventos de SpeedHive.
  const events = loadAllEvents();
  const finalsByName = aggregateFinalsByName(events);
  const comebackRecords = aggregateComebacks(events);
  const trackRecords = computeTrackRecords(events);

  interface EffectiveStats {
    wins: number;
    podiums: number;
    races: number;
    pct: number;
    fromEvents: boolean;
  }

  const finalsByPerson = new Map<PilotsStatsEntry, { wins: number; podiums: number; finals: number }>();
  for (const [key, value] of finalsByName) {
    const person = stats.people.find((entry) => samePerson(entry.name, key));
    if (!person) continue;
    const agg = finalsByPerson.get(person) ?? { wins: 0, podiums: 0, finals: 0 };
    agg.wins += value.wins;
    agg.podiums += value.podiums;
    agg.finals += value.finals;
    finalsByPerson.set(person, agg);
  }

  const effective = (person: PilotsStatsEntry): EffectiveStats => {
    const finals = finalsByPerson.get(person);
    if (finals && finals.finals > 0) {
      return {
        wins: finals.wins,
        podiums: finals.podiums,
        races: finals.finals,
        pct: Math.round((finals.wins / finals.finals) * 100),
        fromEvents: true,
      };
    }
    return {
      wins: person.raceWins,
      podiums: person.racePodiums,
      races: person.races,
      pct: person.races > 0 ? Math.round((person.raceWins / person.races) * 100) : 0,
      fromEvents: false,
    };
  };

  // Récords de vuelta de los circuitos con eventos en el año en curso.
  const currentCircuits = new Set(
    events
      .filter((event) => event.startDate.startsWith("2026") && event.location)
      .map((event) => slugify(event.location!.name))
  );
  const circuitNames = new Map<string, string>();
  for (const event of events) {
    if (event.location) circuitNames.set(slugify(event.location.name), event.location.name);
  }
  const recordRows = [...trackRecords.entries()]
    .filter(([key]) => currentCircuits.has(key.split("|")[0]))
    .map(([key, record]) => ({ track: key.split("|")[0], record }))
    .sort((a, b) => a.track.localeCompare(b.track) || a.record.cls.localeCompare(b.record.cls));

  const raceWinners = [...stats.people]
    .filter((person) => {
      const finals = finalsByPerson.get(person);
      return finals ? finals.wins > 0 : person.raceWins > 0;
    })
    .sort((a, b) => {
      const ea = finalsByPerson.get(a);
      const eb = finalsByPerson.get(b);
      const winsA = ea ? ea.wins : a.raceWins;
      const winsB = eb ? eb.wins : b.raceWins;
      return winsB - winsA || b.racePodiums - a.racePodiums;
    })
    .slice(0, 15);

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
                  {showPoles && <th>Poles</th>}
                  <th>Podios</th>
                  <th>Carreras</th>
                  <th>% Victoria</th>
                </tr>
              </thead>
              <tbody>
                {raceWinners.map((person, index) => {
                  const statsNow = effective(person);
                  const pct = statsNow.pct;
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
                        <span className="big-metric signal">{statsNow.wins}</span>
                      </td>
                      {showPoles && (
                        <td className="race-points">
                          <span className={poleCounts.get(person.name) ? "pole-count" : undefined}>
                            {poleCounts.get(person.name) ?? 0}
                          </span>
                        </td>
                      )}
                      <td className="race-points">{statsNow.podiums}</td>
                      <td className="race-points">{statsNow.races}</td>
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

      {/* Mejores remontadas */}
      <section className="stats-section" aria-label="Mejores remontadas">
        <h2 className="stats-heading">
          Mejores remontadas
          <span className="heading-count">{Math.min(10, comebackRecords.length)}</span>
        </h2>
        <div className="table-container">
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th className="position">#</th>
                  <th className="player-cell">Piloto</th>
                  <th className="text-right">Posiciones ganadas</th>
                  <th>Categoría</th>
                  <th>Evento</th>
                </tr>
              </thead>
              <tbody>
                {comebackRecords.slice(0, 10).map((record, index) => {
                  const person = stats.people.find((entry) => samePerson(entry.name, record.name));
                  const profile = person
                    ? findPilotProfile(person.name, person.number, person.team)
                    : null;
                  return (
                    <tr
                      key={`${record.name}-${index}`}
                      className={index < 3 ? `podium-${index + 1}` : ""}
                      style={{ "--row": index } as React.CSSProperties}
                    >
                      <td className="position">
                        <span className="rank-chip">{index + 1}</span>
                      </td>
                      <td className="player-cell">
                        <span className="player-cell-text">
                          {profile ? (
                            <Link href={pilotLinkHref(profile)} className="driver-link">
                              {record.name}
                            </Link>
                          ) : (
                            record.name
                          )}
                        </span>
                      </td>
                      <td className="text-right">
                        <span className="big-metric signal">+{record.gained}</span>
                      </td>
                      <td className="race-points">{record.cls}</td>
                      <td className="race-points">
                        <Link href={`/eventos/${record.eventId}`} className="driver-link">
                          {record.eventName}
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Récords de vuelta */}
      {recordRows.length > 0 && (
        <section className="stats-section" aria-label="Récords de vuelta">
          <h2 className="stats-heading">
            Récords de vuelta
            <span className="heading-count">2026</span>
          </h2>
          <div className="table-container">
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th className="text-left">Circuito</th>
                    <th className="text-left">Categoría</th>
                    <th className="text-right">Récord</th>
                    <th className="player-cell">Piloto</th>
                    <th>Evento</th>
                  </tr>
                </thead>
                <tbody>
                  {recordRows.map(({ track, record }, index) => {
                    const person = stats.people.find((entry) => samePerson(entry.name, record.driver));
                    const profile = person
                      ? findPilotProfile(person.name, person.number, person.team)
                      : null;
                    return (
                      <tr
                        key={`${track}-${record.cls}`}
                        style={{ "--row": index } as React.CSSProperties}
                      >
                        <td className="text-left race-points" title={circuitNames.get(track) ?? track}>
                          {circuitNames.get(track) ?? track}
                        </td>
                        <td className="text-left race-points">{record.cls}</td>
                        <td className="text-right points-cell">{record.time}</td>
                        <td className="player-cell">
                          <span className="player-cell-text">
                            {profile ? (
                              <Link href={pilotLinkHref(profile)} className="driver-link">
                                {record.driver}
                              </Link>
                            ) : (
                              record.driver
                            )}
                          </span>
                        </td>
                        <td className="race-points">
                          <Link href={`/eventos/${record.eventId}`} className="driver-link">
                            {record.eventName}
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}

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
