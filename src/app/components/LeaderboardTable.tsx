import Link from "next/link";
import { Category, Leaderboard, RaceResult } from "@/data/types";
import CountryFlag from "@/app/components/CountryFlag"
import TeamLogo from "@/app/components/TeamLogo";
import LeaderboardTeamTable from "./table/LeaderboardTeamTable";
import { findPilotProfile } from "@/app/utils/pilotLinks";

function driverName(result: RaceResult) {
  const link = findPilotProfile(result.driver, result.number, result.team);
  if (link) {
    return (
      <Link href={`/equipos/equipo/${link.slug}/${link.id}`} className="driver-link">
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
}> = ({ category, leaderboard, fecha }) => {

  const races = category.results.reduce((max, result) => Math.max(max, result.scores.length), 0);

  if (category.name == "Equipos") {
    return (
      <LeaderboardTeamTable leaderboard={leaderboard} category={category} />
    )
  }

  const inFechaMode = Boolean(fecha && fecha >= 1 && fecha <= races);
  const activeIndex = inFechaMode ? fecha! - 1 : -1;

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
                {[...Array(races).keys()].map((r, index) => (
                  <th
                    key={index}
                    className={index === activeIndex ? "race-points active" : "race-points"}
                  >
                    R{index + 1}
                  </th>
                ))}
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
                    {result.scores.map((score, index) => (
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
                      </td>
                    ))}
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
