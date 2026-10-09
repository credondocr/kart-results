import { Category, Leaderboard } from "@/data/types";
import CountryFlag from "@/app/components/CountryFlag"
import TeamLogo from "@/app/components/TeamLogo";
import LeaderboardTeamTable from "./table/LeaderboardTeamTable";

const LeaderboardTable: React.FC<{ category: Category, season: string, leaderboard: Leaderboard }> = ({ category, leaderboard }) => {

  const races = category.results.reduce((max, result) => Math.max(max, result.scores.length), 0);

  if (category.name == "Equipos") {
    return (
      <LeaderboardTeamTable leaderboard={leaderboard} category={category} />
    )
  }

  const totals = category.results.map((r) => (r.points || 0) - (r.worst || 0));
  const leaderTotal = totals.length > 0 ? Math.max(...totals) : 0;
  const maxGap = totals.length > 0 ? leaderTotal - Math.min(...totals) : 0;

  return (
    <div>
      {category.name && (
        <h3 className="text-2xl font-extrabold dark:text-white">
          Categoría {category.name}
        </h3>
      )}
      <div className="table-container">
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th className="position">Po</th>
                <th className="sticky-col race-number">No</th>
                <th className="driver-info">Piloto</th>
                {[...Array(races).keys()].map((r, index) => (
                  <th key={index} className="race-points">R{index + 1}</th>
                ))}
                <th className="total-points">Total</th>
                <th className="gap-cell">Gap</th>
                <th className="best-4-column">Best 4</th>
              </tr>
            </thead>
            <tbody>
              {category.results.map((result, index) => {
                const total = (result.points || 0) - (result.worst || 0);
                const gap = leaderTotal - total;
                const gapPct = maxGap > 0 ? Math.round((gap / maxGap) * 100) : 0;
                const podiumClass = result.rank && result.rank <= 3 ? ` podium-${result.rank}` : "";

                return (
                  <tr
                    key={result.rank}
                    className={podiumClass.trim()}
                    style={{ "--row": index } as React.CSSProperties}
                  >
                    <td className="position">
                      <span className="rank-chip">{result.rank}</span>
                    </td>
                    <td data-label="Nombre del Piloto" className="sticky-col race-number">{result.number}</td>
                    <td className="driver-info" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <CountryFlag countryCode={result.country} alt={result.country} />
                      <TeamLogo team={result.team} altText={result.team} />
                      {result.driver}
                    </td>
                    {result.scores.map((score, index) => (
                      <td
                        data-label={`R${index + 1}`}
                        key={index}
                        className={score === 0 ? "race-points zero" : "race-points"}
                      >
                        {score}
                      </td>
                    ))}
                    <td data-label="Total" className="total-points">{result.points}</td>
                    <td data-label="Gap" className="gap-cell">
                      <span className={gap === 0 ? "gap-value leader" : "gap-value"}>
                        {gap === 0 ? "—" : `+${gap}`}
                      </span>
                      <span className="gap-bar" style={{ "--gap": `${gapPct}%` } as React.CSSProperties} />
                    </td>
                    <td data-label="Best 4" className="best-4-column">{(result.points || 0) - result.worst}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>

  );
};

export default LeaderboardTable;
