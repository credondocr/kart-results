import Link from "next/link";
import { Category, Leaderboard, RaceResult } from "@/data/types";
import CountryFlag from "@/app/components/CountryFlag"
import TeamLogo from "@/app/components/TeamLogo";
import LeaderboardTeamTable from "./table/LeaderboardTeamTable";
import { findPilotProfile, pilotLinkHref } from "@/app/utils/pilotLinks";
import { normalizeName } from "@/app/utils/pilotHistory";

const loose = (value: string) =>
  normalizeName(value).replace(/[^a-z0-9]+/g, " ").trim();

/** Equivalencias de nombre entre nuestras clases y las de SpeedHive. */
const CLASS_ALIASES: Record<string, string[]> = {
  "mini t4": ["t4 tilly mini"],
};

/** ¿El resultClass del evento corresponde a nuestra categoría? */
const matchesClass = (eventClass: string, categoryKey: string): boolean => {
  const eventKey = loose(eventClass);
  if (!eventKey || !categoryKey) return false;
  if (eventKey === categoryKey) return true;
  if (eventKey.startsWith(categoryKey + " ") || categoryKey.startsWith(eventKey + " ")) return true;
  return (CLASS_ALIASES[categoryKey] ?? []).some((alias) => loose(alias) === eventKey);
};

function driverName(result: RaceResult) {
  const link = findPilotProfile(result.driver, result.number, result.team);
  if (link) {
    return (
      <Link href={pilotLinkHref(link)} className="driver-link">
        {result.driver}
      </Link>
    );
  }
  return <span className="driver-name">{result.driver}</span>;
}

const LeaderboardTable: React.FC<{
  category: Category;
  season: string;
  leaderboard: Leaderboard;
  fecha?: number | null;
  classTitle?: string;
  eventsByFecha?: Record<number, { id?: number; fastest?: Array<{ cls: string; driver: string }> }>;
}> = ({ category, leaderboard, fecha, classTitle, eventsByFecha }) => {

  const races = category.results.reduce((max, result) => Math.max(max, result.scores.length), 0);

  if (category.name == "Equipos") {
    return (
      <LeaderboardTeamTable leaderboard={leaderboard} category={category} />
    )
  }

  const inFechaMode = Boolean(fecha && fecha >= 1 && fecha <= races);
  const activeIndex = inFechaMode ? fecha! - 1 : -1;
  const categoryKey = loose(category.name || classTitle || "");

  const displayResults = inFechaMode
    ? [...category.results].sort((a, b) => {
        const scoreDiff = (b.scores[activeIndex] ?? 0) - (a.scores[activeIndex] ?? 0);
        if (scoreDiff !== 0) return scoreDiff;
        return (b.points ?? 0) - (a.points ?? 0);
      })
    : category.results;

  return (
    <div>
      {category.name && (
        <h3 className="text-2xl font-extrabold dark:text-white">
          Categoría {category.name}
        </h3>
      )}
      <div className="table-container">
        {category.results.length === 0 ? (
          <p className="empty-state">Aún no hay resultados en esta categoría.</p>
        ) : (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th className="position">Po</th>
                <th className="sticky-col race-number">No</th>
                <th className="driver-info">Piloto</th>
                {[...Array(races).keys()].map((r, index) => {
                  const event = eventsByFecha?.[index + 1];
                  const label = `R${index + 1}`;
                  return (
                    <th
                      key={index}
                      className={index === activeIndex ? "race-points active" : "race-points"}
                    >
                      {event?.id ? (
                        <Link
                          href={`/eventos/${event.id}`}
                          className="race-link"
                          title={`Resultados de la ${label} en SpeedHive`}
                        >
                          {label}
                        </Link>
                      ) : (
                        label
                      )}
                    </th>
                  );
                })}
                <th className="total-points">Total</th>
                <th className="best-4-column">Best 4</th>
              </tr>
            </thead>
            <tbody>
              {displayResults.map((result, index) => {
                const displayRank = inFechaMode ? index + 1 : result.rank;
                const podiumClass = displayRank && displayRank <= 3 ? ` podium-${displayRank}` : "";

                return (
                  <tr
                    key={`${result.number}-${result.driver}`}
                    className={podiumClass.trim()}
                    style={{ "--row": index } as React.CSSProperties}
                  >
                    <td className="position">
                      <span className="rank-chip">{displayRank}</span>
                    </td>
                    <td data-label="Nombre del Piloto" className="sticky-col race-number">{result.number}</td>
                    <td className="driver-info" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <CountryFlag countryCode={result.country} alt={result.country} />
                      <TeamLogo team={result.team} altText={result.team} />
                      {driverName(result)}
                    </td>
                    {result.scores.map((score, index) => {
                      const eventInfo = eventsByFecha?.[index + 1];
                      const isFastest =
                        eventInfo?.fastest?.some(
                          (best) =>
                            matchesClass(best.cls, categoryKey) &&
                            normalizeName(best.driver) === normalizeName(result.driver)
                        ) ?? false;
                      return (
                        <td
                          data-label={`R${index + 1}`}
                          key={index}
                          className={[
                            "race-points",
                            score === 0 ? "zero" : "",
                            index === activeIndex ? "active" : "",
                          ].filter(Boolean).join(" ")}
                        >
                          {score}
                          {isFastest && score > 0 && (
                            <span
                              className="fastest-star"
                              title="Vuelta rápida: mejor tiempo de la fecha en esta categoría"
                              aria-label="Vuelta rápida de la fecha"
                            >
                              ★
                            </span>
                          )}
                        </td>
                      );
                    })}
                    <td data-label="Total" className="total-points">{result.points}</td>
                    <td data-label="Best 4" className="best-4-column">{(result.points || 0) - result.worst}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        )}
      </div>
    </div>

  );
};

export default LeaderboardTable;
