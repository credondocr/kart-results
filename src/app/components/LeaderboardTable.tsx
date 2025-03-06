import { Category, Leaderboard } from "@/data/types";
import CountryFlag from "@/app/components/CountryFlag"
import TeamLogo from "@/app/components/TeamLogo";
import LeaderboardTeamTable from "./table/LeaderboardTeamTable";
const LeaderboardTable: React.FC<{ category: Category, season: string, leaderboard: Leaderboard }> = ({ category, season, leaderboard }) => {

  let races = 6

  if (season == "verano") {
    races = 5
  }

  if (category.name == "Equipos") {
    return (
      <LeaderboardTeamTable category={category} leaderboard={leaderboard} />
    )
  }
  return (
    <div>
      <h3 className="text-2xl font-extrabold dark:text-white">Categoría {category.name}</h3>
      <div className="table-container">
        <table border={1} cellPadding="10" style={{ width: "900px", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={{ textAlign: "center" }}>Po</th>
              <th style={{
                textAlign: "center",
                position: "sticky",
                left: 0,
                background: "black", // Color de fondo para que sea visible
                zIndex: 1,
              }}>No</th>
              <th>Piloto</th>
              {[...Array(races).keys()].map((r, index) => (
                <th key={index}>R{index + 1}</th>
              ))}
              <th>Total</th>
              <th style={{ textAlign: "center", background: "gray", color: "black" }}>Best 4</th>
            </tr>
          </thead>
          <tbody>
            {category.results.map((result) => (
              <tr key={result.rank}>
                <td data-label="Posición" style={{ textAlign: "center" }}>{result.rank}</td>
                <td data-label="Nombre del Piloto" style={{
                  textAlign: "center",
                  position: "sticky",
                  left: 0,
                  background: "black",
                  zIndex: 1,
                }}>{result.number}</td>
                <td style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <CountryFlag countryCode={result.country} alt={result.country} />
                  <TeamLogo team={result.team} altText={result.team} />
                  {result.driver}
                </td>
                {result.scores.map((score, index) => (
                  <td data-label={`R${index + 1}`} key={index} style={{ textAlign: "center" }}>{score}</td>
                ))}
                <td data-label="Total" style={{ textAlign: "center" }}>{result.points}</td>
                <td data-label="Best 4" style={{ textAlign: "center", background: "gray", color: "black" }}>{(result.points || 0) - result.worst}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>

  );
};

export default LeaderboardTable;