import { Category, Leaderboard } from "@/data/types";
import TeamLogo from "@/app/components/TeamLogo";

interface TeamRow {
  name: string;
  logo: string;
  points: number;
}

const LeaderboardTeamTable: React.FC<{ leaderboard: Leaderboard; category?: Category }> = ({ leaderboard, category }) => {
  // Prefer the computed "Equipos" category (works for every season);
  // fall back to the static leaderboard.teams array used by older seasons.
  const rows: TeamRow[] =
    category && category.results.length > 0
      ? category.results.map((r) => ({
          name: r.team.replace(/-/g, " "),
          logo: r.team,
          points: r.points ?? 0,
        }))
      : (leaderboard?.teams ?? []).map((t) => ({
          name: t.name,
          logo: t.logo,
          points: t.points ?? 0,
        }));

  const sortedTeams = rows.slice().sort((a, b) => (b.points ?? 0) - (a.points ?? 0));

  return (
    <div>
      <h3 className="text-2xl font-extrabold dark:text-white">Puntos por Equipos</h3>
      <div className="table-container">
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th className="position">Po</th>
                <th className="driver-info">Equipo</th>
                <th className="total-points">Puntos</th>
              </tr>
            </thead>
            <tbody>
              {sortedTeams.map((result, index) => {
                const rank = index + 1;
                const podiumClass = rank <= 3 ? ` podium-${rank}` : "";
                return (
                  <tr key={result.logo} className={podiumClass} style={{ "--row": index } as React.CSSProperties}>
                    <td className="position">
                      <span className="rank-chip">{rank}</span>
                    </td>
                    <td className="driver-info" style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <TeamLogo team={result.logo} altText={result.logo} />
                      <span className="capitalize">{result.name}</span>
                    </td>
                    <td className="total-points">{result.points}</td>
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

export default LeaderboardTeamTable;
