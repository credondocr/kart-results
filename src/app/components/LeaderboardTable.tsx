import { Category, Leaderboard } from "@/data/types";
import CountryFlag from "@/app/components/CountryFlag"
import TeamLogo from "@/app/components/TeamLogo";
import LeaderboardTeamTable from "./table/LeaderboardTeamTable";
const LeaderboardTable: React.FC<{ category: Category, season: string, leaderboard: Leaderboard }> = ({ category, season, leaderboard }) => {

  let races = 6

  if (season == "verano") {
    races = 5
  }

  if (season == "invierno" && leaderboard.year == 2025) {
    races = 5
  }

  if (category.name == "Equipos") {
    return (
      <LeaderboardTeamTable leaderboard={leaderboard} />
    )
  }
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
                <th className="best-4-column">Best 4</th>
              </tr>
            </thead>
            <tbody>
              {category.results.map((result) => (
                <tr key={result.rank}>
                  <td data-label="Posición" className="position">{result.rank}</td>
                  <td data-label="Nombre del Piloto" className="sticky-col race-number">{result.number}</td>
                  <td className="driver-info" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <CountryFlag countryCode={result.country} alt={result.country} />
                    <TeamLogo team={result.team} altText={result.team} />
                    {result.driver}
                  </td>
                  {result.scores.map((score, index) => (
                    <td data-label={`R${index + 1}`} key={index} className="race-points">
                      {score}
                    </td>
                  ))}
                  <td data-label="Total" className="total-points">{result.points}</td>
                  <td data-label="Best 4" className="best-4-column">{(result.points || 0) - result.worst}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>

  );
};

export default LeaderboardTable;