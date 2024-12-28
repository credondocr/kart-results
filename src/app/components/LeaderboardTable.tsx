import { RaceResult, Category } from "@/data/mockData";
import CountryFlag from "@/app/components/CountryFlag"

const LeaderboardTable: React.FC<{ name: string, results: RaceResult[] }> = ({ name, results }) => {
  return (
    <div>
     <div>
            <h1 >{name}</h1>
          </div>

          <table border="1" cellPadding="10" style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th style={{ textAlign: "center" }}>Posición</th>
            <th style={{ textAlign: "center" }}>No</th>
            <th>Piloto</th>
            <th>Equipo</th>
            {[...Array(6).keys()].map((r, index) => (
              <th key={index}>R{index + 1}</th>
            ))}
            <th>Total</th>
            <th>Best 4</th>
          </tr>
        </thead>
        <tbody>
          {results.map((result) => (
            <tr key={result.rank}>
              <td style={{ textAlign: "center" }}>{result.rank}</td>
              <td style={{ textAlign: "center" }}>{result.number}</td>
              <td style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <CountryFlag style={{ width: "30px", height: "20px" }} countryCode={result.country} alt={result.country} />
                {result.driver}
              </td>
              <td style={{ textAlign: "center" }}>{result.team}</td>
              {result.scores.map((score, index) => (
                <td key={index} style={{ textAlign: "center" }}>{score}</td>
              ))}
              <td style={{ textAlign: "center" }}>{result.points}</td>
              <td style={{ textAlign: "center" }}>{result.points - result.worst}</td>
            </tr>
          ))}
        </tbody>
      </table>

      
    </div>
  );
};

export default LeaderboardTable;