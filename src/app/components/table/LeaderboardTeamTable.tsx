import { Category } from "@/data/types";
import CountryFlag from "@/app/components/CountryFlag"
import TeamLogo from "@/app/components/TeamLogo";
const LeaderboardTeamTable: React.FC<{ category: Category, season: string }> = ({ category, season }) => {
  return (
    <div>
      <h3 className="text-2xl font-extrabold dark:text-white">Puntos por Equipos</h3>
      <div className="table-container">
        <table border={1} cellPadding="10" style={{ width: "400px", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={{ textAlign: "center" }}>Po</th>
              <th>Equipo</th>
                <th>Puntos</th>
            </tr>
          </thead>
          <tbody>
            {category.results.map((result) => (
              <tr key={result.rank}>
                <td data-label="Posición" style={{ textAlign: "center" }}>{result.rank}</td>
                <td style={{ display: "flex", alignItems: "center", gap: "8px", justifyContent:"center" }}>
                  <TeamLogo team={result.team} altText={result.team} />
                  {result.driver}
                </td>
                <td style={{ textAlign: "center" }}>{result.points}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>

  );
};

export default LeaderboardTeamTable;