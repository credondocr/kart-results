import { Category, Leaderboard } from "@/data/types";
import TeamLogo from "@/app/components/TeamLogo";
const LeaderboardTeamTable: React.FC<{ category: Category, leaderboard: Leaderboard }> = ({ category, leaderboard }) => {
  console.log(leaderboard)
  return (
    <div>
      <h3 className="text-2xl font-extrabold dark:text-white">Puntos por Equipos</h3>
      <div className="table-container">
        <table border={1} cellPadding="10" style={{ width: "500px", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={{ textAlign: "center" }}>Po</th>
              <th style={{ textAlign: "left" }}>Equipo</th>
              <th style={{ textAlign: "center" }}>Puntos</th>
            </tr>
          </thead>
          <tbody>
            {leaderboard?.teams?.map((result, index) => (
              <tr key={index}>
                <td data-label="Posición" style={{ textAlign: "center" }}>{index + 1}</td>
                <td style={{ display: "flex", alignItems: "center", justifyContent: "left", gap: "10px" }}>
                  <TeamLogo team={result.logo} altText={result.logo} />
                  <span style={{ whiteSpace: "nowrap", overflow: "hidden", }}>
                    {result.name}
                  </span>
                </td>
                <td style={{ textAlign: "center", width: "30%" }}>{result.points}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LeaderboardTeamTable;